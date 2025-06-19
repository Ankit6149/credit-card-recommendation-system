import Link from "next/link";
import { useState, useEffect } from "react";

export default function Recommendations({ userProfile, show }) {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cards data when component mounts
  useEffect(() => {
    const loadCardsData = async () => {
      try {
        const response = await fetch("/data/cardsData.json");
        const data = await response.json();
        setCardsData(data);
      } catch (error) {
        console.error("Error loading cards data:", error);
        // Fallback to hardcoded data if file loading fails
        setCardsData(getFallbackCards());
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadCardsData();
    }
  }, [show]);

  if (!show) return null;

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const calculateCardScore = (card, profile) => {
    let score = 0;

    // Income-based scoring
    if (profile.income) {
      if (profile.income === "1L+" && card.annual_fee <= 5000) {
        score += 30;
      } else if (profile.income === "50k-1L" && card.annual_fee <= 2000) {
        score += 25;
      } else if (profile.income === "20k-50k" && card.annual_fee <= 1000) {
        score += 20;
      } else if (profile.income === "<20k" && card.annual_fee === 0) {
        score += 15;
      }
    }

    // Benefits matching
    if (profile.benefits) {
      profile.benefits.forEach((benefit) => {
        if (
          card.reward_type &&
          card.reward_type.toLowerCase().includes(benefit.toLowerCase())
        ) {
          score += 25;
        }
        if (
          card.perks &&
          card.perks.some((perk) =>
            perk.toLowerCase().includes(benefit.toLowerCase())
          )
        ) {
          score += 15;
        }
      });
    }

    // Spending habits matching
    if (profile.spending) {
      profile.spending.forEach((spendingType) => {
        if (
          card.perks &&
          card.perks.some((perk) =>
            perk.toLowerCase().includes(spendingType.toLowerCase())
          )
        ) {
          score += 20;
        }
        // Special cases for reward types
        if (spendingType === "fuel" && card.reward_type?.includes("fuel")) {
          score += 25;
        }
        if (spendingType === "travel" && card.reward_type?.includes("travel")) {
          score += 25;
        }
        if (
          spendingType === "shopping" &&
          card.reward_type?.includes("shopping")
        ) {
          score += 25;
        }
      });
    }

    // Fee preference matching
    if (profile.feePreference) {
      if (profile.feePreference === "free" && card.annual_fee === 0) {
        score += 20;
      } else if (profile.feePreference === "low" && card.annual_fee <= 1000) {
        score += 15;
      } else if (
        profile.feePreference === "medium" &&
        card.annual_fee <= 5000
      ) {
        score += 10;
      }
    }

    return Math.min(score, 100); // Cap at 100%
  };

  const getRecommendations = () => {
    if (loading || cardsData.length === 0) {
      return getFallbackCards().slice(0, 2);
    }

    // Score all cards based on user profile
    const scoredCards = cardsData.map((card) => ({
      ...card,
      score: calculateCardScore(card, userProfile),
      slug: card.slug || createSlug(card.name),
      annualFee: `₹${card.annual_fee?.toLocaleString() || "0"}`,
    }));

    // Sort by score and get top recommendations
    const topCards = scoredCards.sort((a, b) => b.score - a.score).slice(0, 3);

    // Return top cards or fallback if no good matches
    return topCards.length > 0 ? topCards : getFallbackCards().slice(0, 2);
  };

  // Fallback cards in case data loading fails
  const getFallbackCards = () => [
    {
      name: "HDFC Regalia",
      issuer: "HDFC Bank",
      reason: "Great for high income earners with travel benefits",
      annualFee: "₹2,500",
      slug: "hdfc-regalia",
      score: 85,
    },
    {
      name: "SBI SimplyCLICK",
      issuer: "SBI",
      reason: "Perfect for online shopping and low fees",
      annualFee: "₹499",
      slug: "sbi-simplyclick",
      score: 80,
    },
    {
      name: "Axis Bank ACE",
      issuer: "Axis Bank",
      reason: "Excellent cashback on bills and fuel",
      annualFee: "₹499",
      slug: "axis-bank-ace",
      score: 75,
    },
  ];

  const recommendations = getRecommendations();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">🎯</span>
          <h3 className="text-lg font-bold text-gray-800">
            Loading Recommendations...
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-accent-600 p-4 rounded-lg border border-gray-200"
            >
              <div className="h-4 bg-primary-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-primary-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-primary-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-accent-300 to-primary-500 border-t border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">🎯</span>
        <h3 className="text-lg font-bold text-gray-800">
          My Recommendations for You
        </h3>
      </div>

      <div className="space-y-4">
        {recommendations.map((card, index) => (
          <div
            key={index}
            className="bg-accent-200 p-4 rounded-lg border border-accent-500 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-primary-900 text-lg">
                    {card.name}
                  </h4>
                  {card.score && (
                    <span className="bg-green-600 text-green-100 text-xs px-2 py-1 rounded-full">
                      {Math.round(card.score)}% match
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{card.issuer}</p>
                <p className="text-gray-700 text-sm mb-3">
                  {card.reason || `Great card for your spending pattern`}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-primary-600 font-medium">
                    Annual Fee: {card.annualFee}
                  </p>
                  {card.reward_rate && (
                    <p className="text-gray-600 text-sm">
                      Reward: {card.reward_rate}
                    </p>
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
          View All Credit Cards →
        </Link>
      </div>

      {/* Debug info (remove in production)
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p>Profile: {JSON.stringify(userProfile)}</p>
          <p>Cards loaded: {cardsData.length}</p>
        </div>
      )} */}
    </div>
  );
}
