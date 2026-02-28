"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CreditCardDetail from "../../components/CreditCardDetail";

export default function CardDetailPage() {
  const params = useParams();
  const [card, setCard] = useState(null);
  const [source, setSource] = useState("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.cardId) return;

    let active = true;

    const loadCard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/cards?cardId=${params.cardId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Card not found");
        }

        const payload = await response.json();
        if (!active) return;
        setCard(payload.card || null);
        setSource(payload.source || "local");
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load card");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCard();
    return () => {
      active = false;
    };
  }, [params?.cardId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-xl border border-primary-700/50 bg-primary-900/70 px-5 py-3 text-sm text-primary-100">
          Loading card details...
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-primary-700/50 bg-primary-900/80 p-6 text-center">
          <h2 className="text-xl font-semibold text-primary-50">Card Not Found</h2>
          <p className="mt-2 text-sm text-primary-300">
            The card you requested may not exist in the current dataset.
          </p>
          <Link
            href="/cardsList"
            className="mt-4 inline-flex rounded-lg border border-accent-500/50 bg-accent-700/30 px-4 py-2 text-sm font-medium text-accent-100 transition hover:bg-accent-700/45"
          >
            Back to Card List
          </Link>
        </div>
      </div>
    );
  }

  return <CreditCardDetail card={card} source={source} />;
}
