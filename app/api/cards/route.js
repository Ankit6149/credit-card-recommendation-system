import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import createSlug from "../../lib/helper.js";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 30;

function normalizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toInternalCard(raw = {}) {
  const name = normalizeString(
    raw.name || raw.card_name || raw.cardName || raw.title,
    "Unknown Card",
  );
  const perks = normalizeArray(raw.perks || raw.benefits || raw.features);

  return {
    name,
    slug: normalizeString(raw.slug, createSlug(name)),
    issuer: normalizeString(raw.issuer || raw.bank || raw.provider, "Unknown"),
    joining_fee: normalizeNumber(raw.joining_fee ?? raw.joiningFee ?? raw.fees?.joining),
    annual_fee: normalizeNumber(raw.annual_fee ?? raw.annualFee ?? raw.fees?.annual),
    reward_type: normalizeString(raw.reward_type || raw.rewardType, "Reward Points"),
    reward_rate: normalizeString(raw.reward_rate || raw.rewardRate, "N/A"),
    eligibility: normalizeString(raw.eligibility, "N/A"),
    perks,
    image: normalizeString(raw.image, "/cardxpert-card.svg"),
    affiliate_link: normalizeString(raw.affiliate_link || raw.affiliateLink, "#"),
    joining_fee_waiver: normalizeString(raw.joining_fee_waiver || raw.joiningFeeWaiver, "NA"),
    annual_fee_waiver: normalizeString(raw.annual_fee_waiver || raw.annualFeeWaiver, "NA"),
    milestone_benefits: normalizeString(raw.milestone_benefits || raw.milestoneBenefits, "NA"),
    welcome_benefits: normalizeString(raw.welcome_benefits || raw.welcomeBenefits, "NA"),
  };
}

function extractCardsArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidateKeys = ["data", "cards", "results", "items"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      for (const nestedKey of candidateKeys) {
        if (Array.isArray(value[nestedKey])) return value[nestedKey];
      }
    }
  }

  return [];
}

function applyFilters(cards, { q, rewardType }) {
  let output = [...cards];
  const search = normalizeString(q).toLowerCase();
  const reward = normalizeString(rewardType).toLowerCase();

  if (search) {
    output = output.filter((card) => {
      const haystack = [
        card.name,
        card.issuer,
        card.reward_type,
        card.reward_rate,
        ...(card.perks || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (reward && reward !== "all") {
    output = output.filter((card) =>
      card.reward_type.toLowerCase().includes(reward),
    );
  }

  return output;
}

function applySort(cards, sortBy, sortOrder) {
  const field = normalizeString(sortBy, "name");
  const order = normalizeString(sortOrder, "asc").toLowerCase() === "desc" ? -1 : 1;

  return [...cards].sort((a, b) => {
    if (field === "annual_fee") return (a.annual_fee - b.annual_fee) * order;
    if (field === "issuer") return a.issuer.localeCompare(b.issuer) * order;
    return a.name.localeCompare(b.name) * order;
  });
}

function paginate(cards, page, pageSize) {
  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return {
    cards: cards.slice(start, end),
    total,
    totalPages,
    page: currentPage,
    pageSize,
  };
}

async function loadLocalCards() {
  const filePath = path.join(process.cwd(), "public", "data", "cardsData.json");
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((card) => toInternalCard(card));
}

async function loadExternalCards(searchParams) {
  const apiUrl = normalizeString(process.env.CREDIT_CARDS_API_URL);
  if (!apiUrl) return null;

  try {
    const url = new URL(apiUrl);
    if (searchParams.get("q")) url.searchParams.set("q", searchParams.get("q"));
    if (searchParams.get("page")) url.searchParams.set("page", searchParams.get("page"));
    if (searchParams.get("pageSize")) {
      url.searchParams.set("pageSize", searchParams.get("pageSize"));
    }

    const headers = {
      Accept: "application/json",
    };

    const apiKey = normalizeString(process.env.CREDIT_CARDS_API_KEY);
    const apiHost = normalizeString(process.env.CREDIT_CARDS_API_HOST);
    const apiKeyHeader = normalizeString(process.env.CREDIT_CARDS_API_KEY_HEADER);

    if (apiKeyHeader && apiKey) {
      headers[apiKeyHeader] = apiKey;
    } else if (apiHost && apiKey) {
      headers["x-rapidapi-host"] = apiHost;
      headers["x-rapidapi-key"] = apiKey;
    } else if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(url.toString(), {
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`External cards API failed with status ${response.status}`);
    }

    const payload = await response.json();
    const cards = extractCardsArray(payload).map((card) => toInternalCard(card));
    if (!cards.length) return null;

    return cards;
  } catch (error) {
    console.warn("External cards API unavailable, fallback to local dataset:", error);
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, normalizeNumber(searchParams.get("page"), 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, normalizeNumber(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE)),
  );
  const q = searchParams.get("q") || "";
  const rewardType = searchParams.get("rewardType") || "all";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const cardId = normalizeString(searchParams.get("cardId"));

  try {
    const externalCards = await loadExternalCards(searchParams);
    const localCards = externalCards ? [] : await loadLocalCards();
    const source = externalCards ? "external" : "local";
    const baseCards = externalCards || localCards;

    let cards = applyFilters(baseCards, { q, rewardType });
    cards = applySort(cards, sortBy, sortOrder);

    if (cardId) {
      const card = cards.find((item) => item.slug === cardId);
      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      return NextResponse.json({ card, source });
    }

    if (source === "external") {
      const paginated = paginate(cards, page, pageSize);
      return NextResponse.json({
        source,
        cards: paginated.cards,
        pagination: {
          page: paginated.page,
          pageSize: paginated.pageSize,
          total: paginated.total,
          totalPages: paginated.totalPages,
        },
      });
    }

    return NextResponse.json({
      source,
      cards,
      pagination: {
        page: 1,
        pageSize: cards.length,
        total: cards.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("Cards API error:", error);
    return NextResponse.json(
      { error: "Unable to load cards right now." },
      { status: 500 },
    );
  }
}

