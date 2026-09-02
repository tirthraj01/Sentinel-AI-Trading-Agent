# SENTINEL — Deterministic Risk Engine Specification

---

## 1. Why a Deterministic Risk Engine?

LLMs are probabilistic systems. Even state-of-the-art models can hallucinate, miscalculate percentages, or get swept into high-sentiment momentum during volatile market events.

In institutional finance, risk management is separated from alpha generation (traders). The **Risk Engine** acts as the Chief Risk Officer (CRO):
* It has veto power over any AI proposal.
* Its logic is 100% deterministic (mathematical formulas with zero LLM involvement).
* The AI **cannot** override, disable, or alter its rules.

---

## 2. Hardcoded & Configurable Safety Rules

| Rule Name | Default Limit | Purpose | Mathematical Condition |
| :--- | :--- | :--- | :--- |
| `maximum_position_exposure` | `10.0%` | Prevents over-concentration in a single asset | `(current_value + trade_value) / portfolio_equity <= 0.10` |
| `maximum_single_trade_allocation` | `5.0%` | Restricts size of individual orders | `trade_value / portfolio_equity <= 0.05` |
| `maximum_daily_loss` | `2.0%` | Circuit breaker: halts trading if daily drawdown hit | `abs(today_loss) / starting_equity <= 0.02` |
| `maximum_trades_per_day` | `10 trades` | Prevents algorithmic churn and excessive fees | `trades_today_count < 10` |
| `minimum_ai_confidence` | `70.0%` | Rejects low-conviction or speculative AI guesses | `proposal.confidence >= 70` |
| `sufficient_cash` | `100% covered` | Ensures order value does not exceed settled cash | `trade_value <= available_cash` |
| `position_ownership_for_sell` | `Strict` | Prohibits naked shorting | If action is `SELL`, owned `quantity >= order_quantity` |

---

## 3. Evaluation Payload & Output

### Input Proposal:
```typescript
interface TradeProposal {
  symbol: string;
  action: "BUY" | "SELL" | "HOLD";
  quantity: number;
  estimatedPrice: number;
  confidence: number;
}
```

### Risk Result Output (Approved Example):
```json
{
  "approved": true,
  "riskLevel": "LOW",
  "reasons": [],
  "checks": [
    {
      "name": "maximum_position_exposure",
      "threshold": 10.0,
      "actual": 4.8,
      "passed": true
    },
    {
      "name": "maximum_single_trade_allocation",
      "threshold": 5.0,
      "actual": 3.2,
      "passed": true
    },
    {
      "name": "minimum_confidence",
      "threshold": 70.0,
      "actual": 82.0,
      "passed": true
    },
    {
      "name": "maximum_daily_loss",
      "threshold": 2.0,
      "actual": 0.4,
      "passed": true
    },
    {
      "name": "sufficient_cash",
      "threshold": 15000.0,
      "actual": 3200.0,
      "passed": true
    }
  ]
}
```

### Risk Result Output (Blocked Example):
```json
{
  "approved": false,
  "riskLevel": "HIGH",
  "reasons": [
    "Maximum position exposure exceeded: Proposed trade would result in 13.5% portfolio allocation (limit is 10.0%).",
    "Minimum confidence threshold not met: AI confidence is 62.0% (required >= 70.0%)."
  ],
  "checks": [
    {
      "name": "maximum_position_exposure",
      "threshold": 10.0,
      "actual": 13.5,
      "passed": false
    },
    {
      "name": "minimum_confidence",
      "threshold": 70.0,
      "actual": 62.0,
      "passed": false
    }
  ]
}
```

---

## 4. Enforcement Guarantee

When a trade is **BLOCKED**:
1. No HTTP call is ever made to the Alpaca order endpoint.
2. A `risk_events` row is written to the database capturing the violation.
3. The UI explicitly alerts the user:
   > *"Trade blocked by Sentinel Risk Engine: Maximum position exposure exceeded."*
