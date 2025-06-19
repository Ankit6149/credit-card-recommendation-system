import { createChatCompletion } from "../../lib/genai";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    console.log("Received messages:", messages); // Debug log

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    try {
      // Try Gemini API first
      const aiResponse = await createChatCompletion(messages);
      console.log("Sending response:", aiResponse); // Debug log
      return Response.json({ message: aiResponse });
    } catch (geminiError) {
      console.log("Gemini failed, using fallback:", geminiError.message);

      // Fallback to mock response if Gemini fails
      const mockResponse = getMockResponse(messages);
      return Response.json({ message: mockResponse });
    }
  } catch (error) {
    console.error("Chat API Error:", error);

    // Final fallback
    return Response.json(
      { error: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}

// Fallback mock response function
function getMockResponse(messages) {
  try {
    const lastMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    console.log("Processing message with mock:", lastMessage); // Debug log

    if (
      lastMessage.includes("income") ||
      lastMessage.includes("salary") ||
      lastMessage.includes("20k") ||
      lastMessage.includes("50k") ||
      lastMessage.includes("1l") ||
      lastMessage.includes("40k")
    ) {
      return "Great! Now tell me about your main spending categories. Do you spend more on fuel, travel, groceries, dining, or shopping?";
    } else if (
      lastMessage.includes("fuel") ||
      lastMessage.includes("travel") ||
      lastMessage.includes("dining") ||
      lastMessage.includes("groceries") ||
      lastMessage.includes("shopping")
    ) {
      return "Perfect! What kind of benefits are you looking for? Would you prefer cashback, travel points, or lounge access?";
    } else if (
      lastMessage.includes("cashback") ||
      lastMessage.includes("points") ||
      lastMessage.includes("lounge")
    ) {
      return "Excellent! One last question - what's your preference for annual fees? Free cards, low fees (under ₹1000), or are you okay with higher fees for better benefits?";
    } else if (
      lastMessage.includes("free") ||
      lastMessage.includes("low") ||
      lastMessage.includes("high")
    ) {
      return "Perfect! Let me analyze your profile and suggest the best cards for you!";
    } else {
      return "Hi! I'm CardXpert. What's your monthly income range? (e.g., 20k-50k, 50k-1L, 1L+)";
    }
  } catch (error) {
    console.error("Error in getMockResponse:", error);
    return "Hi! I'm CardXpert. How can I help you find the perfect credit card?";
  }
}
