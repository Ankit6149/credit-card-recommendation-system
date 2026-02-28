"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import UserInput from "./UserInput";
import UserProfile from "./UserProfile";
import Recommendations from "./Recommendations";

const STARTER_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I am CardXpert Pro. Ask me anything. I stay in general chat by default and switch to card guidance when you request it.",
  timestamp: new Date().toISOString(),
};

const QUICK_STARTS = [
  "What all can you tell me in finance?",
  "How do I improve my credit score?",
  "Recommend a low fee cashback card",
  "Suggest cards for travel and lounge access",
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
  const endRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedProfile = localStorage.getItem("userProfile");
    const savedRecommendationState = localStorage.getItem("showRecommendations");

    if (savedMessages) setMessages(JSON.parse(savedMessages));
    else setMessages([STARTER_MESSAGE]);

    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedRecommendationState) setShowRecommendations(savedRecommendationState === "true");
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("showRecommendations", String(showRecommendations));
  }, [showRecommendations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

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
      if (!response.ok) throw new Error(data?.error || "Chat request failed");

      const merged = data?.mergedProfile
        ? mergeProfiles(userProfile, data.mergedProfile)
        : mergeProfiles(userProfile, data?.profileUpdates || {});
      setUserProfile(merged);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            typeof data?.message === "string"
              ? data.message
              : "I can continue the conversation. Ask me anything.",
          timestamp: new Date().toISOString(),
        },
      ]);

      if (data?.shouldShowRecommendations) setShowRecommendations(true);
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
    setMessages([{ ...STARTER_MESSAGE, timestamp: new Date().toISOString() }]);
    setUserProfile({});
    setShowRecommendations(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="rounded-3xl border border-primary-700/55 bg-primary-900/75 shadow-[0_18px_55px_rgba(9,14,22,0.45)] backdrop-blur-xl">
        <header className="border-b border-primary-700/60 bg-gradient-to-r from-primary-800/70 to-accent-800/30 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-300">Conversation</p>
              <h2 className="mt-1 text-xl font-semibold text-primary-50">CardXpert Pro</h2>
            </div>
            <button
              onClick={clearChat}
              className="rounded-lg border border-primary-600/70 bg-primary-900/55 px-3 py-2 text-xs font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
            >
              New Chat
            </button>
          </div>
        </header>

        <div className="border-b border-primary-700/50 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="rounded-full border border-primary-600/60 bg-primary-800/55 px-3 py-1.5 text-xs text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <UserProfile userProfile={userProfile} onClear={clearChat} />

        <section className="px-5 py-5">
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

          <div ref={endRef} />

          <UserInput onSendMessage={sendMessage} disabled={isLoading} />
        </section>

        <Recommendations userProfile={userProfile} show={showRecommendations} />
      </div>
    </div>
  );
}
