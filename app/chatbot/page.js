import Link from "next/link";
import ChatInterface from "../components/chatbotUI/ChatInterface";

export const metadata = {
  title: "CardXpert Pro - General Chat and Card Advisor",
  description:
    "Chat on any topic and get personalized credit card recommendations on demand",
};

export default function ChatbotPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-900 pb-10 pt-2">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-primary-600/60 bg-primary-800/70 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
          >
            <span aria-hidden>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="rounded-full border border-primary-600/50 bg-primary-900/55 px-3 py-1 text-xs text-primary-200">
            One-thread chat layout
          </div>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
