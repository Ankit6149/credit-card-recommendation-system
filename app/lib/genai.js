import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// When the model output cannot be parsed we fall back to this very
// generic reply so the UI still has something meaningful to show.
const FALLBACK_REPLY =
  "I'm here to chat about anything or help with credit cards. Ask me anything, and when you're ready for recommendations just share a bit about your income and spending habits.";

// Allowed intents returned by the AI. `general_chat` covers small talk,
// off-topic responses, and anything that doesn't fit the other finance-
// oriented categories.
const ALLOWED_INTENTS = new Set([
  "general_chat",
  "finance_education",
  "card_recommendation",
  "profile_collection",
]);

const SPENDING_ALIASES = {
  fuel: ["fuel", "petrol", "diesel", "gas"],
  travel: ["travel", "flight", "hotel", "trip", "airline"],
  groceries: ["grocery", "groceries", "supermarket"],
  dining: ["dining", "restaurant", "food", "eating out"],
  shopping: ["shopping", "online shopping", "amazon", "flipkart", "myntra"],
  bills: ["bill", "bills", "utilities", "electricity", "recharge"],
};

const BENEFIT_ALIASES = {
  cashback: ["cashback", "cash back"],
  "reward points": ["reward points", "points", "rewards"],
  "travel points": ["miles", "air miles", "travel points"],
  "lounge access": ["lounge", "airport lounge"],
  "low interest": ["low interest", "interest rate", "emi", "apr"],
};

const FEE_ALIASES = {
  free: ["free", "no annual fee", "zero fee", "lifetime free"],
  low: ["low fee", "under 1000", "below 1000", "up to 1000"],
  medium: ["medium fee", "1000-5000", "between 1000 and 5000"],
  high: ["high fee", "premium fee", "above 5000", "over 5000"],
};

const DOMAIN_SYSTEM_PROMPT = `You are CardXpert Pro, a production-grade AI assistant deployed in a customer-facing
application.

General behavior:
- Speak in a friendly, professional tone. You can chat naturally on any topic (movies, weather,
  coding, motivation, etc.) and use conversational language when appropriate.
- Maintain deep expertise in personal finance and credit cards (especially Indian cards).
- Never hallucinate or invent details about cards; if you are unsure consult the card catalog or
  respond that you are unsure and ask a clarifying question.
- Answer off-topic questions fully and helpfully. After addressing an unrelated topic, gently
  offer to return to credit-card/finance advice by saying something like "Let me know if you'd
  like help finding a card" or "Would you like to discuss cards again?".
- Do not ask more than one follow‑up question per turn. Keep replies concise but complete.
- If the user explicitly wants recommendations or shares profile data, update the profile
  schema accordingly and set intent to profile_collection/card_recommendation.

Profile schema:
- income: one of <20k, 20k-50k, 50k-1L, 1L+
- spending: array from fuel, travel, groceries, dining, shopping, bills
- benefits: array from cashback, reward points, travel points, lounge access, low interest
- feePreference: one of free, low, medium, high

Output contract:
- Return ONLY valid JSON and no markdown.
- JSON keys: reply, intent, profile_updates, should_show_recommendations
- intent must be one of general_chat, finance_education, card_recommendation,
  profile_collection
- profile_updates must always be an object with optional keys from the profile schema.
- should_show_recommendations should be true only if enough profile data exists.`;

let cardsCache = null;

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function hasAnyAlias(text, aliases) {
  return aliases.some((alias) => text.includes(alias));
}

