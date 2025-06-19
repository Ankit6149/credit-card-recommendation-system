import Link from "next/link";

function page() {
  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Main Heading - Responsive Typography */}
      <h1 className="font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl py-3 tracking-wide text-center lg:text-left">
        <span className="text-accent-500">CardXpert:</span> Credit Card
        Recommender
      </h1>
      
      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-col-reverse justify-between flex-1 gap-8 lg:gap-0">
        
        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row w-full gap-4 sm:gap-6 lg:gap-10 items-center justify-center lg:justify-start order-2 lg:order-1">
          <Link
            href="/cardsList"
            className="w-full sm:w-auto bg-primary-800 px-6 py-3 rounded-3xl hover:bg-primary-600 hover:rounded-2xl transition-all text-center text-white font-medium"
          >
            Explore Credit Cards
          </Link>
          
          <p className="text-gray-600 font-medium">OR</p>
          
          <Link
            href="/chatbot"
            className="w-full sm:w-auto bg-accent-800 px-6 py-3 rounded-3xl hover:bg-accent-700 hover:rounded-2xl transition-all text-center text-white font-medium"
          >
            Ask AI
          </Link>
        </div>

        {/* Description Section */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 my-6 sm:my-8 lg:my-10 order-1 lg:order-2">
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700">
            Choosing the right credit card can be overwhelming with so many
            options, rewards, and hidden terms. That's where{" "}
            <b className="text-primary-500">CardXpert</b> comes in. We've built
            a powerful, AI-driven credit card recommendation system designed to
            simplify your decision-making process.
          </p>
          
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700">
            Our intelligent agent engages you in a short, personalized Q&A
            session — asking about your income, spending habits, reward
            preferences, and lifestyle. Using this data, our system analyzes top
            credit cards from major Indian banks and fintech issuers to suggest
            the ones that truly match your needs.
          </p>
          
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700">
            Whether you love cashback, travel rewards, or lounge access, we help
            you find the perfect card — without the noise.
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
