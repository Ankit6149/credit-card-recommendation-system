export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article
      className={`border-b border-primary-800/60 ${
        isUser ? "bg-primary-900/35" : "bg-primary-900/65"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-4xl items-start gap-2 px-3 py-4 sm:gap-3 sm:px-6 sm:py-5 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isUser && (
          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-[10px] font-semibold text-accent-50 sm:h-8 sm:w-8 sm:text-[11px]">
            AI
          </div>
        )}

        <div
          className={`min-w-0 ${
            isUser
              ? "max-w-[90%] text-right sm:max-w-[80%]"
              : "max-w-[92%] text-left sm:max-w-[86%]"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-6 text-primary-50 sm:text-[15px] sm:leading-7">
            {message.content}
          </p>
          <p className="mt-2 text-[11px] tracking-wide text-primary-300">{time}</p>
        </div>

        {isUser && (
          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-700 text-[10px] font-semibold text-primary-100 sm:h-8 sm:w-8 sm:text-[11px]">
            You
          </div>
        )}
      </div>
    </article>
  );
}
