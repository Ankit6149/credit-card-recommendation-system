import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-flash-latest";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const FORCED_MODES = new Set(["auto", "general", "finance", "cards"]);
const CARD_INTENT_REGEX =
  /\b(credit card|card recommendation|card advise|best card|cashback|reward points|lounge|annual fee|joining fee|emi card|fuel card|travel card|finance card)\b/i;
const FALLBACK_REPLY =
  "I can chat on any topic. If you want credit-card recommendations, ask me and I will switch to card guidance.";
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

const DOMAIN_SYSTEM_PROMPT = `You are CardXpert Pro, a production-grade AI assistant.

Behavior:
- You can chat naturally on any topic and should stay on the user's current topic.
- Do not switch to credit-card recommendations unless card_mode=true.
- If card_mode=false, do not ask for income, spending, fee preference, or card profile details.
- If card_mode=true, provide strong finance and credit-card guidance using only the card catalog.
- Respect interaction_mode:
  - interaction_mode=general: stay in broad general chat only.
  - interaction_mode=finance: focus on finance education/advice but do not collect card profile.
  - interaction_mode=cards: focus on card advisory and profile collection.
  - interaction_mode=auto: infer from user intent.
- Never invent card facts that are missing from the card catalog.
- Ask at most one follow-up question in a turn.

Reply style:
- Adapt style to user request complexity.
- If the user asks a simple query (greeting, quick confirmation, short factual ask), reply in one concise line.
- For explanations, comparisons, advice, or multi-part answers, use structured text in reply:
  - short section titles when useful,
  - bullet points for options/highlights,
  - numbered steps for processes.
- Use short paragraphs and line breaks. Avoid one long paragraph for complex answers.
- Keep responses concise unless the user asks for deep detail.
- Reply text must be plain text only. Do not include markdown symbols like #, **, __, or backticks.

Profile schema:
- income: one of <20k, 20k-50k, 50k-1L, 1L+
- spending: array from fuel, travel, groceries, dining, shopping, bills
- benefits: array from cashback, reward points, travel points, lounge access, low interest
- feePreference: one of free, low, medium, high

Output contract:
- Return ONLY valid JSON and no markdown.
- JSON keys: reply, intent, profile_updates, should_show_recommendations
- intent must be one of general_chat, finance_education, card_recommendation, profile_collection
- profile_updates must be an object.
- if card_mode=false, profile_updates must be {} and should_show_recommendations must be false.`;

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

export function isCardIntentText(input = "") {
  return CARD_INTENT_REGEX.test(String(input));
}