function normalizeList(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function detectIncomeRange(rawText = "") {
  const text = normalizeText(rawText).replace(/,/g, "").replace(/\s+/g, " ");

  if (/(<\s*20k|below\s*20k|under\s*20k|less than\s*20000)/.test(text)) {
    return "<20k";
  }
  if (/20k\s*-\s*50k|20000\s*-\s*50000/.test(text)) {
    return "20k-50k";
  }
  if (/50k\s*-\s*1l|50000\s*-\s*100000/.test(text)) {
    return "50k-1L";
  }
  if (/1l\+|1 lakh\+|above 1 lakh|over 1 lakh/.test(text)) {
    return "1L+";
  }

  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|l)\b/);
  if (lakhMatch) {
    const monthly = Number.parseFloat(lakhMatch[1]) * 100000;
    if (monthly < 20000) return "<20k";
    if (monthly < 50000) return "20k-50k";
    if (monthly < 100000) return "50k-1L";
    return "1L+";
  }

  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) {
    const monthly = Number.parseFloat(kMatch[1]) * 1000;
    if (monthly < 20000) return "<20k";
    if (monthly < 50000) return "20k-50k";
    if (monthly < 100000) return "50k-1L";
    return "1L+";
  }

  const amountMatch = text.match(/\b(\d{4,7})\b/);
  if (amountMatch) {
    const monthly = Number.parseInt(amountMatch[1], 10);
    if (monthly < 20000) return "<20k";
    if (monthly < 50000) return "20k-50k";
    if (monthly < 100000) return "50k-1L";
    return "1L+";
  }

  return null;
}

function detectAliases(text, aliasMap) {
  return Object.entries(aliasMap)
    .filter(([, aliases]) => hasAnyAlias(text, aliases))
    .map(([normalizedValue]) => normalizedValue);
}

export function extractProfileFromText(input = "") {
  const text = normalizeText(input);

  const income = detectIncomeRange(text);
  const spending = detectAliases(text, SPENDING_ALIASES);
  const benefits = detectAliases(text, BENEFIT_ALIASES);

  let feePreference = null;
  for (const [value, aliases] of Object.entries(FEE_ALIASES)) {
    if (hasAnyAlias(text, aliases)) {
      feePreference = value;
      break;
    }
  }

  const profile = {};
  if (income) profile.income = income;
  if (spending.length) profile.spending = spending;
  if (benefits.length) profile.benefits = benefits;
  if (feePreference) profile.feePreference = feePreference;

  return profile;
}

function normalizeProfileShape(profile = {}) {
  const normalized = {};

  if (typeof profile.income === "string") {
    const income = profile.income.trim();
    if (income) normalized.income = income;
  }

  if (Array.isArray(profile.spending)) {
    normalized.spending = normalizeList(
      profile.spending.map((item) => normalizeText(item).trim()),
    );
  }

  if (Array.isArray(profile.benefits)) {
    normalized.benefits = normalizeList(
      profile.benefits.map((item) => normalizeText(item).trim()),
    );
  }

  if (typeof profile.feePreference === "string") {
    const fee = normalizeText(profile.feePreference).trim();
    if (fee) normalized.feePreference = fee;
  }

  return normalized;
}

export function mergeProfiles(baseProfile = {}, updates = {}) {
  const base = normalizeProfileShape(baseProfile);
  const patch = normalizeProfileShape(updates);

  return {
    ...base,
    ...patch,
    spending: normalizeList([
      ...(base.spending || []),
      ...(patch.spending || []),
    ]),
    benefits: normalizeList([
      ...(base.benefits || []),
      ...(patch.benefits || []),
    ]),
  };
}

export function isProfileComplete(profile = {}) {
  return Boolean(
    profile.income &&
    Array.isArray(profile.spending) &&
    profile.spending.length > 0 &&
    Array.isArray(profile.benefits) &&
    profile.benefits.length > 0 &&
    profile.feePreference,
  );
}

async function loadCardsCatalog() {
  if (cardsCache) return cardsCache;

  try {
    const cardsFilePath = path.join(
      process.cwd(),
      "public",
      "data",
      "cardsData.json",
    );
    const cardsRaw = await fs.readFile(cardsFilePath, "utf8");
    const cards = JSON.parse(cardsRaw);
    cardsCache = Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.error("Failed to load cards data for AI context:", error);
    cardsCache = [];
  }

  return cardsCache;
}

