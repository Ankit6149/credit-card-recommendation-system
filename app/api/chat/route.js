import {
  createChatCompletion,
  extractProfileFromText,
  mergeProfiles,
  isProfileComplete,
} from "../../lib/genai.js";

const CARD_INTENT_REGEX =
  /\b(credit card|card recommendation|card advise|best card|cashback|reward points|lounge|annual fee|joining fee|emi card|fuel card|travel card|finance card)\b/i;

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

function getFallbackResponse(messages, userProfile) {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ||
    "";
  const userAskedCards = CARD_INTENT_REGEX.test(lastUserMessage);

  if (!userAskedCards) {
    return {
      message:
        "I can chat on any topic. If you want credit-card help later, just ask and I will switch to card guidance.",
      intent: "general_chat",
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
    profileUpdates,
    mergedProfile,
    shouldShowRecommendations: profileComplete,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body?.messages || []);
    const userProfile =
      body?.userProfile && typeof body.userProfile === "object"
        ? body.userProfile
        : {};

    if (messages.length === 0) {
      return Response.json({ error: "Invalid message format" }, { status: 400 });
    }

    try {
      const aiResponse = await createChatCompletion({
        messages,
        currentProfile: userProfile,
      });
      return Response.json(aiResponse);
    } catch (aiError) {
      console.warn(
        "AI provider failed; fallback used:",
        aiError?.message || aiError,
      );
      return Response.json(getFallbackResponse(messages, userProfile));
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      {
        message: "I hit an error. Please retry in a moment.",
        intent: "general_chat",
        profileUpdates: {},
        mergedProfile: {},
        shouldShowRecommendations: false,
      },
      { status: 500 },
    );
  }
}
