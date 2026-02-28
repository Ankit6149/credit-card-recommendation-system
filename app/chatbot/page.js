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
    <div className="relative min-h-screen overflow-hidden bg-primary-900 pb-8 pt-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-primary-700/55 bg-primary-900/88 p-4 shadow-[0_16px_45px_rgba(9,14,22,0.45)] lg:sticky lg:top-6">
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
                Chat modes and prompts are available in the chat header.
              </p>
            </div>
          </aside>

          <section>
            <ChatInterface />
          </section>
        </div>
      </div>
    </div>
  );
}
