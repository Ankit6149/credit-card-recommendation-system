import Link from "next/link";
import ChatInterface from "../components/chatbotUI/ChatInterface";

export const metadata = {
  title: "CardXpert Pro - General Chat and Card Advisor",
  description:
    "Chat on any topic and get personalized credit card recommendations on demand",
};

const SIDEBAR_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cardsList", label: "Cards Directory" },
  { href: "/chatbot", label: "AI Chat" },
];

export default function ChatbotPage() {
  return (
    <div className="relative h-[100dvh] overflow-hidden bg-primary-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col px-3 py-3 sm:px-6 sm:py-4">
        <nav className="mb-3 shrink-0 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SIDEBAR_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  item.href === "/chatbot"
                    ? "bg-gradient-to-r from-primary-600 to-accent-600 text-primary-50"
                    : "border border-primary-700/60 bg-primary-800/70 text-primary-100 hover:border-accent-500/60 hover:text-accent-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-4">
          <aside className="hidden min-h-0 flex-col rounded-2xl border border-primary-700/55 bg-primary-900/88 p-4 shadow-[0_16px_45px_rgba(9,14,22,0.45)] lg:flex">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary-300">
              Navigation
            </p>
            <nav className="space-y-2">
              {SIDEBAR_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                    item.href === "/chatbot"
                      ? "bg-gradient-to-r from-primary-600 to-accent-600 text-primary-50"
                      : "border border-primary-700/60 bg-primary-800/60 text-primary-100 hover:border-accent-500/60 hover:text-accent-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 rounded-xl border border-primary-700/60 bg-primary-800/55 p-3">
              <p className="text-xs uppercase tracking-wide text-primary-300">Workspace</p>
              <p className="mt-1 text-sm text-primary-100">
                Modes stay pinned at the top while the chat thread scrolls.
              </p>
            </div>
          </aside>

          <section className="min-h-0">
            <ChatInterface />
          </section>
        </div>
      </div>
    </div>
  );
}
