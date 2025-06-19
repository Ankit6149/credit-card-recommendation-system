"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CreditCardDetail from "../../components/CreditCardDetail";

// Helper to create slug from card name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Page() {
  const params = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/cardsData.json");
        if (!response.ok)
          throw new Error(`Failed to fetch data: ${response.status}`);
        const cards = await response.json();
        const foundCard = cards.find(
          (card) => createSlug(card.name) === params.cardId
        );
        if (!foundCard) {
          setError("Card not found");
          return;
        }
        setCard(foundCard);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (params.cardId) fetchCard();
  }, [params.cardId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading card details...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <h2>Card Not Found</h2>
          <a href="/cardlist" className="text-blue-600">
            ← Back to Card List
          </a>
        </div>
      </div>
    );
  }

  return <CreditCardDetail card={card} />;
}
