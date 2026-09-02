# SENTINEL

> **"An explainable, risk-aware AI trading agent."**

Built for the **Alpaca AI Trading Agents Hackathon**  
Official Hackathon: [https://lablab.ai/ai-hackathons/alpaca-ai-trading-agents-hackathon/](https://lablab.ai/ai-hackathons/alpaca-ai-trading-agents-hackathon/)

---

## The Core Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                       AI PROPOSES                           │
│  (Analyzes Market Data, News Sentiment, Technical Trends)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   RISK ENGINE DECIDES                       │
│  (Deterministic Mathematical Checks: Exposure, Loss Limits) │
└──────────────┬───────────────────────────────┬──────────────┘
               │ APPROVED                      │ BLOCKED
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   ALPACA EXECUTES PAPER      │ │    NO ORDER SUBMITTED      │
│          TRADE ONLY          │ │   (Risk Event Audited)     │
└──────────────────────────────┘ └────────────────────────────┘
```

**The AI can NEVER bypass the risk engine.**  
**Live trading is strictly prohibited; only Alpaca Paper Trading is supported.**

---

## Key Features

* **AI Market Analysis & Reasoning:** Multi-signal synthesis producing structured `BUY`, `SELL`, or `HOLD` recommendations with transparent confidence scores and written rationales.
* **Deterministic Risk Engine:** Independent mathematical rule engine enforcing position exposure limits (max 10%), single-trade limits (max 5%), daily loss circuits (max 2%), and minimum AI confidence thresholds (min 70%).
* **Guaranteed Paper Trading:** Hardwired exclusively to Alpaca's Paper Trading sandbox (`https://paper-api.alpaca.markets`) with zero real-money risk.
* **Model Context Protocol (MCP):** Leverages Alpaca MCP toolsets for discovery and market data queries while keeping trade execution safely mediated.
* **Auditable PostgreSQL Trace:** Every agent observation, LLM thought, risk check, and paper order is timestamped and stored in Supabase for total transparency.
* **Modern Web3 / Dark Terminal UI:** Inspired by the clean, spacious aesthetic of modern Web3 interfaces like Uniswap, with rounded cards, subtle borders, luminous accents, and large financial figures.

---

## Repository Structure

```
sentinel/
 ├── frontend/           # React 19 + Vite + Tailwind CSS + Recharts
 ├── backend/            # Express + TypeScript + Zod + Alpaca + Gemini
 ├── docs/               # In-depth architectural & integration documentation
 │    ├── architecture.md
 │    ├── setup.md
 │    ├── frontend.md
 │    ├── backend.md
 │    ├── database.md
 │    ├── ai-agent.md
 │    ├── risk-engine.md
 │    ├── alpaca.md
 │    ├── mcp.md
 │    ├── testing.md
 │    ├── demo.md
 │    └── progress.md
 ├── scripts/            # Helper automation and verification scripts
 ├── .env.example        # Environment variable template
 └── README.md           # Project overview and quickstart
```

---

## Documentation Quick Links

* [Architecture & System Flow](docs/architecture.md)
* [Local Setup & Getting Started](docs/setup.md)
* [Frontend Design & Components](docs/frontend.md)
* [Backend REST APIs](docs/backend.md)
* [Database & Supabase Schema](docs/database.md)
* [AI Agent & Decision Model](docs/ai-agent.md)
* [Deterministic Risk Engine](docs/risk-engine.md)
* [Alpaca Paper Trading Integration](docs/alpaca.md)
* [Model Context Protocol (MCP) Usage](docs/mcp.md)
* [Testing & Proof Scenarios](docs/testing.md)
* [Hackathon Demo Walkthrough](docs/demo.md)
* [Progress Tracker](docs/progress.md)

---

## Safety Commitment

SENTINEL is created strictly for algorithmic research, agentic evaluation, and educational simulation. It does not provide financial advice and is hardcoded to prevent execution on live brokerage accounts.
