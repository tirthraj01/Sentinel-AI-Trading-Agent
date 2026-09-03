# SENTINEL — Real Frontend Data Integration (Phase 10)

This document specifies the integration of the React 18 dark terminal frontend with live backend services, real-time Server-Sent Events (SSE), and custom data hooks.

---

## 1. Architecture Overview

In Phase 10, static mock fixtures were replaced with reactive hooks and an API client layer connecting directly to the Node.js/TypeScript backend running on port 5000:

```
[ React 18 Frontend (:5173) ]
          │
          ├── Vite Proxy (/api -> http://localhost:5000/api)
          │
          ├── Custom Hooks:
          │     ├── usePortfolio()       ──> GET /api/portfolio (15s auto-refresh)
          │     ├── usePositions()       ──> GET /api/positions (15s auto-refresh)
          │     ├── useMarketData()      ──> GET /api/market
          │     ├── useAgentDecisions()  ──> GET /api/agent/decisions & POST /api/agent/analyze
          │     ├── useRiskStatus()      ──> GET /api/risk/status & POST /api/risk/kill-switch
          │     ├── useTradeHistory()    ──> GET /api/trades & POST /api/trades
          │     └── useAgentStream()     ──> GET /api/agent/stream (Live SSE Event Stream)
          │
          ├── Toast Notification System:
          │     └── ToastProvider & useToast() (Paper execution, risk veto, kill switch alerts)
          │
          └── Interactive Controls:
                ├── Analysis Modal: Real-time 6-stage autonomous cycle execution
                ├── Risk Engine: Emergency Kill Switch toggle & Dry-Run Simulator
                └── Trade History: Manual Paper Order placement to Alpaca
```

---

## 2. Implemented Hooks & Services

### 1. `usePortfolio` ([`frontend/src/hooks/usePortfolio.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/usePortfolio.ts))
* Tracks real-time paper cash balance, total equity, buying power, daily P/L, and historical equity curve.
* Auto-polls every 15 seconds; includes manual `refetch()` method.

### 2. `usePositions` ([`frontend/src/hooks/usePositions.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/usePositions.ts))
* Tracks live open holdings, unrealized P/L, market value, and portfolio concentration percentages.
* Warns when any position approaches the 10.0% single-asset risk ceiling.

### 3. `useMarketData` ([`frontend/src/hooks/useMarketData.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/useMarketData.ts))
* Retrieves real-time stock quotes, 24h gainers/losers, day range, volume, and P/E ratios.
* Provides live sector filtering (Technology, Semiconductors, Software, EV) and dynamic sorting.

### 4. `useAgentDecisions` ([`frontend/src/hooks/useAgentDecisions.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/useAgentDecisions.ts))
* Fetches explainable AI decision memos with confidence scores, catalysts, and deterministic risk check results.
* Exposes `triggerAnalysis(symbol, scenario)` to dispatch autonomous agent cycles.

### 5. `useRiskStatus` ([`frontend/src/hooks/useRiskStatus.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/useRiskStatus.ts))
* Monitors the 6 mathematical risk rules and ceiling utilization meters.
* Exposes `toggleKillSwitch(active)` for immediate emergency platform-wide order freezing.

### 6. `useTradeHistory` ([`frontend/src/hooks/useTradeHistory.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/useTradeHistory.ts))
* Retrieves filled paper orders and blocked trade interception audit logs.
* Exposes `submitTrade(params)` for manual order placement to the Alpaca paper sandbox.

### 7. `useAgentStream` ([`frontend/src/hooks/useAgentStream.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/hooks/useAgentStream.ts))
* Establishes a real-time Server-Sent Events (SSE) connection to `/api/agent/stream`.
* Streams live pipeline activity (`OBSERVE`, `ANALYZE`, `DECIDE`, `RISK_CHECK`, `EXECUTION`, `COMPLETE`) to the UI without polling.

---

## 3. UI Pages Connected

1. **Dashboard (`/`)**: Connects all 4 metric cards, equity chart, market pulse, latest AI decision, risk status, open positions, recent trades, and live activity stream.
2. **Markets (`/markets`)**: Live asset quotes, sorting by gainers/decliners/volume, sector filter tabs, and one-click agent screening.
3. **Portfolio (`/portfolio`)**: Real-time equity valuation, liquidity calculations, and interactive asset allocation donut chart.
4. **Positions (`/positions`)**: Active holdings table with exposure warnings, total unrealized P/L, and position detail drawer.
5. **AI Agent Command Center (`/agent`)**: Real-time state machine pipeline, explainable memos, confidence filters, and autonomous cycle trigger.
6. **Risk Engine (`/risk`)**: Interactive Emergency Kill Switch, 6 progress meters, recent veto logs, and live Dry-Run Risk Simulator.
7. **Trade History (`/trades`)**: Order execution ledger, risk-vetoed order inspection, and new paper order submission modal.
8. **Agent Activity Feed (`/activity`)**: Live SSE streaming timeline with connection heartbeat indicator.

---

## 4. Verification & Build Status

* **Frontend Production Build:**
  - `tsc && vite build`: compiled in 5.54s with **0 errors**.
* **Backend Test Suite:**
  - 8 test files passed, **77/77 tests passing**.
