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
  if (feePreference === "medium")
    return cardFee > 1000 && cardFee <= 5000 ? 20 : cardFee <= 1000 ? 12 : 6;
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
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Loading recommendations...
        </h3>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-accent-600 p-4 rounded-lg border border-gray-200">
              <div className="h-4 bg-primary-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-primary-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-primary-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-gradient-to-l from-accent-300 to-primary-500 border-t border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800">
          No recommendations available right now.
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-accent-300 to-primary-500 border-t border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Recommended cards for your profile
      </h3>

      <div className="space-y-4">
        {recommendations.map((card, index) => (
          <div
            key={index}
            className="bg-accent-200 p-4 rounded-lg border border-accent-500 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-primary-900 text-lg">{card.name}</h4>
                  <span className="bg-green-600 text-green-100 text-xs px-2 py-1 rounded-full">
                    {Math.round(card.score)}% match
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{card.issuer}</p>
                <p className="text-gray-700 text-sm mb-3">{card.reason}</p>
                <div className="flex items-center gap-4">
                  <p className="text-primary-600 font-medium">
                    Annual Fee: {card.annualFeeLabel}
                  </p>
                  {card.reward_rate && (
                    <p className="text-gray-600 text-sm">Reward: {card.reward_rate}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/cardsList/${card.slug}`}
                className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-accent-700 transition-all duration-300"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/cardsList"
          className="text-primary-600 hover:text-primary-700 font-medium underline"
        >
          View all credit cards
        </Link>
      </div>
    </div>
  );
}
