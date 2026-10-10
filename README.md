# Idea Miner — AI-Powered Opportunity Discovery Engine

> **Discover real problems → Analyze complaints → Identify market gaps → Generate startup opportunities → Validate ideas → Recommend what to build next.**

Idea Miner is a full-stack, research-grade opportunity discovery engine designed for indie hackers, aspiring founders, developers, startup teams, and hackathon builders. Unlike generic AI idea generators, Idea Miner grounds all recommendations in real, traceable internet search results, recurring user complaints, and competitor vulnerability analysis.

## Key Differentiators & Principles

- **Evidence-Grounded**: Discovers authentic complaints across Reddit discussions, developer forums (Hacker News, Dev.to), verified product review aggregators (G2, Capterra, Trustpilot), and Q&A boards using SerpApi.
- **Traceable Source Links**: Every problem statement and opportunity dossier includes direct, clickable links with domain pills and exact quoted snippets so founders can inspect the raw threads themselves.
- **Separation of Evidence & Inference**: Clearly distinguishes observed empirical data from AI-synthesized hypotheses (e.g. willingness-to-pay hypotheses are explicitly labeled).
- **Transparent Mathematical Scoring (0–100)**: Eliminates arbitrary LLM scoring with a transparent, weighted formula:
  - **Pain Severity (25%)**: Normalized severity (1–10 → 0–100)
  - **Evidence Strength & Recurrence (25%)**: Scaled by distinct verified sources & recurrence patterns (High, Medium, Emerging, Low)
  - **Market Gap & Differentiation (20%)**: Normalized unaddressed gap degree
  - **Potential Willingness to Pay (15%)**: B2B ROI & paid workaround replacement potential
  - **MVP Feasibility (15%)**: Technical complexity (Low complexity = higher feasibility) and lean feature scope
- **Comprehensive 7-Tab Opportunity Dossiers**:
  1. **Overview**: Value proposition, problem solved, differentiator, complexity.
  2. **Problem Evidence**: Direct source links, verified quotes, publication dates.
  3. **Customer Profile**: Target persona, willingness to pay, acquisition channels (GTM).
  4. **Competitor Analysis**: Verified competitors vs incumbents, core features, customer complaints, and unaddressed market gaps.
  5. **MVP Specification**: Prioritized v1.0 feature scope and commercial pricing models.
  6. **Validation Plan**: 48-hour lean validation experiment with go/no-go metrics + deep Gemini re-analysis trigger.
  7. **Risks & Assumptions**: Top existential assumptions and kill-risks.
- **Deterministic Demo Mode**: Allows immediate, full exploration without external API keys using realistic, illustrative problem records and opportunities across developer APIs, async project management, and e-commerce returns.
- **Real Actionable Exports**: RFC 4180 compliant CSV downloads for opportunities and research sessions, plus a clean printable executive report (`window.print()`) formatted for PDF export.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express, TypeScript, Zod, UUID, CORS |
| **Database** | SQLite via WebAssembly (`sql.js`) with persistent disk storage (`idea_miner.sqlite`), Supabase / PostgreSQL ready |
| **LLM Provider** | Google Gemini (`gemini-3.8-flash` via official `@google/genai` SDK) |
| **Search Provider** | SerpApi (Google Search API) with query formulation for Reddit, forums & reviews |

## Getting Started

### 1. Prerequisites

- **Node.js** (v18+ or v20+ or v24+)
- **npm** (v9+)

### 2. Installation

```bash
# From the project root
npm install

# This installs:
#   - Root tools (concurrently)
#   - Server dependencies (express, sql.js, @google/genai, etc.)
#   - Client dependencies (react, tailwind, lucide-react, etc.)
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:

```env
PORT=5000
NODE_ENV=development

# Google Gemini API Key (Get at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# SerpApi API Key (Get at https://serpapi.com/)
SERPAPI_API_KEY=your_serpapi_key_here

# Optional: Supabase PostgreSQL connection URI
# If left empty, Idea Miner defaults to a fully functional local SQLite database (idea_miner.sqlite).
DATABASE_URL=
```

> **Important:** If you do not have SerpApi or Gemini API keys immediately available, Idea Miner automatically runs in **Demo Mode** — populated with rich illustrative problem records and opportunities. You can also supply session keys directly through the in-app **API Settings** modal at any time.

### 4. Running the Development Server

From the root directory:

```bash
# Run both backend (port 5000) and frontend (port 3000) concurrently
npm run dev
```

Or run them individually:

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Open your browser at `http://localhost:3000`.

**Demo mode auto-activates** when no API keys are configured. All UI interactions work fully without credentials.

### 5. Running Tests

```bash
# Execute the unit test suite verifying transparent scoring calculations,
# evidence penalties, normalization, and CSV export formatting
npm run test
```

### 6. Production Build & Deployment

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

- **Frontend**: Ready for zero-config deployment on Vercel or Netlify (point build command to `npm run build` with output directory `dist`).
- **Backend**: Can be deployed to Render, Railway, Fly.io, or any Node.js container host.

## License

MIT License. Designed and built with care for startup builders and researchers.