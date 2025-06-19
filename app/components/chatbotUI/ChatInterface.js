"use client";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import UserInput from "./UserInput";
import UserProfile from "./UserProfile";
import Recommendations from "./Recommendations";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const messagesEndRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedProfile = localStorage.getItem("userProfile");

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const greeting = {
        role: "assistant",
        content:
          "Hi! I'm CardXpert. What's your monthly income? (e.g., 50k, 75000, 1.2 lakh)",
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      if (isProfileComplete(profile)) {
        setShowRecommendations(true);
      }
    }
  }, []);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isProfileComplete = (profile) => {
    return profile.income && profile.spending && profile.benefits;
  };

  // Enhanced income detection function
  function detectIncomeRange(salaryInput) {
    const cleaned = salaryInput
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .toLowerCase();

    let salary = 0;

    // Check for 'k' notation (50k, 75k, etc.)
    const kMatch = cleaned.match(/(\d+)k/);
    if (kMatch) {
      salary = parseInt(kMatch[1]) * 1000;
    }

    // Check for 'lakh' notation (1.5 lakh, 2 lakh, etc.)
    const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)(?:\s*lakh|l)/);
    if (lakhMatch) {
      salary = parseFloat(lakhMatch[1]) * 100000;
    }

    // Check for direct numeric input (50000, 75000, etc.)
    const numericMatch = cleaned.match(/(\d{4,})/);
    if (numericMatch && !kMatch && !lakhMatch) {
      salary = parseInt(numericMatch[1]);
    }

    // Map salary to predefined ranges
    if (salary > 0) {
      if (salary < 20000) {
        return "<20k";
      } else if (salary >= 20000 && salary < 50000) {
        return "20k-50k";
      } else if (salary >= 50000 && salary < 100000) {
        return "50k-1L";
      } else if (salary >= 100000) {
        return "1L+";
      }
    }

    return null;
  }

  const extractUserData = (message) => {
    const text = message.toLowerCase();
    const newProfile = { ...userProfile };

    // Auto-detect income range
    const detectedRange = detectIncomeRange(text);
    if (detectedRange) {
      newProfile.income = detectedRange;
    }

    // Extract spending habits
    if (text.includes("fuel") || text.includes("petrol")) {
      newProfile.spending = newProfile.spending || [];
      if (!newProfile.spending.includes("fuel")) {
        newProfile.spending.push("fuel");
      }
    }
    if (text.includes("travel")) {
      newProfile.spending = newProfile.spending || [];
      if (!newProfile.spending.includes("travel")) {
        newProfile.spending.push("travel");
      }
    }
    if (text.includes("dining") || text.includes("food")) {
      newProfile.spending = newProfile.spending || [];
      if (!newProfile.spending.includes("dining")) {
        newProfile.spending.push("dining");
      }
    }
    if (text.includes("shopping") || text.includes("online")) {
      newProfile.spending = newProfile.spending || [];
      if (!newProfile.spending.includes("shopping")) {
        newProfile.spending.push("shopping");
      }
    }
    if (text.includes("groceries") || text.includes("grocery")) {
      newProfile.spending = newProfile.spending || [];
      if (!newProfile.spending.includes("groceries")) {
        newProfile.spending.push("groceries");
      }
    }

    // Extract benefits
    if (text.includes("cashback")) {
      newProfile.benefits = newProfile.benefits || [];
      if (!newProfile.benefits.includes("cashback")) {
        newProfile.benefits.push("cashback");
      }
    }
    if (text.includes("lounge")) {
      newProfile.benefits = newProfile.benefits || [];
      if (!newProfile.benefits.includes("lounge")) {
        newProfile.benefits.push("lounge");
      }
    }
    if (text.includes("travel points") || text.includes("miles")) {
      newProfile.benefits = newProfile.benefits || [];
      if (!newProfile.benefits.includes("travel points")) {
        newProfile.benefits.push("travel points");
      }
    }

    // Extract fee preference
    if (text.includes("free") || text.includes("no fee")) {
      newProfile.feePreference = "free";
    } else if (text.includes("low") || text.includes("under 1000")) {
      newProfile.feePreference = "low";
    } else if (text.includes("medium") || text.includes("1000-5000")) {
      newProfile.feePreference = "medium";
    }

    setUserProfile(newProfile);
    localStorage.setItem("userProfile", JSON.stringify(newProfile));

    return newProfile;
  };

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Extract user data
    const updatedProfile = extractUserData(message);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Check if we should show recommendations
      if (
        data.message.includes("analyze your profile") ||
        isProfileComplete(updatedProfile)
      ) {
        setTimeout(() => {
          setShowRecommendations(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("userProfile");
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm CardXpert. What's your monthly income? (e.g., 50k, 75000, 1.2 lakh)",
        timestamp: new Date().toISOString(),
      },
    ]);
    setUserProfile({});
    setShowRecommendations(false);
  };

  return (
    <>
      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto bg-primary-950 rounded-lg shadow-lg overflow-hidden mb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-primary-50 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">CardXpert AI</h1>
              <p className="text-primary-100">
                Your Personal Credit Card Advisor
              </p>
            </div>
            <button
              onClick={clearChat}
              className="bg-primary-700 bg-opacity-20 hover:bg-primary-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* User Profile */}
        <UserProfile userProfile={userProfile} onClear={clearChat} />

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 bg-primary-900">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-primary-100 rounded-lg p-4 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recommendations */}
        <Recommendations userProfile={userProfile} show={showRecommendations} />
      </div>

      {/* Floating Input - Separate from main container */}
      <UserInput onSendMessage={sendMessage} disabled={isLoading} />
    </>
  );
}
