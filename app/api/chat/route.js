import {
  createChatCompletion,
  extractProfileFromText,
  mergeProfiles,
  isProfileComplete,
} from "../../lib/genai.js";

const CARD_INTENT_REGEX =
  /\b(credit card|card recommendation|card advise|best card|cashback|reward points|lounge|annual fee|joining fee|emi card|fuel card|travel card|finance card)\b/i;
const ALLOWED_CHAT_MODES = new Set(["auto", "general", "finance", "cards"]);

function normalizeMessages(messages = []) {
  return messages
    .filter((item) => item && typeof item.content === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.trim().slice(0, 2000),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-40);
}

function missingProfileQuestion(profile = {}) {
  if (!profile.income) {
    return "What is your monthly income range (<20k, 20k-50k, 50k-1L, or 1L+)?";
  }
  if (!profile.spending?.length) {
    return "What are your top spending categories (fuel, travel, groceries, dining, shopping, bills)?";
  }
  if (!profile.benefits?.length) {
    return "Which benefits do you prefer (cashback, reward points, travel points, lounge access, low interest)?";
  }
  if (!profile.feePreference) {
    return "What annual fee do you prefer (free, low, medium, high)?";
  }
  return "I have enough details. I can recommend the best options now.";
}

function getFallbackResponse(messages, userProfile, chatMode = "auto") {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ||
    "";
  const userAskedCards =
    chatMode === "cards" ||
    (chatMode === "auto" && CARD_INTENT_REGEX.test(lastUserMessage));

  if (!userAskedCards) {
    const fallbackByMode =
      chatMode === "finance"
        ? "I can help with finance topics like budgeting, credit score, debt payoff, investing basics, taxes, and planning. What area do you want to start with?"
        : "I can chat on any topic. If you want credit-card help later, just ask and I will switch to card guidance.";
    const activeMode = chatMode === "finance" ? "finance" : "general";
    return {
      message: fallbackByMode,
      intent: chatMode === "finance" ? "finance_education" : "general_chat",
      activeMode,
      profileUpdates: {},
      mergedProfile: userProfile || {},
      shouldShowRecommendations: false,
    };
  }

  const profileUpdates = extractProfileFromText(lastUserMessage);
  const mergedProfile = mergeProfiles(userProfile, profileUpdates);
  const profileComplete = isProfileComplete(mergedProfile);
  const message = profileComplete
    ? "I can now recommend cards based on your profile. Say 'show my card recommendations' when you are ready."
    : missingProfileQuestion(mergedProfile);

  return {
    message,
    intent: profileComplete ? "card_recommendation" : "profile_collection",
    activeMode: "cards",
    profileUpdates,
    mergedProfile,
    shouldShowRecommendations: profileComplete,
  };
}

function getProviderIssueMessage(aiError) {
  const text = String(aiError?.message || "");

  if (/quota|too many requests|429|rate[- ]?limit/i.test(text)) {
    return "The AI provider quota is exceeded right now. Please retry in about a minute, or increase Gemini API quota/billing to restore full chat responses.";
  }

  if (/api key is missing/i.test(text)) {
    return "Gemini API key is not configured on the server. Add GEMINI_API_KEY and restart the app.";
  }

  if (/api key not valid|invalid api key|unauthenticated|permission|401|403/i.test(text)) {
    return "Gemini API key is invalid or unauthorized. Replace the key and restart the app.";
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body?.messages || []);
    const userProfile =
      body?.userProfile && typeof body.userProfile === "object"
        ? body.userProfile
        : {};
    const chatMode = ALLOWED_CHAT_MODES.has(body?.chatMode)
      ? body.chatMode
      : "auto";

    if (messages.length === 0) {
      return Response.json({ error: "Invalid message format" }, { status: 400 });
    }

    try {
      const aiResponse = await createChatCompletion({
        messages,
        currentProfile: userProfile,
        forcedMode: chatMode,
      });
      return Response.json(aiResponse);
    } catch (aiError) {
      console.warn(
        "AI provider failed; fallback used:",
        aiError?.message || aiError,
      );
      const providerIssueMessage = getProviderIssueMessage(aiError);
      if (providerIssueMessage) {
        const fallbackPayload = getFallbackResponse(messages, userProfile, chatMode);
        return Response.json({
          message: providerIssueMessage,
          intent: fallbackPayload.intent,
          activeMode: fallbackPayload.activeMode,
          profileUpdates: fallbackPayload.profileUpdates || {},
          mergedProfile: fallbackPayload.mergedProfile || userProfile || {},
          shouldShowRecommendations: false,
        });
      }
      return Response.json(getFallbackResponse(messages, userProfile, chatMode));
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      {
        message: "I hit an error. Please retry in a moment.",
        intent: "general_chat",
        activeMode: "general",
        profileUpdates: {},
        mergedProfile: {},
        shouldShowRecommendations: false,
      },
      { status: 500 },
    );
  }
}
