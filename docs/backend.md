# SENTINEL — Backend API Architecture (Phase 2)

---

## 1. Backend Architecture Pattern

SENTINEL uses a strict **Controller-Service-Repository** pattern with explicit validation boundaries and deterministic safety guarantees:

```
[ HTTP Request ]
       │
       ▼
 [ CORS & Logging Middleware ]  --> Attaches Correlation ID & Execution Latency
       │
       ▼
   [ Route Definition ]         --> Declares path & HTTP verb
       │
       ▼
 [ Zod Validation Middleware ]  --> Validates body/query parameters; 400 Bad Request on schema failure
       │
       ▼
     [ Controller ]             --> Extracts params, delegates to Service, formats HTTP response
       │
       ▼
      [ Service ]               --> Core business logic (Agent, Risk Engine, Mock Alpaca)
       │
       ▼
 [ In-Memory / Supabase Store ] --> Persists audit records and returns typed models
```

---

## 2. API Endpoints Specification (Phase 2 Implemented)

### System & Health
* `GET /api/health`
  * **Response:** `{ success: true, data: { status: "healthy", service: "sentinel-backend", version: "0.1.0", paperTrading: true, uptimeSeconds: 42 } }`

### Market & Watchlist
* `GET /api/market`
  * Returns full list of tracked equities (`AAPL`, `NVDA`, `MSFT`, `TSLA`, `GOOGL`, `AMZN`, `SPY`).
* `GET /api/market?symbol=NVDA`
  * Returns quote and news sentiment score for specific ticker.
  * Returns `404 Not Found` if ticker is untracked.

### Portfolio & Positions
* `GET /api/portfolio`
  * Returns Alpaca paper account details and portfolio equity balance ($104,850.25), available cash ($42,120.80), and buying power ($84,241.60).
* `GET /api/positions`
  * Returns array of open paper holdings with symbol, quantity, average entry price, current price, market value, unrealized P/L, and portfolio weight.

### Trades
* `GET /api/trades`
  * Supports `?symbol=NVDA`, `?status=filled|blocked`, and `?limit=20`.
* `POST /api/trades`
  * **Body:** `{ "symbol": "AAPL", "side": "BUY", "shares": 10, "orderType": "market" }`
  * Validates with Zod. Simulates order fill on paper account and updates position balance.

### AI Agent
* `GET /api/agent/decisions`
  * Returns chronological list of AI trade proposals with conviction scores, technical summaries, and risk verdicts.
* `GET /api/agent/activity`
  * Returns step-by-step trace events (`OBSERVE`, `ANALYZE`, `RISK_CHECK`, `EXECUTION`, `COMPLETE`, `BLOCKED`).
* `POST /api/agent/analyze`
  * **Body:** `{ "symbol": "NVDA", "forceScenario": "APPROVED" | "BLOCKED" | "AUTO" }`
  * **Lifecycle Executed:**
    1. `OBSERVE`: Ingests market quotes, volume metrics, and news sentiment.
    2. `ANALYZE`: Generates structured reasoning memo.
    3. `DECIDE`: Proposes BUY/SELL/HOLD with conviction score.
    4. `RISK CHECK`: Evaluates against 6 deterministic mathematical rules.
    5. `EXECUTE`: Submits paper order if approved; vetoes and blocks if any rule fails.
    6. `RESULT`: Records audit decision and returns complete execution payload.

### Risk Engine
* `GET /api/risk/status`
  * Returns active guard status, 6 deterministic safety rules, threshold limits, and recent veto history.

---

## 3. Error Handling Specifications

* **`400 Bad Request`**: Schema validation failure via Zod:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed",
      "details": [{ "field": "shares", "message": "Shares must be greater than zero" }]
    },
    "meta": { "timestamp": "2026-09-02T20:39:20.359Z" }
  }
  ```
* **`404 Not Found`**: Undefined routes or missing symbols:
  ```json
  {
    "success": false,
    "error": { "code": "NOT_FOUND", "message": "Cannot GET /api/nonexistent" },
    "meta": { "timestamp": "2026-09-02T20:39:24.138Z" }
  }
  ```
* **`500 Internal Error`**: Unhandled runtime exceptions caught by global error middleware.

---

## 4. Test Verification

Automated test suite located at `backend/src/__tests__/api.test.ts` covers:
* `GET /api/health`
* `GET /api/market` & single symbol query
* `GET /api/portfolio` & `GET /api/positions`
* `GET /api/trades` & `POST /api/trades`
* `GET /api/agent/decisions` & `GET /api/agent/activity`
* `POST /api/agent/analyze` (Scenario A Approved & Scenario B Vetoed)
* `GET /api/risk/status`
* `400 Bad Request` schema failure handling
* `404 Not Found` route handling

**Result:** 16/16 tests passing cleanly in 106ms.
