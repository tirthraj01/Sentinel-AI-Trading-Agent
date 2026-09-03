# SENTINEL — Interactive Demo Mode & Walkthrough (Phase 15)

This document outlines the Interactive Demo Mode and Guided Walkthrough systems implemented for judging, live presentations, and sandbox evaluation of SENTINEL.

---

## 1. Demo Mode Architecture

Demo Mode allows users and hackathon judges to experience the deterministic safety invariants of SENTINEL without manual parameter tweaking:

| Scenario | Title | Condition Simulated | Expected Risk Verdict | Broker Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Scenario A** | **Standard Buy** | NVDA $85\%$ confidence, bullish catalyst, within size limits | **APPROVED** | Order submitted to Alpaca Paper, filled, position opens |
| **Scenario B** | **Position Sizing Veto** | TSLA trade exceeding $10\%$ single-asset ceiling | **VETOED** | Blocked by deterministic risk engine, zero capital allocated |
| **Scenario C** | **Low Conviction Veto** | Speculative buy with $64\%$ confidence ($< 70\%$ floor) | **VETOED** | Blocked by conviction floor rule, capital preserved |
| **Scenario D** | **Circuit Breaker Halt** | Simulated intraday drawdown reaching $2.5\%$ ($\ge 2.0\%$) | **HALTED** | Platform emergency freeze, all BUY orders halted |

---

## 2. API Endpoints

### `POST /api/demo/trigger-scenario`
* **Request Payload:**
  ```json
  {
    "scenario": "A" // Options: "A", "B", "C", "D"
  }
  ```
* **Response (Scenario A Example):**
  ```json
  {
    "success": true,
    "scenario": "A",
    "data": {
      "id": "dec-18a3",
      "symbol": "NVDA",
      "status": "APPROVED_EXECUTED",
      "alpacaOrderId": "alpaca-ord-18a3"
    }
  }
  ```

### `POST /api/demo/reset`
* Restores portfolio balance back to initial clean state ($100,000 cash, 0 open positions, 0 open trades, kill switch disarmed).

---

## 3. Frontend Interactive Components

* **Demo Mode Banner ([`frontend/src/components/DemoModeBanner.tsx`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/components/DemoModeBanner.tsx)):**
  - Sticky tray below navbar with 4 one-click scenario triggers (A, B, C, D).
  - One-click portfolio reset button returning balance to $100K.
  - Floating status notifications informing the user of the exact risk rule triggered.
* **Guided Walkthrough Modal ([`frontend/src/components/GuidedTourModal.tsx`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/components/GuidedTourModal.tsx)):**
  - 5-step institutional tour highlighting:
    1. Institutional Portfolio Valuation ($100K allocation).
    2. AI Agent Market Surveillance (Perception & LLM Reasoning).
    3. Deterministic Risk Engine (6 strict mathematical rules).
    4. Transparent Decision Waterfall (6 collapsible stages with microsecond latencies).
    5. Strict Paper Trading Safeguards (hardcoded zero live exposure).
