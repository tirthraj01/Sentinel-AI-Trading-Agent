# SENTINEL — AI Trading Agent Specification

---

## 1. Agent Design Philosophy

The SENTINEL Agent does not behave like a reckless "black box" trader. Instead, it behaves like an institutional financial analyst preparing an investment memo for an investment committee.

### Cardinal Agent Rules:
1. **Explainability First:** The agent must always articulate the "why" behind any recommendation.
2. **Calibrated Confidence:** Confidence must reflect data strength (0 to 100), penalizing conflicting signals or sparse volume.
3. **Humility & No Guarantees:** The agent explicitly acknowledges market uncertainty and never guarantees profits.
4. **Separation of Proposal & Execution:** The agent produces an intent (`TradeProposal`), which must pass the independent Risk Engine before any trade can occur.

---

## 2. Decision Workflow Cycle

```
[ TRIGGER: /api/agent/analyze?symbol=NVDA ]
                    │
                    ▼
           1. OBSERVE & GATHER
              ├── Fetch Real-Time Quotes & Historical Bars
              ├── Fetch Latest News Headlines & Sentiment
              └── Fetch Current Portfolio & Open Positions
                    │
                    ▼
           2. STRUCTURED LLM REASONING
              ├── Identify Trend & Momentum
              ├── Gauge Sentiment Impact
              ├── Evaluate Portfolio Fit (Diversification)
              └── Synthesize Hypothesis
                    │
                    ▼
           3. GENERATE STRUCTURED PROPOSAL (Zod Validated)
              ├── Decision: BUY / SELL / HOLD
              ├── Confidence: 0 - 100
              ├── Suggested Allocation %
              └── Step-by-Step Rationale
                    │
                    ▼
           4. RISK ENGINE VALIDATION (Deterministic)
              ├── Checks Limits (Position %, Daily Loss %, Cash, etc.)
              └── Emits: APPROVED or BLOCKED
                    │
           ┌────────┴────────┐
           ▼                 ▼
      [ APPROVED ]      [ BLOCKED ]
           │                 │
           ▼                 ▼
   5A. Submit Paper   5B. Record Risk Event
       Order to Alpaca    (No Order Submitted)
           │                 │
           └────────┬────────┘
                    ▼
           6. RECORD & AUDIT
              └── Persist Full Decision Trace to Database
                    │
                    ▼
           7. RETURN REPORT TO USER
```

---

## 3. Explicit Tool Definitions

The Agent uses explicit tools to gather state:

| Tool Function | Description | Input | Output |
| :--- | :--- | :--- | :--- |
| `getMarketData(symbol)` | Fetches recent price, 24h change, VWAP, high/low, volume | `{ symbol: string }` | `{ price: number, changePct: number, vwap: number, volume: number }` |
| `getNews(symbol)` | Fetches last 5 headlines and analyzes sentiment score (-1 to +1) | `{ symbol: string }` | `{ headlines: string[], sentimentScore: number }` |
| `getPortfolio()` | Retrieves current equity, cash, and total buying power | `{}` | `{ equity: number, cash: number, buyingPower: number }` |
| `getPositions()` | Retrieves all currently held stocks and weight | `{}` | `Position[]` |
| `getRecentTrades()` | Retrieves recent executed orders to prevent overtrading | `{}` | `Trade[]` |
| `evaluateRisk(proposal)` | Submits trade proposal to deterministic Risk Engine | `TradeProposal` | `RiskEvaluationResult` |
| `submitPaperOrder(order)`| Places order on Alpaca Paper Trading API (ONLY if risk approved) | `OrderPayload` | `AlpacaOrderResponse` |

---

## 4. Structured Output Zod Schema

The AI output is strictly validated against this Zod schema:

```typescript
import { z } from "zod";

export const AgentDecisionSchema = z.object({
  symbol: z.string().toUpperCase(),
  decision: z.enum(["BUY", "SELL", "HOLD"]),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(20),
  risk_assessment: z.enum(["LOW", "MEDIUM", "HIGH"]),
  suggested_allocation_pct: z.number().min(0).max(10), // Max 10% single trade
  market_summary: z.object({
    trend: z.enum(["BULLISH", "BEARISH", "SIDEWAYS"]),
    volume_analysis: z.string(),
    key_levels: z.object({
      support: z.number().optional(),
      resistance: z.number().optional(),
    }),
  }),
  news_sentiment: z.object({
    score: z.number().min(-1).max(1),
    headline_highlight: z.string(),
  }),
});

export type AgentDecision = z.infer<typeof AgentDecisionSchema>;
```
