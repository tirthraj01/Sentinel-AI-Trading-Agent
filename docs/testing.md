# SENTINEL — Comprehensive Testing Strategy

---

## 1. Testing Philosophy & Boundaries

In a risk-aware financial agent, tests must prove that the **Risk Engine cannot be bypassed** under any condition, including:
1. When the AI is overly confident.
2. When the LLM outputs malformed JSON.
3. When external APIs time out or return rate limits.
4. When market data feeds contain anomalies or missing fields.

---

## 2. Test Suites Matrix

| Layer | Target System | Test Focus | Method |
| :--- | :--- | :--- | :--- |
| **Unit** | Risk Engine | Boundary conditions, rounding errors, exposure threshold calculations, confidence floors | Vitest / Jest |
| **Unit** | AI Schemas | Zod validation of structured outputs, rejection of extra/missing fields | Vitest |
| **Integration**| Express REST API | Route handling, HTTP status codes, error middleware, controller delegations | Supertest |
| **Integration**| Alpaca Paper Service | Paper API authentication, market bar parsing, order submission and cancellation | Vitest + Alpaca Sandbox |
| **Integration**| Database Auditing | PostgreSQL inserts for agent runs, decisions, risk events, and trades | Supabase Local / Mock |
| **E2E / Flow** | Full Agent Lifecycle | End-to-end execution flow from trigger to audit log | Automated integration script |

---

## 3. The Two Critical Proof-of-Concept Scenarios

To prove system integrity to hackathon judges, SENTINEL implements automated tests for two core scenarios:

### Scenario A: The Approved Trade Flow
```
1. Market analysis for AAPL produces:
   - Decision: BUY
   - Confidence: 85% (>= 70% required)
   - Suggested Allocation: 4% (<= 5% limit)
   - Estimated Cost: $4,000 (Account Cash: $50,000)
2. Risk Engine evaluates 5 hard rules:
   - Rule 1 (Position Exposure): PASS (Total exposure 7.5% <= 10%)
   - Rule 2 (Trade Allocation): PASS (4% <= 5%)
   - Rule 3 (AI Confidence): PASS (85% >= 70%)
   - Rule 4 (Daily Loss Circuit): PASS (0.2% <= 2%)
   - Rule 5 (Cash Liquidity): PASS ($4,000 <= $50,000)
3. Risk Verdict: APPROVED
4. Action: Alpaca Paper API POST /v2/orders is invoked.
5. Verification:
   - Alpaca returns order ID (e.g., `9f4a-4b9c...`)
   - `trades` table updated with `submitted`
   - `risk_events` table logs `approved = true`
   - UI reflects order placement.
```

### Scenario B: The Blocked Trade Flow (Risk Override)
```
1. Market analysis for TSLA produces:
   - Decision: BUY
   - Confidence: 64% (< 70% required) OR Suggested Allocation: 14% (> 10% exposure limit)
2. Risk Engine evaluates rules:
   - Rule: Position Exposure or Min Confidence FAILS
3. Risk Verdict: BLOCKED
4. Action: ZERO calls made to Alpaca order endpoint.
5. Verification:
   - Alpaca order API is NEVER called (verified via spy/mock)
   - `risk_events` table logs `approved = false` with failure reason
   - `agent_activity` logs stage: "RISK_CHECK", message: "Trade BLOCKED by Risk Engine"
   - UI renders bold red alert with exact violation description.
```

---

## 4. Test Execution Commands

```bash
# Run all backend unit and integration tests
cd backend
npm run test

# Run risk engine test suite specifically
npm run test:risk

# Run full integration end-to-end test
npm run test:e2e
```
