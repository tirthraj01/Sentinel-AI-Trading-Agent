# SENTINEL — Agent Transparency Feed & Decision Waterfall Specification (Phase 11)

---

## 1. Overview

AI agents in finance cannot operate as opaque black boxes. When an autonomous system decides to commit or refuse capital, human overseers, risk managers, and auditors require an immediate, explainable trace of:
1. What facts were observed.
2. How technical momentum was interpreted.
3. Why the investment hypothesis was formed.
4. What trade was proposed.
5. How mathematical risk guardrails evaluated the proposal.
6. What final broker execution or veto verdict was rendered.

The **SENTINEL Decision Waterfall** ([`frontend/src/components/DecisionWaterfall.tsx`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/components/DecisionWaterfall.tsx)) implements this exact transparency pipeline in real time.

---

## 2. The 6 Waterfall Stages

```
[ TRIGGER CYCLE ]
       │
       ├─► 1. OBSERVATION (18ms)
       │    ├── Quotes & Moving Bars (Alpaca Data v2)
       │    ├── Order Book Depth & Institutional Volume
       │    └── Macro NLP Sentiment Score (+0.75 / -0.55)
       │
       ├─► 2. TECHNICAL ANALYSIS (34ms)
       │    ├── 20-day / 50-day EMA Trend Cross
       │    ├── RSI Momentum (e.g. 58.4 Neutral-Bullish)
       │    └── Support & Resistance Boundaries
       │
       ├─► 3. REASONING & HYPOTHESIS (210ms)
       │    ├── Institutional Investment Thesis
       │    ├── Catalyst & Fundamental Drivers
       │    └── Algorithmic Conviction Score (70% - 95%)
       │
       ├─► 4. PROPOSED TRADE (12ms)
       │    ├── Action: BUY / HOLD / SELL
       │    ├── Suggested Quantity & Allocation %
       │    └── Order Routing: Alpaca Paper Trading
       │
       ├─► 5. DETERMINISTIC RISK CHECK (4ms) [CRO GATE]
       │    ├── Rule 1: Max Position Exposure (10% ceiling)
       │    ├── Rule 2: Max Single Trade Size (5% ceiling)
       │    ├── Rule 3: Daily Drawdown Circuit Breaker (<2%)
       │    ├── Rule 4: Minimum AI Conviction Floor (>=70%)
       │    ├── Rule 5: Max Daily Trades Limit (<10)
       │    └── Rule 6: Max Sector Exposure (<=40%)
       │
       └─► 6. FINAL EXECUTION VERDICT (85ms)
            ├── IF APPROVED: Submitted to Alpaca & Order ID Emitted
            └── IF BLOCKED: Veto Memo Recorded, 100% Capital Protected
```

---

## 3. Interactive UI Features

* **Step Latency Profiling:** Displays step-by-step latency (`18ms`, `34ms`, `210ms`, `12ms`, `4ms`, `85ms`) and total pipeline execution time (`353ms`).
* **Collapsible Details:** Each step has an expand/collapse toggle revealing granular exchange parameters and reasoning text.
* **Visual Progress Bars:** Dynamic progress meters for each of the 6 risk rules displaying exact percentage of ceiling utilized.
* **Run Switcher & Filters:** Easily switch between `All Runs`, `Approved Only`, and `Blocked / Vetoed Only`.
* **Inline Card Waterfall:** Expandable directly within any AI Decision Card on the Dashboard and AI Agent Command Center.

---

## 4. Verification

* **Frontend Production Build:** `tsc && vite build` compiled with **0 errors**.
* **Backend Test Suite:** 8 test files passed, **77/77 tests passing**.
