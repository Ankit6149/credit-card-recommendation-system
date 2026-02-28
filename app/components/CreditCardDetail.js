"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "benefits", label: "Benefits" },
  { id: "fees", label: "Fees and Waivers" },
];

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

function display(value, fallback = "N/A") {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string" && !value.trim()) return fallback;
  return value;
}

function SourceBadge({ source }) {
  if (source === "external") {
    return (
      <span className="rounded-full border border-accent-500/50 bg-accent-700/35 px-3 py-1 text-xs font-medium text-accent-100">
        Live API Card
      </span>
    );
  }
  return (
    <span className="rounded-full border border-primary-600/50 bg-primary-800/45 px-3 py-1 text-xs font-medium text-primary-100">
      Local Dataset
    </span>
  );
}

export default function CreditCardDetail({ card, source = "local" }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  if (!card) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-20 top-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-primary-600/60 bg-primary-800/70 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
          >
            <span aria-hidden>&lt;-</span>
            <span>Back</span>
          </button>
          <SourceBadge source={source} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-primary-700/50 bg-gradient-to-br from-primary-900/90 to-primary-950 shadow-[0_18px_50px_rgba(9,14,22,0.45)] sm:rounded-3xl">
          <header className="relative border-b border-primary-700/60 bg-gradient-to-r from-primary-800/75 to-accent-800/35 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-300">
                  Credit Card Profile
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-primary-50 sm:text-3xl">{card.name}</h1>
                <p className="mt-1 text-sm text-primary-200 sm:text-base">{card.issuer}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-accent-500/40 bg-accent-700/30 px-3 py-1 text-xs text-accent-100">
                    {display(card.reward_type)}
                  </span>
                  <span className="rounded-full border border-primary-500/50 bg-primary-700/45 px-3 py-1 text-xs text-primary-100">
                    Annual Fee {formatCurrency(card.annual_fee)}
                  </span>
                </div>
              </div>

              <div className="relative h-20 overflow-hidden rounded-2xl border border-primary-700/50 bg-primary-900/70 sm:h-24">
                <Image
                  src="/cardxpert-card.svg"
                  alt={`${card.name} card image`}
                  fill
                  className="object-contain p-4"
                  sizes="420px"
                />
              </div>
            </div>
          </header>

          <div className="border-b border-primary-700/60 px-3 sm:px-6">
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-primary-600 text-primary-50"
                      : "text-primary-200 hover:bg-primary-800/70 hover:text-accent-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-5 sm:px-6 sm:py-6">
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-primary-300">Reward Type</p>
                    <p className="mt-1 text-sm font-semibold text-accent-100">
                      {display(card.reward_type)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-primary-300">Reward Rate</p>
                    <p className="mt-1 text-sm font-semibold text-accent-100">
                      {display(card.reward_rate)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-primary-300">Joining Fee</p>
                    <p className="mt-1 text-sm font-semibold text-accent-100">
                      {formatCurrency(card.joining_fee)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-primary-300">Annual Fee</p>
                    <p className="mt-1 text-sm font-semibold text-accent-100">
                      {formatCurrency(card.annual_fee)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                  <p className="text-sm font-semibold text-primary-100">Eligibility</p>
                  <p className="mt-2 text-sm text-primary-300">{display(card.eligibility)}</p>
                </div>

                <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                  <p className="text-sm font-semibold text-primary-100">Welcome Benefits</p>
                  <p className="mt-2 text-sm text-primary-300">
                    {display(card.welcome_benefits)}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "benefits" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                  <p className="text-sm font-semibold text-primary-100">Card Perks</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(card.perks || []).length ? (
                      card.perks.map((perk) => (
                        <span
                          key={perk}
                          className="rounded-full border border-primary-600/60 bg-primary-700/35 px-3 py-1 text-xs text-primary-100"
                        >
                          {perk}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-primary-300">No perks listed.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                  <p className="text-sm font-semibold text-primary-100">Milestone Benefits</p>
                  <p className="mt-2 text-sm text-primary-300">
                    {display(card.milestone_benefits)}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "fees" && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                    <p className="text-sm font-semibold text-primary-100">Joining Fee Waiver</p>
                    <p className="mt-2 text-sm text-primary-300">
                      {display(card.joining_fee_waiver)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary-700/50 bg-primary-900/65 p-4">
                    <p className="text-sm font-semibold text-primary-100">Annual Fee Waiver</p>
                    <p className="mt-2 text-sm text-primary-300">
                      {display(card.annual_fee_waiver)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary-700/50 bg-primary-800/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary-300">
                        Joining Fee
                      </p>
                      <p className="text-sm font-semibold text-accent-100">
                        {formatCurrency(card.joining_fee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary-300">
                        Annual Fee
                      </p>
                      <p className="text-sm font-semibold text-accent-100">
                        {formatCurrency(card.annual_fee)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-primary-700/60 bg-primary-950/55 px-4 py-4 sm:px-6">
            <Link
              href="/cardsList"
              className="inline-flex rounded-lg border border-accent-500/50 bg-accent-700/35 px-4 py-2 text-sm font-medium text-accent-100 transition hover:bg-accent-700/45"
            >
              Back to all cards
            </Link>
          </footer>
        </section>
      </div>
    </div>
  );
}
