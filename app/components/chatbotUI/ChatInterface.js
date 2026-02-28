"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import UserInput from "./UserInput";
import UserProfile from "./UserProfile";
import Recommendations from "./Recommendations";

const STARTER_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I am CardXpert Pro. We can chat about any topic. Ask for credit-card help whenever you want, and I will switch to card guidance.",
  timestamp: new Date().toISOString(),
};

function normalizeList(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function mergeProfiles(baseProfile = {}, updates = {}) {
  const base = baseProfile || {};
  const patch = updates || {};
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

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedProfile = localStorage.getItem("userProfile");
    const savedRecommendationState = localStorage.getItem("showRecommendations");

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([STARTER_MESSAGE]);
    }

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    if (savedRecommendationState) {
      setShowRecommendations(savedRecommendationState === "true");
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("showRecommendations", String(showRecommendations));
  }, [showRecommendations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    const outgoingMessages = [...messages, userMessage];

    setMessages(outgoingMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoingMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          userProfile,
          currentProfile: userProfile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Chat request failed");
      }

      const merged = data?.mergedProfile
        ? mergeProfiles(userProfile, data.mergedProfile)
        : mergeProfiles(userProfile, data?.profileUpdates || {});
      setUserProfile(merged);

      const assistantMessage = {
        role: "assistant",
        content:
          typeof data?.message === "string"
            ? data.message
            : "I can continue the conversation. Ask me anything.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data?.shouldShowRecommendations) {
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Chat UI error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I had trouble responding just now. Please retry, and I will continue from where we left off.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("showRecommendations");
    setMessages([
      {
        ...STARTER_MESSAGE,
        timestamp: new Date().toISOString(),
      },
    ]);
    setUserProfile({});
    setShowRecommendations(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto bg-primary-950 rounded-lg shadow-lg overflow-hidden mb-20">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-primary-50 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">CardXpert Pro</h1>
              <p className="text-primary-100">
                General AI chat with on-demand credit-card expertise
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

        <UserProfile userProfile={userProfile} onClear={clearChat} />

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

        <Recommendations userProfile={userProfile} show={showRecommendations} />
      </div>

      <UserInput onSendMessage={sendMessage} disabled={isLoading} />
    </>
  );
}
