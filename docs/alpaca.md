# SENTINEL — Alpaca Paper Trading Integration (Phase 4)

---

## 1. Safety Architecture: Paper Trading Exclusivity

SENTINEL is architected with strict, non-negotiable safety guardrails preventing any live-money execution.

### Hardcoded Safety Invariants:
1. **Paper Trading Flag Check:**  
   If `process.env.ALPACA_PAPER_TRADE === "false"`, the service immediately throws:
   `CRITICAL SAFETY GUARDRAIL: Live trading disabled! SENTINEL is strictly locked to Alpaca Paper Trading.`
2. **Base URL Guard:**  
   Base URL must strictly target `https://paper-api.alpaca.markets`. If configured with `https://api.alpaca.markets` (live broker endpoint), initialization throws a critical safety exception.
3. **Client-Side Isolation:**  
   The frontend never communicates with Alpaca directly. All operations are mediated by backend services, keeping API secrets protected.

---

## 2. Implemented Alpaca Paper Endpoints

Located in [`backend/src/services/alpacaService.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/services/alpacaService.ts):

### Account & Balances
* `GET /v2/account` (`alpacaService.getAccount()`):
  - Fetches account status (`ACTIVE`), paper currency (`USD`), cash, portfolio value, buying power, and paper flag (`is_paper: true`).

### Positions
* `GET /v2/positions` (`alpacaService.getPositions()`):
  - Returns open paper holdings with symbol, quantity, average entry price, market value, unrealized P/L, and portfolio weight.
* `GET /v2/positions/{symbol}` (`alpacaService.getPosition(symbol)`):
  - Retrieves single position metrics.

### Orders (Paper Trading Only)
* `POST /v2/orders` (`alpacaService.submitPaperOrder(...)`):
  - Submits market or limit orders with `time_in_force: "day"`.
  - Mapped to unique `alpacaOrderId`.
  - Updates portfolio cash and position shares in real-time.

---

## 3. Credentials & Resilient Sandbox Mode

* Configured in `backend/.env`:
  ```env
  ALPACA_PAPER_TRADE=true
  ALPACA_BASE_URL=https://paper-api.alpaca.markets
  ALPACA_DATA_URL=https://data.alpaca.markets
  ALPACA_API_KEY=your_alpaca_paper_api_key_here
  ALPACA_API_SECRET=your_alpaca_paper_api_secret_here
  ```
* **Resilient Graceful Fallback:**  
  When API keys are not yet configured or placeholder strings are present, `alpacaService` transparently executes within the high-fidelity local paper sandbox. Real Alpaca keys can be added at any time to connect directly to the live paper trading endpoint.

---

## 4. Rate Limit Tracking

* Tracks Alpaca response headers:
  - `x-ratelimit-remaining`
  - `x-ratelimit-reset`
* Method `alpacaService.getRateLimitStatus()` exposes live quota metrics to prevent HTTP 429 penalties.

---

## 5. Automated Test Verification

Automated test suite in [`backend/src/__tests__/alpaca.test.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/__tests__/alpaca.test.ts) verifies:
* Live trading rejection when `ALPACA_PAPER_TRADE=false`.
* Live endpoint rejection when base URL points to `api.alpaca.markets`.
* Fetching account with `is_paper=true`.
* Fetching positions list and individual ticker details.
* Paper order submission for 1 share of SPY and 2 shares of AAPL.
* Accurate position updates upon paper order execution.
* Rate limit monitoring.

**Test Results:**
```text
 ✓ src/__tests__/alpaca.test.ts (9 tests) 11ms
 ✓ src/__tests__/database.test.ts (9 tests) 6ms
 ✓ src/__tests__/api.test.ts (16 tests) 108ms
 Test Files  3 passed (3)
      Tests  34 passed (34)
```
