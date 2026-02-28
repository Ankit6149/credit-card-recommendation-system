export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`mb-5 flex items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[1px]">
          <div className="h-full w-full rounded-full bg-primary-900 text-accent-100 text-xs font-semibold grid place-items-center">
            AI
          </div>
        </div>
      )}

      <div
        className={`max-w-[82%] md:max-w-[72%] px-4 py-3.5 rounded-2xl border shadow-md ${
          isUser
            ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white border-accent-300/20 rounded-br-md"
            : "bg-primary-800/95 text-accent-50 border-primary-600/50 rounded-bl-md"
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={`mt-2 text-[11px] tracking-wide ${
            isUser ? "text-accent-100/80" : "text-primary-300"
          }`}
        >
          {time}
        </p>
      </div>

      {isUser && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 p-[1px]">
          <div className="h-full w-full rounded-full bg-primary-950 text-accent-100 text-xs font-semibold grid place-items-center">
            You
          </div>
        </div>
      )}
    </div>
  );
}
