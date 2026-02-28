# CardXpert Pro

CardXpert Pro is a Next.js application with:
- A multi-mode AI chat assistant (General, Finance, Cards, Auto)
- A professional chatbot workspace UI
- A credit cards directory with API-first loading and local fallback
- Card detail pages and recommendation flow

## What is implemented

### Chatbot
- Professional chat layout with a left sidebar on `/chatbot`
- User messages aligned to the right, assistant messages on the left
- Mode switch buttons in chat:
  - `Auto`: infer intent from user message
  - `General`: generic assistant behavior
  - `Finance`: finance education mode
  - `Cards`: credit-card advisory mode
- Persistent conversation state via `localStorage`
- Profile extraction for card recommendations

### Cards catalog
- `/api/cards` endpoint added as API-first data layer
- Uses external cards API if configured
- Falls back to local dataset (`public/data/cardsData.json`) if external API is unavailable
- Pagination appears when external source is active
- Grid and list views with sorting/filtering/search

### Navigation and layout
- Global top navigation is hidden on `/chatbot` for focused chat workspace
- Non-chat pages keep top navigation and footer

## Tech stack
- Next.js (App Router)
- React
- Tailwind CSS
- Google Gemini (`@google/generative-ai`)

## Run locally

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_key
# Optional override:
# GEMINI_MODEL=gemini-flash-latest
```

3. Start development server:
```bash
npm run dev
```

4. Open:
- `http://localhost:3000/chatbot`
- `http://localhost:3000/cardsList`

## Optional external cards API config

If you have a cards API, add these in `.env.local`:
```env
CREDIT_CARDS_API_URL=https://your-api.example.com/cards

# One of these auth patterns:
CREDIT_CARDS_API_KEY=your_key
CREDIT_CARDS_API_HOST=your_host_if_rapidapi_style
CREDIT_CARDS_API_KEY_HEADER=x-api-key
```

Behavior:
- If `CREDIT_CARDS_API_URL` works, `/api/cards` uses external data.
- If not, `/api/cards` serves local JSON data automatically.

## Important project routes
- `/chatbot` - AI assistant workspace
- `/cardsList` - cards directory
- `/cardsList/[cardId]` - card details
- `/api/chat` - chatbot backend route
- `/api/cards` - cards backend route

## Scripts
- `npm run dev` - start local development
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project files
