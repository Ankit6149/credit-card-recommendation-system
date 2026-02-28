"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import UserInput from "./UserInput";
import UserProfile from "./UserProfile";
import Recommendations from "./Recommendations";

const STARTER_MESSAGE = {
  role: "assistant",
  content:
    "Hello. I am CardXpert Pro. You can chat with me on any topic, and when you ask for card advice I will switch to recommendation mode.",
  timestamp: new Date().toISOString(),
};

const QUICK_PROMPTS = [
  "What can you teach me in finance?",
  "How does credit score work?",
  "Recommend a low-fee travel credit card",
  "Create a monthly budgeting plan",
];

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
      <div className="relative mx-auto w-full max-w-6xl pb-32">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-600/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl"></div>

        <div className="relative overflow-hidden rounded-3xl border border-primary-700/50 bg-primary-950/80 shadow-[0_18px_60px_rgba(10,16,25,0.55)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(183,131,67,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(76,107,138,0.22),transparent_38%)]"></div>

          <div className="relative border-b border-primary-700/60 bg-gradient-to-r from-primary-700/70 to-accent-700/50 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-300"></span>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-100">
                    AI Assistant Online
                  </p>
                </div>
                <h1 className="text-2xl font-semibold text-primary-50">CardXpert Pro</h1>
                <p className="mt-1 text-sm text-primary-100">
                  General conversations plus expert finance and credit-card help on demand
                </p>
              </div>

              <button
                onClick={clearChat}
                className="rounded-xl border border-primary-300/30 bg-primary-900/40 px-4 py-2 text-sm font-medium text-accent-100 transition hover:bg-primary-900/80"
              >
                New Chat
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary-300/30 bg-primary-900/40 px-3 py-1 text-xs text-primary-100">
                General AI
              </span>
              <span className="rounded-full border border-accent-300/30 bg-accent-700/30 px-3 py-1 text-xs text-accent-100">
                Finance Expert
              </span>
              <span className="rounded-full border border-primary-300/30 bg-primary-900/40 px-3 py-1 text-xs text-primary-100">
                Credit Card Advisor
              </span>
            </div>
          </div>

          <UserProfile userProfile={userProfile} onClear={clearChat} />

          <div className="relative border-b border-primary-700/40 bg-primary-900/55 px-6 py-3">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary-300">
              Quick Start
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-primary-600/60 bg-primary-800/70 px-3 py-1.5 text-xs text-primary-100 transition hover:border-accent-500/70 hover:bg-primary-800 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[58vh] min-h-[420px] overflow-y-auto bg-primary-900/70 px-5 py-6 sm:px-6">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}

            {isLoading && (
              <div className="mb-5 flex items-end gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[1px]">
                  <div className="grid h-full w-full place-items-center rounded-full bg-primary-900 text-xs font-semibold text-accent-100">
                    AI
                  </div>
                </div>
                <div className="rounded-2xl rounded-bl-md border border-primary-600/50 bg-primary-800/95 px-4 py-3 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent-200"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-accent-300"
                      style={{ animationDelay: "0.12s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-accent-400"
                      style={{ animationDelay: "0.24s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <Recommendations userProfile={userProfile} show={showRecommendations} />
        </div>
      </div>

      <UserInput onSendMessage={sendMessage} disabled={isLoading} />
    </>
  );
}
