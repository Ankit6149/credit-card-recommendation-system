"use client";

import { useState } from "react";

export default function UserInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="sticky bottom-4 z-20 mt-5">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-primary-700/60 bg-primary-950/90 p-2 shadow-[0_16px_40px_rgba(10,16,24,0.5)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message CardXpert Pro..."
            disabled={disabled}
            className="w-full rounded-xl border border-primary-700/60 bg-primary-900/80 px-4 py-3 text-sm text-primary-50 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/70"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 text-sm font-semibold text-primary-50 transition hover:from-primary-700 hover:to-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
