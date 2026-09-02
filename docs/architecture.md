# SENTINEL — System Architecture Specification (Phase 9)

> **Tagline:** *"An explainable, risk-aware AI trading agent."*

---

## 1. High-Level End-to-End Architecture

SENTINEL operates on an integrated dual-layer pipeline:
1. **The AI Agent Layer:** Ingests market telemetry, news sentiment, and portfolio context to formulate hypothesis-driven trade proposals with plain-English rationales and confidence scores.
2. **The Deterministic Risk Layer:** An isolated mathematical rule engine that verifies hard financial constraints (position ceilings, daily loss limits, minimum conviction floor). Zero LLMs participate in risk evaluations.

```
                              +-----------------------------------------------------+
                              |                  SENTINEL CLIENT                    |
                              |         React + Vite + Tailwind CSS + Recharts       |
                              |         (Modern Fintech Dark Trading Terminal)      |
                              +--------------------------+--------------------------+
                                                         |
                                                         | HTTP REST & SSE Stream (/api/agent/stream)
                                                         v
                              +-----------------------------------------------------+
                              |                 EXPRESS BACKEND (Node.js)           |
                              |            TypeScript + Zod Validation Layer        |
                              +--------------------------+--------------------------+
                                                         |
                 +---------------------------------------+-------------------------------------+
                 |                                       |                                     |
                 v                                       v                                     v
     +-----------------------+               +-----------------------+             +-----------------------+
     |   AI TRADING AGENT    |               |      RISK ENGINE      |             |    ALPACA SERVICE     |
     |  (LLM + Multi-Signal) |               | (Deterministic Math)  |             |  (Paper Trading Only) |
     +-----------+-----------+               +-----------+-----------+             +-----------+-----------+
                 |                                       ^                                     |
                 | 1. Generates Proposal                 | 2. Validates Proposal               | 3. If Approved
                 +---------------------------------------+                                     |
                                                         |                                     v
                                                         +-------------------------> [ Submit Paper Order ]
                                                                                               |
                                                                                               v
                                                                                   +-----------------------+
                                                                                   |    SUPABASE / PG      |
                                                                                   |   (Audit Database)    |
                                                                                   +-----------------------+
```

---

## 2. The 6-Stage End-to-End Execution Flow

```
[ TRIGGER: UI or POST /api/agent/analyze ]
                    │
                    ▼
           1. OBSERVE (Telemetry Ingestion)
              ├── Real-Time Quote & 24h Volume
              ├── Macro News Sentiment Score
              └── Portfolio Cash & Equity Balance
                    │
                    ▼
           2. ANALYZE (Multi-Signal Synthesis)
              ├── RSI Technical Momentum
              ├── 20-Day EMA Trend Cross
              └── Sector Exposure Fit
                    │
                    ▼
           3. DECIDE (LLM Structured Reasoning)
              └── Zod-Validated Proposal (Action, Confidence, Shares, Allocation %, Key Levels)
                    │
                    ▼
           4. RISK CHECK (Deterministic Evaluation)
              ├── Checks: Max Position (10%), Single Trade (5%), Drawdown (2%), Confidence (70%)
              └── Emits: APPROVED or BLOCKED
                    │
           ┌────────┴────────┐
           ▼                 ▼
      [ APPROVED ]      [ BLOCKED ]
           │                 │
           ▼                 ▼
   5A. Submit Paper   5B. Record Risk Veto
       Order to Alpaca    (Zero Capital Lost)
           │                 │
           └────────┬────────┘
                    ▼
           6. RECORD & BROADCAST (SSE Stream)
              ├── Persist Decision Memo to Supabase / Repository
              ├── Persist Orders / Blocked Records
              └── Stream Real-Time Events to Frontend via `/api/agent/stream`
```

---

## 3. Real-Time Telemetry: Server-Sent Events (SSE)

* Implemented in [`backend/src/services/eventBus.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/services/eventBus.ts).
* Endpoint: `GET /api/agent/stream`.
* Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`.
* Allows frontends to subscribe to live agent thinking steps, risk verdicts, and order fill confirmations without polling.

---

## 4. End-to-End Verification Matrix

Automated integration test suite in [`backend/src/__tests__/integration.test.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/__tests__/integration.test.ts) verifies:
* **Approved Scenario (NVDA):** Trigger $\to$ Observe $\to$ Decide $\to$ Risk Passed $\to$ Alpaca Paper Order Filled $\to$ DB Persisted $\to$ Balance Synchronized.
* **Vetoed Scenario (TSLA):** Trigger $\to$ Low Conviction / Sizing Violation $\to$ Risk Vetoed $\to$ Zero Broker Execution $\to$ 100% Capital Protected $\to$ Blocked Record Logged.
* **Live SSE Stream:** Verified headers, connection lifecycle, and event broadcasting.

**Test Results:**
```text
 ✓ src/__tests__/alpaca.test.ts (9 tests) 15ms
 ✓ src/__tests__/database.test.ts (9 tests) 12ms
 ✓ src/__tests__/llm.test.ts (6 tests) 14ms
 ✓ src/__tests__/agent.test.ts (5 tests) 16ms
 ✓ src/__tests__/mcp.test.ts (11 tests) 78ms
 ✓ src/__tests__/risk.test.ts (18 tests) 85ms
 ✓ src/__tests__/integration.test.ts (3 tests) 151ms
 ✓ src/__tests__/api.test.ts (16 tests) 154ms
 Test Files  8 passed (8)
      Tests  77 passed (77)
   Duration  1.58s
```
