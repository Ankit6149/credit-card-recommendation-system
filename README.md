# CardXpert Pro

CardXpert Pro is a Next.js application that combines a general-purpose AI chatbot with finance and credit-card expertise on demand.

The system is designed to:
- chat naturally on any topic,
- switch to finance-focused guidance when requested,
- and only enter credit-card advisory flow when card intent is detected or Cards mode is selected.

---

## 1) What This Project Does

### Main capabilities
- Multi-mode AI chat (`Auto`, `General`, `Finance`, `Cards`)
- Credit-card directory with search, filter, sort, and detail pages
- API-first card data loading with automatic local fallback
- Profile-aware recommendation section inside chatbot
- Responsive UI with dedicated full-screen chatbot workspace

### Core pages
- `/` Home (overview + entry points)
- `/chatbot` AI workspace
- `/cardsList` card directory
- `/cardsList/[cardId]` card detail page

---

## 2) Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS v4
- Google Gemini (`@google/generative-ai`)
- Local fallback dataset (`public/data/cardsData.json`)

---

## 3) Project Architecture

### Frontend
- Route-based UI in `app/`
- Shared chrome wrapper via `app/components/AppChrome.js`
- Chatbot UI components in `app/components/chatbotUI/`

### Backend (Route Handlers)
- `app/api/chat/route.js`
  - receives conversation + mode + profile
  - calls Gemini through `app/lib/genai.js`
  - falls back gracefully if provider fails
- `app/api/cards/route.js`
  - loads cards from external API when configured
  - falls back to local JSON when unavailable
  - applies filtering/sorting/pagination

---

## 4) How the AI Works

## 4.1 Chat modes
- `auto`: infer user intent from recent messages
- `general`: general conversation only
- `finance`: finance education and guidance
- `cards`: card-advisory and profile collection

## 4.2 Chat request flow
1. UI sends messages + `chatMode` + `userProfile` to `POST /api/chat`.
2. API normalizes messages (role/content length/history window).
3. `createChatCompletion(...)` builds a strict JSON prompt for Gemini.
4. Gemini response is parsed and normalized.
5. Profile updates are merged.
6. API returns structured payload to UI:
   - `message`
   - `intent`
   - `profileUpdates`
   - `mergedProfile`
   - `shouldShowRecommendations`

## 4.3 Guardrails in prompt design
The system prompt enforces:
- JSON-only output
- no card profile collection unless card mode is active
- no fabricated card facts outside card catalog context
- mode-aware behavior (`general` vs `finance` vs `cards`)

## 4.4 Profile extraction and completion
The assistant tracks:
- income range
- spending categories
- preferred benefits
- fee preference

Recommendations are shown once profile completeness criteria are met.

## 4.5 Fallback behavior (production safety)
If Gemini fails (invalid key, provider outage, parse error):
- API does not crash the chat
- deterministic fallback reply is returned based on mode/intent
- conversation remains usable

---

## 5) Credit Cards Data Layer

## 5.1 Source priority
1. External API (`CREDIT_CARDS_API_URL`) if configured and healthy
2. Local dataset (`public/data/cardsData.json`) fallback

## 5.2 Normalization
External payloads are normalized into internal card shape (`name`, `issuer`, fees, rewards, perks, eligibility, etc.) so UI stays stable regardless of source format.

## 5.3 API query features (`GET /api/cards`)
- `q` search
- `rewardType` filter
- `sortBy` (`name`, `annual_fee`, `issuer`)
- `sortOrder` (`asc`, `desc`)
- `page`, `pageSize`
- `cardId` for detail lookup

Pagination is active for external source; local fallback returns full local set.

---

## 6) UI System

### Chatbot workspace
- Full viewport layout on `/chatbot`
- Left sidebar navigation on large screens
- Fixed header/mode controls + quick prompts + profile strip
- Scrollable message thread
- Fixed composer at bottom

### Message alignment
- Assistant on the left
- User on the right

### Branding assets
- Header wordmark: `public/cardxpert-wordmark.svg`
- Card visual placeholder: `public/cardxpert-card.svg`

---

## 7) Folder Structure

```text
credit-card-recommender-ai/
+- app/
¦  +- api/
¦  ¦  +- chat/route.js
¦  ¦  +- cards/route.js
¦  +- cardsList/
¦  ¦  +- [cardId]/page.js
¦  ¦  +- page.js
¦  +- chatbot/
¦  ¦  +- page.js
¦  +- components/
¦  ¦  +- chatbotUI/
¦  ¦  ¦  +- ChatInterface.js
¦  ¦  ¦  +- MessageBubble.js
¦  ¦  ¦  +- Recommendations.js
¦  ¦  ¦  +- UserInput.js
¦  ¦  ¦  +- UserProfile.js
¦  ¦  +- AppChrome.js
¦  ¦  +- CreditCardDetail.js
¦  ¦  +- CreditCardFlashcard.js
¦  ¦  +- Logo.js
¦  ¦  +- Navigation.js
¦  +- lib/
¦  ¦  +- genai.js
¦  ¦  +- helper.js
¦  +- globals.css
¦  +- layout.js
¦  +- loading.js
¦  +- page.js
+- public/
¦  +- data/cardsData.json
¦  +- cardxpert-wordmark.svg
¦  +- cardxpert-card.svg
¦  +- logo*.png (legacy assets)
+- package.json
+- README.md
```

---

## 8) Environment Variables

Create `.env.local` in project root:

```env
# Required for Gemini chat
GEMINI_API_KEY=your_gemini_key

# Optional model override
GEMINI_MODEL=gemini-flash-latest

# Optional external cards API
CREDIT_CARDS_API_URL=https://your-api.example.com/cards
CREDIT_CARDS_API_KEY=your_api_key
CREDIT_CARDS_API_HOST=your_host_if_rapidapi_style
CREDIT_CARDS_API_KEY_HEADER=x-api-key
```

Behavior notes:
- Missing/invalid Gemini key -> chat fallback responses
- External cards API down -> local dataset fallback

---

## 9) Run Locally

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/chatbot`
- `http://localhost:3000/cardsList`

---

## 10) Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint codebase

---

## 11) Deployment Notes

For production hardening, recommended next steps:
- Add auth/rate limiting for API routes
- Add request logging/monitoring
- Add tests for prompt parsing and fallback behavior
- Add integration tests for `/api/chat` and `/api/cards`

---

## 12) Troubleshooting

### Gemini not answering
- Verify `.env.local` has `GEMINI_API_KEY`
- Restart server after changing env values
- Check server logs for provider/fallback messages

### Chat responds but feels generic
- Ensure mode selection is appropriate (`Finance` or `Cards`)
- In `Cards` mode, provide income/spending/benefits/fee preferences

### Cards API not showing live records
- Verify `CREDIT_CARDS_API_URL` and API auth headers
- If unavailable, app correctly falls back to local data
