# SENTINEL — Alpaca Paper Trading Integration

---

## 1. Safety Architecture: Paper Trading Exclusivity

SENTINEL is architected with non-negotiable safety guardrails against live-money execution.

### Safety Invariants:
1. **Base URL Enforcement:**  
   The API client URL defaults to `https://paper-api.alpaca.markets` and `https://data.alpaca.markets`.
2. **Environment Variable Assertion:**  
   If `process.env.ALPACA_PAPER_TRADE !== "true"`, the backend crashes on startup before serving any traffic.
3. **Frontend Isolation:**  
   The React frontend never communicates with Alpaca directly. All Alpaca operations are mediated by the backend server, preventing any client-side credential leaks.

---

## 2. Implemented Capabilities

SENTINEL integrates the following Alpaca v2 endpoints:

### Account & Portfolio
* `GET /v2/account`: Fetches account status, buying power, equity, cash, currency, and portfolio margin.
* `GET /v2/positions`: Retrieves currently open stock positions, unrealized profit/loss, average entry prices, and market values.

### Orders (Paper Trading Only)
* `POST /v2/orders`: Places market or limit paper orders with fractional share support.
* `GET /v2/orders`: Inspects open or filled orders with timestamps and execution statuses.
* `DELETE /v2/orders/{order_id}`: Cancels an unfilled paper order.

### Market Data
* `GET /v2/stocks/{symbol}/quotes/latest`: Retrieves real-time ask/bid pricing.
* `GET /v2/stocks/{symbol}/bars`: Fetches historical 1-minute and 1-day candlestick bars for technical analysis.
* `GET /v2/stocks/snapshots`: Efficiently fetches quotes, day bars, and minute bars for multiple watchlist symbols simultaneously.

---

## 3. Error Handling Matrix

| Error Scenario | Alpaca Status Code | SENTINEL System Reaction | User-Facing Message |
| :--- | :--- | :--- | :--- |
| **Market Closed** | 403 / 422 | Rejects immediate execution; flags option for pre-market or queued order. | *"Market is currently closed. Trade cannot be executed immediately."* |
| **Insufficient Buying Power** | 403 | Caught early by Risk Engine; if triggered on Alpaca, logs event. | *"Insufficient paper buying power for order size."* |
| **Invalid Symbol** | 404 / 400 | Rejects proposal during initial market data retrieval. | *"Ticker symbol not recognized on US exchanges."* |
| **Rate Limiting** | 429 | Exponential backoff retry with jitter (up to 3 attempts). | *"Market data provider busy; retrying with backoff..."* |
| **Network Failure** | ETIMEDOUT / 500 | Fails safely. No fake trade confirmation is ever rendered. | *"Unable to communicate with Alpaca Paper API. Trade was NOT executed."* |
