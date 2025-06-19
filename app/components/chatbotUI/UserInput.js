// app/components/chatbot/UserInput.js
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-950 shadow-lg">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            className="flex-1 border text-accent-100 border-primary-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-primary-800 disabled:bg-primary-950  shadow-sm"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-gradient-to-r from-primary-600 to-accent-600 text-accent-50 px-6 py-3 rounded-lg hover:from-primary-700 hover:to-accent-700 disabled:bg-primary-800 transition-all duration-300 font-medium shadow-sm"
          >
            {disabled ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