function buildCardsKnowledge(cards = []) {
  if (!cards.length) {
    return "No card catalog is available.";
  }

  // include the entire catalogue so the assistant has access to all cards; the
  // model can handle several dozen lines of context and will only look at what
  // it needs.
  return cards
    .map((card) => {
      const perks = Array.isArray(card.perks) ? card.perks.join(", ") : "";
      return [
        `name=${card.name || "Unknown"}`,
        `issuer=${card.issuer || "Unknown"}`,
        `annual_fee=${card.annual_fee ?? "NA"}`,
        `reward_type=${card.reward_type || "NA"}`,
        `reward_rate=${card.reward_rate || "NA"}`,
        `perks=${perks || "NA"}`,
      ].join(" | ");
    })
    .join("\n");
}

function conversationToText(messages = []) {
  return messages
    .slice(-14)
    .map((message) => {
      const role = message.role === "assistant" ? "assistant" : "user";
      return `${role}: ${String(message.content || "").trim()}`;
    })
    .join("\n");
}

function parseJsonFromModel(text = "") {
  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeIntent(intent = "") {
  if (ALLOWED_INTENTS.has(intent)) return intent;
  return "profile_collection";
}

function normalizeModelPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      reply: FALLBACK_REPLY,
      intent: "profile_collection",
      profile_updates: {},
      should_show_recommendations: false,
    };
  }

  return {
    reply:
      typeof payload.reply === "string" && payload.reply.trim()
        ? payload.reply.trim()
        : FALLBACK_REPLY,
    intent: normalizeIntent(payload.intent),
    profile_updates:
      payload.profile_updates && typeof payload.profile_updates === "object"
        ? payload.profile_updates
        : {},
    should_show_recommendations: Boolean(payload.should_show_recommendations),
  };
}

function buildPrompt({
  messages,
  currentProfile,
  heuristicProfile,
  cardsKnowledge,
}) {
  return `${DOMAIN_SYSTEM_PROMPT}

Current profile:
${JSON.stringify(currentProfile)}

Heuristic profile updates from latest user message:
${JSON.stringify(heuristicProfile)}

Card catalog:
${cardsKnowledge}

Conversation:
${conversationToText(messages)}

Respond now with the required JSON object only.`;
}

export async function createChatCompletion({
  messages = [],
  currentProfile = {},
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const cards = await loadCardsCatalog();

  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content || "";
  const heuristicProfile = extractProfileFromText(latestUserMessage);
  const normalizedCurrentProfile = normalizeProfileShape(currentProfile);

  const prompt = buildPrompt({
    messages,
    currentProfile: normalizedCurrentProfile,
    heuristicProfile,
    cardsKnowledge: buildCardsKnowledge(cards),
  });

  // send the prompt and parse the model response. if parsing fails we retry once
  // with an explicit reminder about the output contract so the UI still gets
  // something meaningful instead of the generic fallback.
  let modelPayload;
  {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    modelPayload = normalizeModelPayload(parseJsonFromModel(rawText));

    if (
      modelPayload.reply === FALLBACK_REPLY ||
      (modelPayload.intent === "profile_collection" &&
        !Object.keys(modelPayload.profile_updates).length)
    ) {
      // Try one more time if we clearly fell back due to parse issues
      const retryPrompt =
        prompt +
        "\n\n# REMINDER: output a single JSON object matching the contract exactly. " +
        "Do not include any commentary or markdown.";
      const retryResult = await model.generateContent(retryPrompt);
      const retryResp = await retryResult.response;
      const retryText = retryResp.text();
      const retryPayload = normalizeModelPayload(parseJsonFromModel(retryText));
      if (retryPayload.reply !== FALLBACK_REPLY) {
        modelPayload = retryPayload;
      }
    }
  }

  const mergedUpdates = mergeProfiles(
    heuristicProfile,
    modelPayload.profile_updates,
  );
  const mergedProfile = mergeProfiles(normalizedCurrentProfile, mergedUpdates);
  const shouldShowRecommendations =
    modelPayload.should_show_recommendations ||
    isProfileComplete(mergedProfile);

  return {
    message: modelPayload.reply,
    intent: modelPayload.intent,
    profileUpdates: mergedUpdates,
    mergedProfile,
    shouldShowRecommendations,
  };
}

export { genAI, FALLBACK_REPLY };
