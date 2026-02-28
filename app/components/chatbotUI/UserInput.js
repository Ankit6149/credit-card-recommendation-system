"use client";
import { useState, useRef } from "react";

export default function UserInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput("");

      // Optional: refocus only after sending, but allow user to click elsewhere
      setTimeout(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary-700/60 bg-primary-950/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-4 pt-3 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl border border-primary-600/60 bg-primary-900/95 p-2 shadow-[0_14px_40px_rgba(12,18,28,0.45)]"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message CardXpert Pro..."
            disabled={disabled}
            className="w-full rounded-xl border border-primary-700/70 bg-primary-950/80 px-4 py-3 pr-28 text-accent-100 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/60 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-2.5 text-sm font-semibold text-accent-50 shadow-md transition-all duration-300 hover:from-primary-700 hover:to-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? "Thinking..." : "Send"}
          </button>

          <p className="mt-2 px-1 text-[11px] text-primary-300">
            Enter to send. Ask anything, and request credit-card advice when needed.
          </p>
        </form>
      </div>
    </div>
  );
}
