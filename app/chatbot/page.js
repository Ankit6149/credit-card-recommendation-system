import ChatInterface from "../components/chatbotUI/ChatInterface";
import Link from "next/link";

export const metadata = {
  title: "CardXpert Pro - General Chat and Card Advisor",
  description:
    "Chat on any topic and get personalized credit card recommendations on demand",
};

function page() {
  return (
    <div className="min-h-screen bg-primary-800 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary-400 hover:text-primary-200 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-200 mb-4">
            CardXpert Pro Assistant
          </h1>
          <p className="text-lg text-accent-300 max-w-2xl mx-auto">
            Have a normal conversation on any topic. Ask for credit-card help
            whenever you want, and the assistant will switch to finance
            guidance with personalized recommendations.
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface />

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-primary-400 text-sm">
            Want to browse all cards?{" "}
            <Link
              href="/cardsList"
              className="text-primary-300 hover:text-primary-100 underline"
            >
              View Card List
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
