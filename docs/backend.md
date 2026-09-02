# SENTINEL — Backend API Architecture

---

## 1. Backend Architecture Pattern

SENTINEL uses a strict **Controller-Service-Repository** pattern with explicit validation boundaries:

```
[ HTTP Request ]
       │
       ▼
 [ CORS & Logging Middleware ]  --> Attaches Correlation ID & Timestamp
       │
       ▼
   [ Route Definition ]         --> Declares path & HTTP verb
       │
       ▼
 [ Zod Validation Middleware ]  --> Validates body/query parameters; 400 Bad Request on failure
       │
       ▼
     [ Controller ]             --> Extracts params, delegates to Service, formats HTTP response
       │
       ▼
      [ Service ]               --> Core business logic (calls Agent, Risk Engine, Alpaca API)
       │
       ▼
 [ Database Client / Supabase ] --> Persists audit records and returns typed models
```

---

## 2. API Endpoints Specification

### System & Health
* `GET /api/health`
  * **Response:** `{ status: "ok", mode: "paper", alpacaConnected: true, databaseConnected: true, timestamp: "2026-09-03T01:30:00Z" }`

### Market & Watchlist
* `GET /api/market`
  * **Query:** `?symbols=AAPL,MSFT,NVDA,TSLA,SPY`
  * **Response:** Array of live quotes, day high/low, price change, volume, and sector.

### Portfolio & Positions
* `GET /api/portfolio`
  * **Response:** Aggregated balance, buying power, equity, cash, unrealized P/L, today's P/L.
* `GET /api/positions`
  * **Response:** Array of active holdings with symbol, quantity, average entry, current price, unrealized P/L, and portfolio weight.

### AI Agent
* `GET /api/agent/decisions`
  * **Query:** `?limit=20&symbol=AAPL`
  * **Response:** Chronological history of AI proposals with confidence, market context, and execution status.
* `GET /api/agent/activity`
  * **Response:** Detailed step-by-step trace events (`OBSERVE`, `ANALYZE`, `EVALUATE_RISK`, `EXECUTE`).
* `POST /api/agent/analyze`
  * **Body:** `{ symbol: "AAPL", overrideRules?: Partial<RiskRules> }`
  * **Response:** Complete agent execution cycle: market data gathered, LLM recommendation, risk check breakdown, and Alpaca order submission status.

### Risk Engine
* `GET /api/risk/status`
  * **Response:** Active risk thresholds, current utilization (portfolio exposure %, daily loss %, trades today count), and list of recent blocked trades.
* `POST /api/risk/evaluate`
  * **Body:** Proposed order (`symbol`, `action`, `quantity`, `price`, `confidence`).
  * **Response:** `{ approved: boolean, riskLevel: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", checks: [...], reasons: [...] }`.

### Trades
* `GET /api/trades`
  * **Query:** `?status=all|filled|blocked`
  * **Response:** Historical trades including Alpaca order IDs, fill prices, and linked AI decision IDs.
* `POST /api/trades`
  * **Body:** `{ symbol: "NVDA", action: "BUY", quantity: 5, type: "market", timeInForce: "day" }`
  * **Enforcement:** Dispatches proposal through Risk Engine before contacting Alpaca.

---

## 3. Standard Response Envelope

All API responses follow a consistent schema:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-03T01:30:00Z",
    "runId": "run_a8f93e4"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "RISK_CHECK_FAILED",
    "message": "Proposed position exceeds maximum allowable allocation (10.0%).",
    "details": [
      { "check": "maximum_position_exposure", "threshold": 10.0, "actual": 14.5 }
    ]
  },
  "meta": {
    "timestamp": "2026-09-03T01:30:00Z"
  }
}
```

---

## 4. Safety Fail-Safe Logic

1. **Strict Paper Trading Check:**
   Before initializing the Alpaca client, the backend verifies that `process.env.ALPACA_PAPER_TRADE === "true"`. If false or missing, the process terminates immediately with an exit code of `1`.
2. **Deterministic Risk Enforcer:**
   The `POST /api/trades` and `POST /api/agent/analyze` endpoints do not expose direct order execution functions. They only route through `riskService.validateAndExecute()`.
