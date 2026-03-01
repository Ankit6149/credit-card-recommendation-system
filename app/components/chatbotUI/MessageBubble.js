export default function MessageBubble({ message }) {
  function buildBlocks(content = "") {
    const lines = String(content).split("\n");
    const blocks = [];
    let paragraphLines = [];
    let listType = null;
    let listItems = [];

    const flushParagraph = () => {
      if (!paragraphLines.length) return;
      blocks.push({
        type: "paragraph",
        content: paragraphLines.join(" ").trim(),
      });
      paragraphLines = [];
    };

    const flushList = () => {
      if (!listType || !listItems.length) return;
      blocks.push({
        type: listType,
        items: [...listItems],
      });
      listType = null;
      listItems = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        flushParagraph();
        if (listType && listType !== "ul") flushList();
        listType = "ul";
        listItems.push(line.replace(/^[-*]\s+/, "").trim());
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        flushParagraph();
        if (listType && listType !== "ol") flushList();
        listType = "ol";
        listItems.push(line.replace(/^\d+\.\s+/, "").trim());
        continue;
      }

      flushList();
      paragraphLines.push(line);
    }

    flushParagraph();
    flushList();
    return blocks.length
      ? blocks
      : [{ type: "paragraph", content: String(content || "").trim() }];
  }

  const isUser = message.role === "user";
  const blocks = buildBlocks(message.content);
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
          <div className="space-y-2 text-sm leading-6 text-primary-50 sm:text-[15px] sm:leading-7">
            {blocks.map((block, index) => {
              if (block.type === "ul") {
                return (
                  <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5 marker:text-primary-300">
                    {block.items.map((item, itemIndex) => (
                      <li key={`ul-item-${index}-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "ol") {
                return (
                  <ol
                    key={`ol-${index}`}
                    className="list-decimal space-y-1 pl-5 marker:text-primary-300"
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={`ol-item-${index}-${itemIndex}`}>{item}</li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={`p-${index}`} className="whitespace-pre-wrap">
                  {block.content}
                </p>
              );
            })}
          </div>
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
