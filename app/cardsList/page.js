"use client";

import { useState, useEffect } from "react";
import CreditCardFlashcard from "../components/CreditCardFlashcard";
import Image from "next/image";
import Link from "next/link";

function Page() {
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch credit card data from JSON file
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/cardsData.json");

        if (!response.ok) {
          throw new Error("Failed to fetch credit card data");
        }

        const data = await response.json();
        setCreditCards(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching credit cards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditCards();
  }, []);

  // Filter and sort functions
  const getFilteredAndSortedCards = () => {
    let filtered = creditCards;

    if (filterBy !== "all") {
      filtered = creditCards.filter((card) =>
        card.reward_type.toLowerCase().includes(filterBy.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "annual_fee":
          return a.annual_fee - b.annual_fee;
        case "issuer":
          return a.issuer.localeCompare(b.issuer);
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Create URL-friendly slug from card name
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Loading state

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-accent-300 mb-2">
            Error Loading Data
          </h2>
          <p className="text-accent-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-accent-200 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredCards = getFilteredAndSortedCards();

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-primary-950 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl text-accent-600 mb-4">
              Best Credit Cards in India
            </h1>
            <p className="text-lg text-accent-100 font-light max-w-2xl mx-auto">
              Browse our curated list of top Indian credit cards, complete with
              details on rewards, fees, eligibility, and exclusive perks — all
              in one place. Compare and choose the perfect credit card for your
              needs
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* View Toggle */}
            <div className="flex bg-primary-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-primary-700 text-accent-100 shadow-sm"
                    : "text-primary-800 hover:text-primary-900"
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Grid View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-primary-700 text-accent-100 shadow-sm"
                    : "text-primary-800 hover:text-primary-900"
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List View
              </button>
            </div>

            {/* Filters and Sort */}
            <div className="flex space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-primary-50 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="all" className="bg-primary-700 ">
                  All Cards
                </option>
                <option value="reward" className="bg-primary-700 ">
                  Reward Points
                </option>
                <option value="cashback" className="bg-primary-700 ">
                  Cashback
                </option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-primary-50 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="name" className="bg-primary-700 ">
                  Sort by Name
                </option>
                <option value="annual_fee" className="bg-primary-700 ">
                  Sort by Annual Fee
                </option>
                <option value="issuer" className="bg-primary-700 ">
                  Sort by Issuer
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-accent-400">
            Showing {filteredCards.length} credit card
            {filteredCards.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map((card, index) => (
              <Link
                key={index}
                href={`/cardsList/${createSlug(card.name)}`}
                className="block transition-transform duration-300 hover:scale-105"
              >
                <CreditCardFlashcard card={card} />
              </Link>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {filteredCards.map((card, index) => (
              <Link
                key={index}
                href={`/cardsList/${createSlug(card.name)}`}
                className="block"
              >
                <div className="bg-gradient-to-l from-accent-600 to-primary-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-40">
                      <div className="flex items-center space-x-4 mb-4 min-w-72">
                        <div className="min-w-16 min-h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                          <span>
                            <Image
                              src="/logo2.png"
                              alt="credit-card-logo"
                              height="20"
                              width="50"
                            />
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-accent-500">
                            {card.name}
                          </h3>
                          <p className="text-primary-300">{card.issuer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 justify-around lg:grid-cols-4 lg:gap-15">
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-accent-100 text-shadow-accent-950">
                            Annual Fee
                          </p>
                          <p className="font-semibold text-primary-900 text-lg">
                            ₹{card.annual_fee.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-accent-100 text-shadow-accent-950">
                            Reward Type
                          </p>
                          <p className="font-semibold text-primary-900 text-base">
                            {card.reward_type}
                          </p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-sm text-accent-100 text-shadow-accent-950">
                            Reward Rate
                          </p>
                          <p className="font-semibold text-primary-900 text-sm">
                            {card.reward_rate}
                          </p>
                        </div>
                        <div className="text-center lg:text-right min-w-28 my-3">
                          <button className="bg-primary-700 text-primary-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-800 transition-all duration-500">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-primary-900">
                      <div className="flex flex-wrap gap-2">
                        {card.perks.slice(0, 3).map((perk, perkIndex) => (
                          <span
                            key={perkIndex}
                            className="bg-accent-800 text-primary-50 text-xs px-2 py-1 rounded-full"
                          >
                            {perk}
                          </span>
                        ))}
                        {card.perks.length > 3 && (
                          <span className="bg-accent-800 text-primart-600 text-xs px-2 py-1 rounded-full">
                            +{card.perks.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {/* {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cards found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default Page;
