"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import UserInput from "./UserInput";
import UserProfile from "./UserProfile";
import Recommendations from "./Recommendations";

const STARTER_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I am CardXpert Pro. Ask me anything. Use mode buttons to switch between general chat, finance guidance, and card advisory.",
  timestamp: new Date().toISOString(),
};

const CHAT_MODES = [
  { id: "auto", label: "Auto" },
  { id: "general", label: "General" },
  { id: "finance", label: "Finance" },
  { id: "cards", label: "Cards" },
];
const RESOLVED_MODES = new Set(["general", "finance", "cards"]);

const QUICK_PROMPTS = {
  auto: [
    "What all can you tell me in finance?",
    "How do I improve my credit score?",
    "Recommend a low fee cashback card",
  ],
  general: [
    "Plan my week for better productivity",
    "Explain this topic in simple words",
    "Give me a short daily routine idea",
  ],
  finance: [
    "How should I build an emergency fund?",
    "Explain debt snowball vs debt avalanche",
    "How does credit utilization impact score?",
  ],
  cards: [
    "Suggest cards for travel and lounge access",
    "Recommend a no annual fee cashback card",
    "Best cards for online shopping rewards",
  ],
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

function modeDescription(mode) {
  if (mode === "general") return "General assistant mode";
  if (mode === "finance") return "Finance education mode";
  if (mode === "cards") return "Credit-card advisory mode";
  return "Auto intent detection mode";
}

function modeLabel(mode) {
  if (mode === "general") return "General";
  if (mode === "finance") return "Finance";
  if (mode === "cards") return "Cards";
  return "General";
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [chatMode, setChatMode] = useState("auto");
  const [activeMode, setActiveMode] = useState("general");
  const scrollRef = useRef(null);
  const endRef = useRef(null);

  const quickPrompts = useMemo(
    () => QUICK_PROMPTS[chatMode] || QUICK_PROMPTS.auto,
    [chatMode],
  );

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedProfile = localStorage.getItem("userProfile");
    const savedRecommendationState = localStorage.getItem("showRecommendations");
    const savedChatMode = localStorage.getItem("chatMode");
    const savedActiveMode = localStorage.getItem("activeMode");

    if (savedMessages) setMessages(JSON.parse(savedMessages));
    else setMessages([STARTER_MESSAGE]);

    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedRecommendationState) setShowRecommendations(savedRecommendationState === "true");
    if (savedChatMode && CHAT_MODES.some((mode) => mode.id === savedChatMode)) {
      setChatMode(savedChatMode);
      if (savedChatMode !== "auto") setActiveMode(savedChatMode);
    }
    if (savedActiveMode && RESOLVED_MODES.has(savedActiveMode)) setActiveMode(savedActiveMode);
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
    localStorage.setItem("chatMode", chatMode);
  }, [chatMode]);

  useEffect(() => {
    localStorage.setItem("activeMode", activeMode);
  }, [activeMode]);

  useEffect(() => {
    if (chatMode !== "auto") {
      setActiveMode(chatMode);
    }
  }, [chatMode]);

  useEffect(() => {
    if (chatMode !== "cards" && showRecommendations) {
      setShowRecommendations(false);
    }
  }, [chatMode, showRecommendations]);

  useEffect(() => {
    if (!scrollRef.current) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, showRecommendations]);

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
          chatMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Chat request failed");

      const merged = data?.mergedProfile
        ? mergeProfiles(userProfile, data.mergedProfile)
        : mergeProfiles(userProfile, data?.profileUpdates || {});
      setUserProfile(merged);
      if (typeof data?.activeMode === "string" && RESOLVED_MODES.has(data.activeMode)) {
        setActiveMode(data.activeMode);
      }

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
    localStorage.removeItem("activeMode");
    setMessages([{ ...STARTER_MESSAGE, timestamp: new Date().toISOString() }]);
    setUserProfile({});
    setShowRecommendations(false);
    setActiveMode(chatMode === "auto" ? "general" : chatMode);
  };

  return (
    <div className="mx-auto h-full w-full max-w-5xl">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-primary-700/60 bg-primary-900/85 shadow-[0_16px_45px_rgba(9,14,22,0.45)] sm:rounded-2xl">
        <header className="shrink-0 border-b border-primary-700/60 bg-primary-900/95 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary-50 sm:text-xl">CardXpert Pro</h2>
              <p className="text-xs text-primary-300">{modeDescription(chatMode)}</p>
              <p className="mt-1 text-[11px] text-accent-200">
                Active now: {modeLabel(activeMode)}
                {chatMode === "auto" ? " (auto-detected)" : ""}
              </p>
            </div>
            <button
              onClick={clearChat}
              className="w-full rounded-lg border border-primary-600/70 bg-primary-900/55 px-3 py-2 text-xs font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100 sm:w-auto"
            >
              New Chat
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CHAT_MODES.map((mode) => {
              const isSelected = chatMode === mode.id;
              const isAutoActive = chatMode === "auto" && mode.id === activeMode;

              return (
                <button
                  key={mode.id}
                  onClick={() => setChatMode(mode.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-gradient-to-r from-primary-600 to-accent-600 text-primary-50"
                      : "border border-primary-600/60 bg-primary-800/70 text-primary-200 hover:border-accent-500/60 hover:text-accent-100"
                  } ${isAutoActive ? "ring-1 ring-accent-300/70" : ""}`}
                >
                  {mode.label}
                  {isAutoActive ? " (Active)" : ""}
                </button>
              );
            })}
          </div>
        </header>

        <div className="shrink-0 border-b border-primary-700/50 bg-primary-900/60 px-4 py-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-primary-600/60 bg-primary-800/55 px-3 py-1.5 text-xs text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <UserProfile userProfile={userProfile} onClear={clearChat} />
        </div>

        <section ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {isLoading && (
            <article className="border-b border-primary-800/60 bg-primary-900/65">
              <div className="mx-auto flex w-full max-w-4xl items-start gap-3 px-3 py-5 sm:px-6">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-[11px] font-semibold text-accent-50">
                  AI
                </div>
                <div className="flex items-center gap-1.5 pt-2">
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
            </article>
          )}

          <Recommendations userProfile={userProfile} show={showRecommendations} />
          <div ref={endRef} />
        </section>

        <div className="shrink-0 border-t border-primary-700/60 bg-primary-900/92 px-3 py-3 sm:px-6">
          <UserInput onSendMessage={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
