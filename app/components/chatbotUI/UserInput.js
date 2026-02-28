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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-primary-700/60 bg-primary-950/90 p-2 shadow-[0_14px_35px_rgba(10,16,24,0.45)] backdrop-blur-xl sm:p-2.5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message CardXpert Pro..."
          disabled={disabled}
          className="w-full rounded-xl border border-primary-700/60 bg-primary-900/80 px-4 py-2.5 text-sm text-primary-50 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/70 sm:py-3"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-2.5 text-sm font-semibold text-primary-50 transition hover:from-primary-700 hover:to-accent-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-3"
        >
          {disabled ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}
