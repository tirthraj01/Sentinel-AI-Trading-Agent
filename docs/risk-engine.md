# SENTINEL — Deterministic Mathematical Risk Engine Specification (Phase 8)

---

## 1. Why a Deterministic Risk Engine?

LLMs are probabilistic systems. Even advanced frontier models can hallucinate, miscalculate position weights, or get swept into high-sentiment momentum during volatile market disruptions.

In institutional finance, risk management is strictly separated from alpha generation (traders). The **SENTINEL Risk Engine** acts as an automated Chief Risk Officer (CRO):
* **Zero LLM in the risk loop:** 100% deterministic mathematical formulas.
* **Absolute Veto Power:** If even a single rule fails, execution is immediately halted. The AI cannot negotiate, modify, or override risk decisions.
* **Explainable Verdicts:** Emits exact numerical thresholds, actual values, and human-readable failure explanations.

---

## 2. The 6 Deterministic Safety Rules

Located in [`backend/src/services/riskEngine.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/services/riskEngine.ts):

| Rule Name | Limit | Mathematical Formula | Failure Reaction |
| :--- | :--- | :--- | :--- |
| **1. Max Position Size** | `10.0%` | $\frac{\text{existingValue} + \text{proposedCost}}{\text{totalEquity}} \times 100 \le 10.0\%$ | Rejects proposal to prevent single-asset over-concentration. |
| **2. Max Single Trade Size** | `5.0%` | $\frac{\text{proposedCost}}{\text{totalEquity}} \times 100 \le 5.0\%$ | Caps trade allocation to control liquidity and sizing risk. |
| **3. Daily Loss Circuit Breaker** | `2.0%` | $\text{drawdownTodayPercent} < 2.0\%$ | Freezes all BUY orders immediately across the entire portfolio. |
| **4. Minimum AI Confidence** | `70.0%` | $\text{confidenceScore} \ge 70.0\%$ | Rejects low-conviction or speculative AI proposals. |
| **5. Max Daily Executions** | `10 trades` | $\text{filledTradesToday} < 10$ | Halts trading to prevent algorithmic churn and runaway fees. |
| **6. Max Sector Exposure** | `40.0%` | $\frac{\text{sectorValue} + \text{proposedCost}}{\text{totalEquity}} \times 100 \le 40.0\%$ | Prevents clustered systemic sector exposure (e.g. Tech/Semis). |

---

## 3. Emergency Overrides & Circuit Breakers

* **Emergency Kill Switch:**
  - Can be toggled on/off instantly via `POST /api/risk/kill-switch`.
  - When active, all paper order submissions and trade evaluations are strictly blocked with `riskLevel: "CRITICAL"`.
* **Automatic Circuit Breaker:**
  - Auto-triggers if portfolio daily loss hits or exceeds 2.0%.
  - Freezes all BUY orders until the next market session.

---

## 4. REST API Endpoints

1. **`GET /api/risk/status`**:
   - Returns active rules, current utilization, recent vetoes, and `killSwitchActive` boolean.
2. **`POST /api/risk/evaluate`**:
   - Body: `{ symbol, decision, confidence, shares, price, customEquity? }`
   - Evaluates any proposed trade against the mathematical engine without executing it.
3. **`POST /api/risk/kill-switch`**:
   - Body: `{ active: boolean }`
   - Engages or disengages the emergency freeze switch.

---

## 5. Automated Test Verification

Automated test suite in [`backend/src/__tests__/risk.test.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/__tests__/risk.test.ts) verifies:
* Individual rule testing (Pass case vs. Fail case for all 6 rules).
* Combined complex scenarios:
  - Valid trade passes all checks $\to$ `APPROVED` with `LOW` risk.
  - High-confidence (90%) but oversized trade (7%) $\to$ `REJECTED`.
  - Right-sized (2%) but low-confidence (65%) $\to$ `REJECTED`.
  - Trading after daily loss circuit breaker triggered $\to$ `REJECTED` with `CRITICAL` risk.
  - Emergency kill switch active $\to$ `REJECTED` with `CRITICAL` risk.
* REST API endpoints: `GET /api/risk/status`, `POST /api/risk/evaluate`, `POST /api/risk/kill-switch`.

**Test Results:**
```text
 ✓ src/__tests__/alpaca.test.ts (9 tests) 15ms
 ✓ src/__tests__/database.test.ts (9 tests) 12ms
 ✓ src/__tests__/llm.test.ts (6 tests) 14ms
 ✓ src/__tests__/agent.test.ts (5 tests) 16ms
 ✓ src/__tests__/mcp.test.ts (11 tests) 78ms
 ✓ src/__tests__/risk.test.ts (18 tests) 88ms
 ✓ src/__tests__/api.test.ts (16 tests) 172ms
 Test Files  7 passed (7)
      Tests  74 passed (74)
   Duration  1.65s
```
