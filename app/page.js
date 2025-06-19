import Link from "next/link";

function page() {
  return (
    <div className="flex flex-col">
      <h1 className="font-normal text-7xl py-3 tracking-wide">
        <span className="text-accent-500">CardXpert:</span> Credit Card
        Recommender
      </h1>
      <div className="flex flex-col-reverse justify-between">
        <div className="flex w-7xl gap-10 items-center">
          <Link
            href="/cardsList"
            className="bg-primary-800 px-6 py-3 rounded-3xl hover:bg-primary-600 hover:rounded-2xl transition-all"
          >
            Explore Credit Cards
          </Link>
          <p>OR</p>
          <Link
            href="/chatbot"
            className="bg-accent-800 px-6 py-3 rounded-3xl hover:bg-accent-700 hover:rounded-2xl transition-all"
          >
            Ask AI
          </Link>
        </div>
        <div className="flex flex-col gap-3 my-10">
          <p>
            Choosing the right credit card can be overwhelming with so many
            options, rewards, and hidden terms. That’s where{" "}
            <b className="text-primary-300">CardXpert</b> comes in. We’ve built
            a powerful, AI-driven credit card recommendation system designed to
            simplify your decision-making process.
          </p>{" "}
          <p>
            Our intelligent agent engages you in a short, personalized Q&A
            session — asking about your income, spending habits, reward
            preferences, and lifestyle. Using this data, our system analyzes top
            credit cards from major Indian banks and fintech issuers to suggest
            the ones that truly match your needs.
          </p>
          <p>
            {" "}
            Whether you love cashback, travel rewards, or lounge access, we help
            you find the perfect card — without the noise.
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
