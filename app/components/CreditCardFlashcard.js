import Image from "next/image";

export default function CreditCardFlashcard({ card }) {
  if (!card) {
    return (
      <div className="bg-gradient-to-t from-accent-600 to-primary-900 rounded-xl shadow-lg p-6">
        <p className="text-accent-300 text-center">Card data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-t from-accent-600 to-primary-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden">
      {/* Card Image */}
      <div className="relative h-42 bg-gradient-to-br from-accent-300 to-primary-500">
        <Image
          src="/logo2.png"
          alt="logo of card"
          height="96"
          width="398"
          className="object-cover px-20 py-3"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div className="absolute top-4 right-4 bg-gradient-to-l from-accent-200 to-accent-600 bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-xs uppercase font-semibold text-primary-800 shadow-2xl">
          {card.reward_type}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Card Name & Issuer */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-accent-300 mb-1">
            {card.name}
          </h3>
          <p className="text-sm text-accent-400">{card.issuer}</p>
        </div>

        {/* Key Details */}
        <div className="space-y-3">
          {/* Fees */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-primary-800">
              Annual Fee
            </span>
            <span className="font-semibold text-primary-900">
              ₹{card.annual_fee.toLocaleString()}
            </span>
          </div>

          {/* Reward Rate */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-primary-800">
              Reward Rate
            </span>
            <span className="font-semibold text-primary-900 text-right text-sm">
              {card.reward_rate}
            </span>
          </div>

          {/* Top Perks */}
          <div className="pt-2">
            <p className="text-sm font-bold text-primary-800 mb-2">
              Key Perks:
            </p>
            <div className="flex flex-wrap gap-1">
              {card.perks.slice(0, 2).map((perk, index) => (
                <span
                  key={index}
                  className="bg-accent-600 text-primary-100 text-xs px-2 py-1 rounded-full"
                >
                  {perk}
                </span>
              ))}
              {card.perks.length > 2 && (
                <span className="bg-primary-900 text-primary-100 text-xs px-2 py-1 rounded-full">
                  +{card.perks.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 pt-4 border-t border-primary-950">
          <div className="w-full bg-primary-700 text-primary-100 py-2 px-4 pl-28 rounded-lg font-medium transition-all duration-500 hover:bg-accent-800">
            View Details
          </div>
        </div>
      </div>
    </div>
  );
}
