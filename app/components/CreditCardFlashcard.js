import Image from "next/image";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function CreditCardFlashcard({ card }) {
  if (!card) return null;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-primary-700/50 bg-gradient-to-br from-primary-900 to-primary-950 shadow-[0_12px_32px_rgba(10,16,25,0.4)] transition duration-300 hover:-translate-y-1 hover:border-accent-500/50 hover:shadow-[0_18px_40px_rgba(10,16,25,0.55)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-500/20 blur-2xl"></div>

      <header className="relative border-b border-primary-700/60 bg-gradient-to-r from-primary-800/70 to-accent-800/25 px-5 py-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-primary-50">{card.name}</h3>
            <p className="text-sm text-primary-300">{card.issuer}</p>
          </div>
          <span className="rounded-full border border-accent-500/40 bg-accent-700/35 px-2.5 py-1 text-[11px] font-medium text-accent-100">
            {card.reward_type}
          </span>
        </div>

        <div className="relative h-14 overflow-hidden rounded-xl border border-primary-600/40 bg-primary-900/70">
          <Image
            src="/cardxpert-card.svg"
            alt={`${card.name} logo`}
            fill
            className="object-contain p-3 opacity-95"
            sizes="260px"
          />
        </div>
      </header>

      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-3">
            <p className="text-[11px] uppercase tracking-wider text-primary-300">Annual Fee</p>
            <p className="mt-1 text-sm font-semibold text-accent-100">
              {formatCurrency(card.annual_fee)}
            </p>
          </div>
          <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-3">
            <p className="text-[11px] uppercase tracking-wider text-primary-300">Reward Rate</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-accent-100">
              {card.reward_rate}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-primary-300">Top Perks</p>
          <div className="flex flex-wrap gap-2">
            {(card.perks || []).slice(0, 3).map((perk) => (
              <span
                key={perk}
                className="rounded-full border border-primary-600/60 bg-primary-700/35 px-2.5 py-1 text-[11px] text-primary-100"
              >
                {perk}
              </span>
            ))}
            {(card.perks || []).length > 3 && (
              <span className="rounded-full border border-accent-500/50 bg-accent-700/30 px-2.5 py-1 text-[11px] text-accent-100">
                +{card.perks.length - 3} more
              </span>
            )}
          </div>
        </div>

        <footer className="pt-1">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent-200">
            View details
            <span aria-hidden>-&gt;</span>
          </div>
        </footer>
      </div>
    </article>
  );
}
