import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function createSlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function estimateMonthlyIncome(incomeRange = "") {
  if (incomeRange === "<20k") return 15000;
  if (incomeRange === "20k-50k") return 35000;
  if (incomeRange === "50k-1L") return 75000;
  if (incomeRange === "1L+") return 120000;
  return null;
}

function detectMinimumIncomeFromEligibility(eligibility = "") {
  const text = normalizeText(eligibility);

  const monthlyLakh = text.match(/(\d+(?:\.\d+)?)\s*lakh\s*\/?\s*month/);
  if (monthlyLakh) {
    return Number.parseFloat(monthlyLakh[1]) * 100000;
  }

  const yearlyLpa = text.match(/(\d+(?:\.\d+)?)\s*lpa/);
  if (yearlyLpa) {
    return (Number.parseFloat(yearlyLpa[1]) * 100000) / 12;
  }

  const monthlyK = text.match(/(\d+(?:\.\d+)?)\s*k\s*\/?\s*month/);
  if (monthlyK) {
    return Number.parseFloat(monthlyK[1]) * 1000;
  }

  return null;
}

function spendingMatches(profileSpending = [], cardText = "") {
  const normalized = normalizeText(cardText);
  const categoryMap = {
    fuel: ["fuel", "petrol", "diesel"],
    travel: ["travel", "flight", "airline", "hotel", "lounge"],
    groceries: ["grocery", "groceries", "supermarket"],
    dining: ["dining", "restaurant", "food"],
    shopping: ["shopping", "online", "amazon", "flipkart", "myntra"],
    bills: ["bill", "utility", "electricity", "recharge"],
  };

  return profileSpending.filter((item) =>
    (categoryMap[item] || []).some((keyword) => normalized.includes(keyword)),
  );
}

function benefitMatches(profileBenefits = [], cardText = "") {
  const normalized = normalizeText(cardText);
  const benefitMap = {
    cashback: ["cashback", "cash back"],
    "reward points": ["reward", "points"],
    "travel points": ["miles", "travel points"],
    "lounge access": ["lounge"],
    "low interest": ["low interest", "emi", "interest"],
  };

  return profileBenefits.filter((item) =>
    (benefitMap[item] || []).some((keyword) => normalized.includes(keyword)),
  );
}

function feeScore(cardFee = 0, feePreference = "") {
  if (!feePreference) return 8;
  if (feePreference === "free") return cardFee === 0 ? 28 : 0;
  if (feePreference === "low") return cardFee <= 1000 ? 24 : cardFee <= 2500 ? 10 : 0;
  if (feePreference === "medium") {
    return cardFee > 1000 && cardFee <= 5000 ? 20 : cardFee <= 1000 ? 12 : 6;
  }
  if (feePreference === "high") return cardFee > 2000 ? 16 : 8;
  return 8;
}

function scoreCard(card, profile = {}) {
  const annualFee = Number(card.annual_fee || 0);
  const cardText = [
    card.reward_type,
    card.reward_rate,
    card.eligibility,
    ...(Array.isArray(card.perks) ? card.perks : []),
  ]
    .filter(Boolean)
    .join(" ");

  let score = 10;
  const reasons = [];

  score += feeScore(annualFee, profile.feePreference);
  if (profile.feePreference) {
    reasons.push(`Fee fit: ${profile.feePreference} preference`);
  }

  const userIncome = estimateMonthlyIncome(profile.income);
  const minIncome = detectMinimumIncomeFromEligibility(card.eligibility || "");
  if (userIncome && minIncome) {
    if (userIncome >= minIncome) {
      score += 18;
      reasons.push("Income likely matches eligibility");
    } else {
      score -= 8;
      reasons.push("Income may be below target eligibility");
    }
  } else if (userIncome) {
    score += 8;
  }

  const matchedSpending = spendingMatches(profile.spending || [], cardText);
  if (matchedSpending.length) {
    score += matchedSpending.length * 12;
    reasons.push(`Spend match: ${matchedSpending.join(", ")}`);
  }

  const matchedBenefits = benefitMatches(profile.benefits || [], cardText);
  if (matchedBenefits.length) {
    score += matchedBenefits.length * 14;
    reasons.push(`Benefit match: ${matchedBenefits.join(", ")}`);
  }

  if (annualFee === 0) {
    score += 5;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons:
      reasons.length > 0
        ? reasons
        : ["Balanced option for general spending and value"],
  };
}

export default function Recommendations({ userProfile, show }) {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;

    const loadCardsData = async () => {
      try {
        const response = await fetch("/api/cards?page=1&pageSize=30", {
          cache: "no-store",
        });
        const data = await response.json();
        setCardsData(Array.isArray(data?.cards) ? data.cards : []);
      } catch (error) {
        console.error("Error loading cards data:", error);
        setCardsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCardsData();
  }, [show]);

  const recommendations = useMemo(() => {
    if (!cardsData.length) return [];

    return cardsData
      .map((card) => {
        const result = scoreCard(card, userProfile);
        return {
          ...card,
          slug: card.slug || createSlug(card.name),
          annualFeeLabel: `Rs ${Number(card.annual_fee || 0).toLocaleString()}`,
          score: result.score,
          reason: result.reasons.join(" | "),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [cardsData, userProfile]);

  if (!show) return null;

  if (loading) {
    return (
      <section className="border-t border-primary-700/60 bg-primary-900/70 p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-primary-100 sm:text-lg">
          Loading recommendations...
        </h3>
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-primary-700/60 bg-primary-800/60 p-4">
              <div className="mb-2 h-4 w-3/4 rounded bg-primary-600/60"></div>
              <div className="mb-2 h-3 w-1/2 rounded bg-primary-600/55"></div>
              <div className="h-3 w-full rounded bg-primary-600/50"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!recommendations.length) {
    return (
      <section className="border-t border-primary-700/60 bg-primary-900/70 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-primary-100 sm:text-lg">
          No recommendations available right now.
        </h3>
      </section>
    );
  }

  return (
    <section className="border-t border-primary-700/60 bg-gradient-to-br from-primary-900/75 to-primary-950/75 p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-primary-100 sm:text-lg">
        Recommended cards for your profile
      </h3>

      <div className="space-y-3">
        {recommendations.map((card) => (
          <article
            key={card.slug}
            className="rounded-xl border border-primary-700/60 bg-primary-900/80 p-4 transition hover:border-accent-500/45"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-base font-semibold text-primary-50 sm:text-lg">
                    {card.name}
                  </h4>
                  <span className="rounded-full border border-accent-500/50 bg-accent-700/35 px-2 py-0.5 text-[11px] font-medium text-accent-100">
                    {Math.round(card.score)}% match
                  </span>
                </div>
                <p className="mb-2 text-sm text-primary-300">{card.issuer}</p>
                <p className="mb-3 text-sm leading-relaxed text-primary-200">{card.reason}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <p className="font-medium text-accent-100">Annual Fee: {card.annualFeeLabel}</p>
                  {card.reward_rate && (
                    <p className="text-primary-300">Reward: {card.reward_rate}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/cardsList/${card.slug}`}
                className="inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-2 text-sm font-medium text-primary-50 transition hover:from-primary-700 hover:to-accent-700 sm:w-auto"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-center sm:text-left">
        <Link
          href="/cardsList"
          className="text-sm font-medium text-accent-200 underline hover:text-accent-100"
        >
          View all credit cards
        </Link>
      </div>
    </section>
  );
}
