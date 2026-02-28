import Link from "next/link";

const FEATURE_CARDS = [
  {
    title: "AI-Guided Decisions",
    description:
      "Get recommendation logic that adapts to your income, spending pattern, and fee comfort.",
  },
  {
    title: "Cards Catalog",
    description:
      "Explore a structured cards directory with filters, ranking, and detailed benefit breakdowns.",
  },
  {
    title: "Mode-Based Chat",
    description:
      "Switch between General, Finance, and Cards mode to control conversation style instantly.",
  },
];

const QUICK_STATS = [
  { label: "Chat Modes", value: "4" },
  { label: "Card Data Sources", value: "API + Local" },
  { label: "Primary Focus", value: "India Cards" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-900 pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
        <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-primary-700/20 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-primary-700/50 bg-gradient-to-br from-primary-900/90 to-primary-950 p-6 shadow-[0_18px_55px_rgba(8,14,22,0.5)] sm:p-8">
            <p className="mb-4 inline-flex rounded-full border border-accent-500/50 bg-accent-700/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-100">
              Intelligent Credit Card Discovery
            </p>

            <h1 className="text-3xl font-semibold leading-tight text-primary-50 sm:text-5xl">
              CardXpert Pro
              <span className="block bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
                Find The Right Card Faster
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-primary-200 sm:text-base">
              Compare, evaluate, and chat through your decision with a
              production-ready AI assistant. CardXpert Pro helps you shortlist
              the best card options based on reward type, annual fee,
              eligibility, and your personal preferences.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chatbot"
                className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 text-sm font-semibold text-primary-50 transition hover:from-primary-700 hover:to-accent-700"
              >
                Start AI Chat
              </Link>
              <Link
                href="/cardsList"
                className="rounded-xl border border-primary-600/70 bg-primary-900/65 px-5 py-3 text-sm font-semibold text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
              >
                Browse All Cards
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-primary-700/50 bg-primary-900/85 p-6 shadow-[0_18px_55px_rgba(8,14,22,0.5)] sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-300">
              Platform Highlights
            </h2>
            <ul className="mt-5 space-y-3">
              {QUICK_STATS.map((item) => (
                <li
                  key={item.label}
                  className="rounded-xl border border-primary-700/60 bg-primary-800/55 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-wide text-primary-300">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-accent-100">
                    {item.value}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-primary-50 sm:text-2xl">
            Why use CardXpert Pro?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-primary-300 sm:text-base">
            A practical workflow for users who want both broad financial
            guidance and specific card recommendations without noise.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-primary-700/50 bg-primary-900/70 p-5 transition hover:-translate-y-0.5 hover:border-accent-500/50"
              >
                <h3 className="text-lg font-semibold text-primary-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-300">
                  {feature.description}
                </p>
                <div className="mt-4 h-1 w-10 rounded bg-gradient-to-r from-primary-500 to-accent-500 transition group-hover:w-16"></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-primary-700/50 bg-primary-900/75 p-6">
            <h3 className="text-lg font-semibold text-primary-100">
              Need Recommendations?
            </h3>
            <p className="mt-2 text-sm text-primary-300">
              Enter Cards mode in chat, share your profile, and get suggestions
              aligned with your fee and benefit preferences.
            </p>
            <Link
              href="/chatbot"
              className="mt-4 inline-flex rounded-lg border border-accent-500/50 bg-accent-700/30 px-4 py-2 text-sm font-medium text-accent-100 transition hover:bg-accent-700/45"
            >
              Open Chatbot
            </Link>
          </article>

          <article className="rounded-2xl border border-primary-700/50 bg-primary-900/75 p-6">
            <h3 className="text-lg font-semibold text-primary-100">
              Prefer Manual Comparison?
            </h3>
            <p className="mt-2 text-sm text-primary-300">
              Explore cards in grid or list view, filter by reward type, and
              sort by name, issuer, or annual fee.
            </p>
            <Link
              href="/cardsList"
              className="mt-4 inline-flex rounded-lg border border-primary-600/70 bg-primary-800/70 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-accent-500/50 hover:text-accent-100"
            >
              Open Cards List
            </Link>
          </article>
        </section>
      </div>
    </div>
  );
}