function normalizeProfileShape(profile = {}) {
  const normalized = {};

  if (typeof profile.income === "string" && profile.income.trim()) {
    normalized.income = profile.income.trim();
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

  if (
    typeof profile.feePreference === "string" &&
    normalizeText(profile.feePreference).trim()
  ) {
    normalized.feePreference = normalizeText(profile.feePreference).trim();
  }

  return normalized;
}

export function mergeProfiles(baseProfile = {}, updates = {}) {
  const base = normalizeProfileShape(baseProfile);
  const patch = normalizeProfileShape(updates);
  const merged = {
    ...base,
    ...patch,
  };

  const spending = normalizeList([...(base.spending || []), ...(patch.spending || [])]);
  const benefits = normalizeList([...(base.benefits || []), ...(patch.benefits || [])]);

  if (spending.length) merged.spending = spending;
  else delete merged.spending;

  if (benefits.length) merged.benefits = benefits;
  else delete merged.benefits;

  return merged;
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
  if (!cards.length) return "No card catalog available.";

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
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeIntent(intent = "") {
  if (ALLOWED_INTENTS.has(intent)) return intent;
  return "general_chat";
}

function normalizeForcedMode(mode = "auto") {
  if (FORCED_MODES.has(mode)) return mode;
  return "auto";
}

function normalizeModelPayload(payload = {}) {
  if (!payload || typeof payload !== "object") {
    return {
      reply: FALLBACK_REPLY,
      intent: "general_chat",
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

function isSimpleUserMessage(input = "") {
  const text = String(input).trim().toLowerCase();
  if (!text) return false;
  if (text.length <= 24) return true;

  return (
    /^(hi|hello|hey|yo|thanks|thank you|ok|okay|cool|great|yes|no|sure|fine)[!. ]*$/.test(
      text,
    ) ||
    /^(what(?:'s| is) up|how are you)[?.! ]*$/.test(text)
  );
}

function sentenceSplit(text = "") {
  return String(text)
    .match(/[^.!?]+[.!?]?/g)
    ?.map((item) => item.trim())
    .filter(Boolean);
}

function hasListStructure(text = "") {
  const value = String(text);
  const hasBullets = /(^|\n)\s*[-*]\s+/.test(value);
  const hasNumbered = /(^|\n)\s*\d+\.\s+/.test(value);
  return hasBullets || hasNumbered;
}

function buildStructuredReply(text = "") {
  const compact = String(text).replace(/\s+/g, " ").trim();
  if (!compact) return FALLBACK_REPLY;

  const sentences = sentenceSplit(compact) || [compact];
  if (sentences.length === 1) {
    return compact;
  }

  if (sentences.length === 2) {
    return `${sentences[0]}\n\n${sentences[1]}`;
  }

  const lines = [...sentences];
  let closingQuestion = "";
  if (lines.length > 1 && /\?$/.test(lines.at(-1) || "")) {
    closingQuestion = lines.pop() || "";
  }

  const intro = lines.shift() || "";
  const secondLine = lines.shift() || "";
  const detailBullets = lines
    .slice(0, 4)
    .map((item) => item.replace(/^[-*]\s+/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const paragraphs = [intro];
  if (secondLine) {
    paragraphs.push(secondLine);
  }

  let formatted = paragraphs.join("\n\n");
  if (detailBullets.length >= 2) {
    formatted = `${formatted}\n\n${detailBullets.map((item) => `- ${item}`).join("\n")}`;
  } else if (detailBullets.length === 1) {
    formatted = `${formatted}\n\n${detailBullets[0]}`;
  }

  if (closingQuestion) {
    formatted = `${formatted}\n\n${closingQuestion}`;
  }

  return formatted.trim();
}

function normalizeReplyWhitespace(reply = "") {
  return String(reply)
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeInlineLists(reply = "") {
  const text = String(reply);

  // Convert inline dash lists into proper line-separated bullet lists.
  if (!/\n\s*[-*]\s+/.test(text)) {
    const dashListCount = (text.match(/\s-\s+/g) || []).length;
    if (dashListCount >= 2 || (dashListCount >= 1 && /:\s*-\s+/.test(text))) {
      const parts = text
        .split(/\s-\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const intro = parts.shift();
        return `${intro}\n${parts.map((item) => `- ${item}`).join("\n")}`;
      }
    }
  }

  return text;
}

function prettifyStructuredText(text = "") {
  const lines = String(text).split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    const isBullet = /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
    if (isBullet && output.length > 0 && output[output.length - 1].trim() !== "") {
      output.push("");
    }
    output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stripMarkdownArtifacts(reply = "") {
  return String(reply)
    .split(/\r?\n/)
    .map((rawLine) => {
      let line = rawLine.trimEnd();
      if (!line.trim()) return "";

      line = line.replace(/^#{1,6}\s+/, "");
      line = line.replace(/^>\s+/, "");
      line = line.replace(/^[-*]\s+\*\*(.+?)\*\*:\s*/i, "- $1: ");
      line = line.replace(/^\*\*(.+?)\*\*:\s*/i, "- $1: ");
      line = line.replace(/\*\*(.+?)\*\*/g, "$1");
      line = line.replace(/__(.+?)__/g, "$1");
      line = line.replace(/`([^`]+)`/g, "$1");
      line = line.replace(/^[-*]\s+/, "- ");

      return line.trimEnd();
    })
    .join("\n");
}

function enforceReplyStructure(reply = "", latestUserMessage = "") {
  const normalized = prettifyStructuredText(
    normalizeReplyWhitespace(normalizeInlineLists(stripMarkdownArtifacts(reply))),
  );
  if (!normalized) return FALLBACK_REPLY;

  if (isSimpleUserMessage(latestUserMessage)) {
    return normalized.replace(/\s+/g, " ").trim();
  }

  if (hasListStructure(normalized)) {
    return normalized;
  }

  return buildStructuredReply(normalized);
}

function buildPrompt({
  messages,
  currentProfile,
  heuristicProfile,
  cardsKnowledge,
  cardMode,
  forcedMode,
}) {
  return `${DOMAIN_SYSTEM_PROMPT}

Conversation mode:
- card_mode=${cardMode}
- interaction_mode=${forcedMode}
- If card_mode=false, stay in general chat and do not ask profile questions.
- If card_mode=true, use the profile schema and card catalog to guide card decisions.

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
  forcedMode = "auto",
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const cards = await loadCardsCatalog();

  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ||
    "";
  const recentUserText = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content || "")
    .join(" ");
  const normalizedMode = normalizeForcedMode(forcedMode);
  const detectedCardMode = isCardIntentText(recentUserText);
  const cardMode =
    normalizedMode === "cards"
      ? true
      : normalizedMode === "general" || normalizedMode === "finance"
        ? false
        : detectedCardMode;

  const normalizedCurrentProfile = normalizeProfileShape(currentProfile);
  const heuristicProfile = cardMode ? extractProfileFromText(latestUserMessage) : {};

  const prompt = buildPrompt({
    messages,
    currentProfile: normalizedCurrentProfile,
    heuristicProfile,
    cardsKnowledge: buildCardsKnowledge(cards),
    cardMode,
    forcedMode: normalizedMode,
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  const modelPayload = normalizeModelPayload(parseJsonFromModel(rawText));
  const formattedReply = enforceReplyStructure(modelPayload.reply, latestUserMessage);

  const mergedUpdates = cardMode
    ? mergeProfiles(heuristicProfile, modelPayload.profile_updates)
    : {};
  const mergedProfile = cardMode
    ? mergeProfiles(normalizedCurrentProfile, mergedUpdates)
    : normalizedCurrentProfile;
  const shouldShowRecommendations =
    cardMode &&
    (modelPayload.should_show_recommendations || isProfileComplete(mergedProfile));
  const activeMode =
    normalizedMode === "general"
      ? "general"
      : normalizedMode === "finance"
        ? "finance"
        : normalizedMode === "cards"
          ? "cards"
          : cardMode
            ? "cards"
            : modelPayload.intent === "finance_education"
              ? "finance"
              : "general";

  return {
    message: formattedReply,
    intent:
      normalizedMode === "general"
        ? "general_chat"
        : normalizedMode === "finance"
          ? "finance_education"
          : cardMode
            ? modelPayload.intent
            : modelPayload.intent === "finance_education"
              ? "finance_education"
              : "general_chat",
    activeMode,
    profileUpdates: mergedUpdates,
    mergedProfile,
    shouldShowRecommendations,
  };
}

export { genAI, FALLBACK_REPLY };
