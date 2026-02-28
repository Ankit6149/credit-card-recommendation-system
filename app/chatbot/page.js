import ChatInterface from "../components/chatbotUI/ChatInterface";
import Link from "next/link";

export const metadata = {
  title: "CardXpert Pro - General Chat and Card Advisor",
  description:
    "Chat on any topic and get personalized credit card recommendations on demand",
};

function page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-900 pb-8 pt-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
        <div className="absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-700/20 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-primary-600/60 bg-primary-800/70 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
          >
            <span aria-hidden>←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-primary-700/40 bg-gradient-to-br from-primary-800/70 to-primary-950/80 p-6 shadow-[0_18px_50px_rgba(8,14,22,0.45)]">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-primary-300">
              AI Assistant Workspace
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-primary-50 sm:text-4xl">
              CardXpert Pro Chat
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-200">
              A conversational assistant for daily questions, finance learning,
              and credit-card recommendations when you ask for them.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary-500/50 bg-primary-700/40 px-3 py-1 text-xs text-primary-100">
                General Chat
              </span>
              <span className="rounded-full border border-accent-500/50 bg-accent-700/25 px-3 py-1 text-xs text-accent-100">
                Finance Guidance
              </span>
              <span className="rounded-full border border-primary-500/50 bg-primary-700/40 px-3 py-1 text-xs text-primary-100">
                Card Recommendations
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-accent-600/30 bg-gradient-to-br from-accent-700/20 to-primary-900/85 p-6 shadow-[0_18px_50px_rgba(8,14,22,0.45)]">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-accent-200">
              What You Can Do
            </p>
            <ul className="space-y-3 text-sm text-primary-100">
              <li className="rounded-xl border border-primary-700/50 bg-primary-900/40 p-3">
                Ask regular daily questions like any AI chatbot.
              </li>
              <li className="rounded-xl border border-primary-700/50 bg-primary-900/40 p-3">
                Learn finance basics, planning, and money concepts.
              </li>
              <li className="rounded-xl border border-primary-700/50 bg-primary-900/40 p-3">
                Request credit-card advice and get personalized suggestions.
              </li>
            </ul>
          </section>
        </div>

        <ChatInterface />

        <div className="mt-8 text-center">
          <p className="text-sm text-primary-300">
            Want to browse all cards?{" "}
            <Link
              href="/cardsList"
              className="font-medium text-accent-200 underline hover:text-accent-100"
            >
              View Card List
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
