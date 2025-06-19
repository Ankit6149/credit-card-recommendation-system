import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const SYSTEM_PROMPT = `
You are CardXpert, a friendly credit card advisor. Ask ONE question at a time to gather:

1. Monthly income (in ranges like "20k-50k", "50k-1L", "1L+")
2. Main spending: fuel, travel, groceries, dining, shopping
3. Preferred benefits: cashback, travel points, lounge access
4. Annual fee preference: free, low (under 1000), medium (1000-5000), high (5000+)

Be conversational and friendly. After getting all info, say "Let me analyze your profile and suggest the best cards for you!"
`;

// Helper function for Gemini API calls
export async function createChatCompletion(messages) {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not found");
    }

    // Use the correct model name for current API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare conversation context
    const conversationHistory = messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get AI response. Please try again.");
  }
}

export { genAI };
