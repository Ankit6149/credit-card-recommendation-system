"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CreditCardFlashcard from "../components/CreditCardFlashcard";
import createSlug from "../lib/helper";

const REWARD_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Cashback", value: "cashback" },
  { label: "Reward Points", value: "reward" },
  { label: "Travel", value: "travel" },
];

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
}

function SourceBadge({ source }) {
  if (source === "external") {
    return (
      <span className="rounded-full border border-accent-500/50 bg-accent-700/30 px-3 py-1 text-xs font-medium text-accent-100">
        Live API Source
      </span>
    );
  }

  return (
    <span className="rounded-full border border-primary-600/50 bg-primary-800/45 px-3 py-1 text-xs font-medium text-primary-100">
      Local Dataset Fallback
    </span>
  );
}

export default function CardsListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("local");

  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [rewardType, setRewardType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, rewardType, sortBy, sortOrder]);

  useEffect(() => {
    let active = true;

    const loadCards = async () => {
      setLoading(true);
      setError("");
      try {
        const query = buildQuery({
          page,
          pageSize,
          q: search,
          rewardType,
          sortBy,
          sortOrder,
        });

        const response = await fetch(`/api/cards?${query}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to fetch cards");
        }

        const payload = await response.json();
        if (!active) return;

        setCards(Array.isArray(payload.cards) ? payload.cards : []);
        setSource(payload.source || "local");
        setPagination(
          payload.pagination || {
            page: 1,
            pageSize: 12,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (err) {
        if (!active) return;
        setError(err.message || "Something went wrong");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCards();
    return () => {
      active = false;
    };
  }, [page, pageSize, search, rewardType, sortBy, sortOrder]);

  const isExternalSource = source === "external";

  const resultSummary = useMemo(() => {
    if (loading) return "Loading cards...";
    if (error) return "Unable to load cards";
    return `${pagination.total || cards.length} cards found`;
  }, [cards.length, error, loading, pagination.total]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-900 pb-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute -right-20 top-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-primary-600/60 bg-primary-800/60 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
          >
            <span aria-hidden>←</span>
            <span>Back to Home</span>
          </Link>
          <SourceBadge source={source} />
        </div>

        <section className="mb-6 rounded-3xl border border-primary-700/50 bg-gradient-to-br from-primary-900/85 to-primary-950/95 p-6 shadow-[0_18px_50px_rgba(9,14,22,0.45)]">
          <h1 className="text-3xl font-semibold text-primary-50 sm:text-4xl">
            Credit Cards Directory
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-200 sm:text-base">
            Explore and compare cards by fee, reward structure, and issuer.
            Search naturally and narrow by reward type to find the right fit.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by card, issuer, rewards..."
              className="lg:col-span-2 rounded-xl border border-primary-600/60 bg-primary-800/60 px-4 py-2.5 text-sm text-primary-50 placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-500/70"
            />

            <select
              value={rewardType}
              onChange={(event) => setRewardType(event.target.value)}
              className="rounded-xl border border-primary-600/60 bg-primary-800/60 px-3 py-2.5 text-sm text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500/70"
            >
              {REWARD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-primary-600/60 bg-primary-800/60 px-3 py-2.5 text-sm text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500/70"
            >
              <option value="name">Sort: Name</option>
              <option value="annual_fee">Sort: Annual Fee</option>
              <option value="issuer">Sort: Issuer</option>
            </select>

            <button
              onClick={() =>
                setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
              }
              className="rounded-xl border border-accent-500/40 bg-accent-700/30 px-4 py-2.5 text-sm font-semibold text-accent-100 transition hover:bg-accent-700/45"
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </section>

        <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-primary-300">{resultSummary}</p>

          <div className="inline-flex rounded-xl border border-primary-700/60 bg-primary-900/70 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "grid"
                  ? "bg-primary-600 text-primary-50"
                  : "text-primary-200 hover:text-accent-100"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "list"
                  ? "bg-primary-600 text-primary-50"
                  : "text-primary-200 hover:text-accent-100"
              }`}
            >
              List
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {!error && loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-primary-700/50 bg-primary-800/50"
              ></div>
            ))}
          </div>
        )}

        {!error && !loading && cards.length === 0 && (
          <div className="rounded-2xl border border-primary-700/60 bg-primary-900/75 px-5 py-8 text-center text-primary-200">
            No cards matched your filters.
          </div>
        )}

        {!error && !loading && cards.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.slug || createSlug(card.name)}
                href={`/cardsList/${card.slug || createSlug(card.name)}`}
                className="block"
              >
                <CreditCardFlashcard card={card} />
              </Link>
            ))}
          </div>
        )}

        {!error && !loading && cards.length > 0 && viewMode === "list" && (
          <div className="space-y-3">
            {cards.map((card) => (
              <Link
                key={card.slug || createSlug(card.name)}
                href={`/cardsList/${card.slug || createSlug(card.name)}`}
                className="block rounded-2xl border border-primary-700/50 bg-primary-900/80 px-4 py-4 transition hover:border-accent-500/45 hover:bg-primary-900"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-50">{card.name}</h3>
                    <p className="text-sm text-primary-300">{card.issuer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                    <div>
                      <p className="text-primary-300">Annual Fee</p>
                      <p className="font-semibold text-accent-100">
                        Rs {Number(card.annual_fee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-300">Reward Type</p>
                      <p className="font-semibold text-accent-100">{card.reward_type}</p>
                    </div>
                    <div>
                      <p className="text-primary-300">Reward Rate</p>
                      <p className="font-semibold text-accent-100">{card.reward_rate}</p>
                    </div>
                    <div className="self-end text-left lg:text-right">
                      <span className="text-sm font-semibold text-accent-200">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isExternalSource && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-primary-700/60 bg-primary-900/70 px-3 py-2 text-sm text-primary-100 transition hover:border-accent-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            <span className="rounded-lg border border-primary-700/60 bg-primary-900/70 px-3 py-2 text-sm text-primary-100">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-primary-700/60 bg-primary-900/70 px-3 py-2 text-sm text-primary-100 transition hover:border-accent-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
