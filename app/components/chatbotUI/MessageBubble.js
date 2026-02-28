export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article className={`border-b border-primary-800/60 ${isUser ? "bg-primary-900/35" : "bg-primary-900/65"}`}>
      <div className="mx-auto flex w-full max-w-4xl items-start gap-3 px-4 py-5 sm:px-6">
        <div
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${
            isUser
              ? "bg-primary-700 text-primary-100"
              : "bg-gradient-to-br from-primary-500 to-accent-500 text-accent-50"
          }`}
        >
          {isUser ? "You" : "AI"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-primary-50">
            {message.content}
          </p>
          <p className="mt-2 text-[11px] tracking-wide text-primary-300">{time}</p>
        </div>
      </div>
    </article>
  );
}
