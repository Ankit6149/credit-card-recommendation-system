"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreditCardDetail({ card }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "benefits", label: "Benefits" },
    { id: "fees", label: "Fees & Waivers" },
  ];

  const getValue = (value, fallback = "N/A") => {
    return value !== undefined && value !== null && value !== "NA"
      ? value
      : fallback;
  };

  if (!card) {
    return <div>Card data not available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-accent-600">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 to-accent-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-accent-200 hover:text-accent-50 transition-colors duration-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back to Cards</span>
            </button>
            <div className="text-sm text-accent-200">
              <Link
                href="/cardlist"
                className="hover:text-white transition-colors duration-300"
              >
                Card List
              </Link>
              <span className="mx-2">/</span>
              <span className="text-accent-100">{card.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Header with Enhanced Text Shadows */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-accent-300 to-primary-500">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>

        {/* Responsive Image Container */}
        <div className="relative h-full flex items-center justify-center px-4 sm:px-8">
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <Image
              src="/logo2.png"
              alt={card.name}
              width={460}
              height={116}
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 70vw, 460px"
              className="object-contain w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Card Info with Enhanced Text Shadows */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-auto text-accent-100">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
            style={{
              textShadow:
                "3px 3px 6px rgba(0, 0, 0, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 0, 0, 0.4)",
            }}
          >
            {card.name}
          </h1>
          <p
            className="text-lg sm:text-xl opacity-90 mb-4"
            style={{
              textShadow:
                "2px 2px 4px rgba(0, 0, 0, 0.7), 1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            {card.issuer}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span
              className="bg-accent-600 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit"
              style={{
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)",
              }}
            >
              {card.reward_type}
            </span>
            <span
              className="bg-primary-700 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit"
              style={{
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)",
              }}
            >
              ₹{card.annual_fee.toLocaleString()} Annual Fee
            </span>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-primary-400 to-primary-900 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs - Responsive */}
          <div className="border-b border-gray-200 bg-gradient-to-l from-primary-2000 to-accent-200">
            <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-primary-700 text-primary-800"
                      : "border-transparent text-primary-700 hover:text-primary-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Quick Stats - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-primary-100 to-accent-200 p-4 sm:p-6 rounded-lg text-center border border-primary-100">
                    <p className="text-sm text-primary-600 mb-2 font-semibold">
                      Reward Type
                    </p>
                    <p className="font-bold text-primary-900 text-base sm:text-lg">
                      {getValue(card.reward_type)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-100 to-accent-200 p-4 sm:p-6 rounded-lg text-center border border-accent-100">
                    <p className="text-sm text-accent-700 mb-2 font-semibold">
                      Reward Rate
                    </p>
                    <p className="font-bold text-accent-900 text-base sm:text-lg">
                      {getValue(card.reward_rate)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-100 to-accent-200 p-4 sm:p-6 rounded-lg text-center border border-primary-100">
                    <p className="text-sm text-primary-600 mb-2 font-semibold">
                      Annual Fee
                    </p>
                    <p className="font-bold text-primary-900 text-base sm:text-lg">
                      ₹{card.annual_fee.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-100 to-accent-200 p-4 sm:p-6 rounded-lg text-center border border-accent-100">
                    <p className="text-sm text-accent-700 mb-2 font-semibold">
                      Joining Fee
                    </p>
                    <p className="font-bold text-accent-900 text-base sm:text-lg">
                      ₹{card.joining_fee.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Eligibility */}
                {card.eligibility && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4">
                      Eligibility Criteria
                    </h3>
                    <div className="bg-gradient-to-r from-primary-200 to-accent-200 p-4 sm:p-6 rounded-lg border border-primary-200">
                      <p className="text-primary-900 text-base sm:text-lg font-medium">
                        {card.eligibility}
                      </p>
                    </div>
                  </div>
                )}

                {/* Welcome Benefits */}
                {getValue(card.welcome_benefits) !== "N/A" && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4">
                      Welcome Benefits
                    </h3>
                    <div className="bg-gradient-to-r from-accent-200 to-primary-200 p-4 sm:p-6 rounded-lg border border-accent-200">
                      <p className="text-accent-900 text-base sm:text-lg font-medium">
                        {card.welcome_benefits}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "benefits" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Perks */}
                {card.perks && card.perks.length > 0 && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-6">
                      Key Benefits & Perks
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {card.perks.map((perk, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 bg-gradient-to-r from-primary-100 to-accent-100 p-4 rounded-lg border border-primary-100"
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex-shrink-0"></div>
                          <span className="text-primary-800 text-base sm:text-lg font-medium">
                            {perk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestone Benefits */}
                {getValue(card.milestone_benefits) !== "N/A" && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4">
                      Milestone Benefits
                    </h3>
                    <div className="bg-gradient-to-r from-accent-200 to-primary-200 p-4 sm:p-6 rounded-lg border border-accent-200">
                      <p className="text-accent-900 text-base sm:text-lg font-medium">
                        {card.milestone_benefits}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "fees" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Fee Structure */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-6">
                    Fee Structure
                  </h3>
                  <div className="bg-gradient-to-r from-primary-200 to-accent-200 rounded-lg p-4 sm:p-6 border border-primary-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-4 border-b border-primary-200">
                        <span className="text-primary-700 text-base sm:text-lg font-semibold">
                          Joining Fee
                        </span>
                        <span className="font-bold text-primary-900 text-lg sm:text-xl">
                          ₹{card.joining_fee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4">
                        <span className="text-primary-700 text-base sm:text-lg font-semibold">
                          Annual Fee
                        </span>
                        <span className="font-bold text-primary-900 text-lg sm:text-xl">
                          ₹{card.annual_fee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Waivers */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-6">
                    Fee Waivers
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-accent-200 to-primary-200 p-4 sm:p-6 rounded-lg border border-accent-200">
                      <h4 className="font-bold text-accent-800 mb-3 text-base sm:text-lg">
                        Joining Fee Waiver
                      </h4>
                      <p className="text-accent-700 text-base sm:text-lg font-medium">
                        {getValue(card.joining_fee_waiver)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-primary-200 to-accent-200 p-4 sm:p-6 rounded-lg border border-primary-200">
                      <h4 className="font-bold text-primary-800 mb-3 text-base sm:text-lg">
                        Annual Fee Waiver
                      </h4>
                      <p className="text-primary-700 text-base sm:text-lg font-medium">
                        {getValue(card.annual_fee_waiver)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Responsive */}
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-primary-200 to-primary-800">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/cardsList"
                className="flex-1 bg-gradient-to-r from-accent-700 to-accent-800 text-white py-3 px-6 rounded-lg font-medium text-center transition-all duration-300 hover:from-accent-800 hover:to-accent-900 shadow-lg"
              >
                Back to All Cards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
