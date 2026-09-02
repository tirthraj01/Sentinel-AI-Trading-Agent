# SENTINEL — AI Trading Agent & LLM Service Specification (Phase 5)

---

## 1. Agent Design Philosophy

The SENTINEL Agent functions like an institutional quantitative analyst preparing an auditable investment memo for a risk committee:
1. **Explainability First:** The agent must articulate the "why" behind every proposal using plain financial reasoning.
2. **Calibrated Confidence:** Algorithmic conviction (0 to 100) must reflect telemetry quality and penalize conflicting indicators or high volatility.
3. **Structured Outputs:** All responses are strictly enforced via Zod schemas, eliminating markdown hallucinations or malformed JSON.
4. **Decoupled Execution:** The LLM only proposes trade hypotheses; the independent mathematical Risk Engine holds absolute veto authority.

---

## 2. LLM Service Architecture

Located in [`backend/src/services/llmService.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/services/llmService.ts):

* **Multi-Provider Support:**
  - **Google Gemini (Recommended):** Integrated via `@google/genai` (default model `gemini-2.5-flash`).
  - **OpenAI, Anthropic, Groq:** Configurable via `LLM_PROVIDER` in `backend/.env`.
  - **High-Fidelity Deterministic Mock Engine:** Operates automatically when API keys are absent or invalid, ensuring 100% reliable local test execution.

---

## 3. Structured Output Schema

Defined in [`backend/src/schemas/llmSchema.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/schemas/llmSchema.ts):

```typescript
export const LLMAnalysisOutputSchema = z.object({
  marketTrend: z.enum(["BULLISH", "BEARISH", "SIDEWAYS"]),
  keyLevels: z.object({
    support: z.number().positive(),
    resistance: z.number().positive(),
  }),
  catalystAnalysis: z.string().min(5),
  newsSentimentScore: z.number().min(0).max(1),
  tradeRecommendation: z.object({
    action: z.enum(["BUY", "SELL", "HOLD"]),
    confidence: z.number().min(0).max(100),
    reasoning: z.string().min(10),
    suggestedAllocationPct: z.number().min(0).max(100),
    suggestedShares: z.number().int().min(0),
  }),
});
```

---

## 4. Prompts & Context Ingestion

Defined in [`backend/src/agents/prompts.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/agents/prompts.ts):

* **`SENTINEL_SYSTEM_PROMPT`:** Establishes risk-first mandate, capital preservation priority, and strict JSON requirements.
* **`buildMarketAnalysisPrompt`:** Ingests asset price action, 24h volume, session high/low, sector, news sentiment, and portfolio allocation context.

---

## 5. Automated Test Verification

Automated test suite in [`backend/src/__tests__/llm.test.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/__tests__/llm.test.ts) verifies:
* Structured memo generation for `NVDA` (`BUY`, bullish breakout, support/resistance levels).
* Risk-aware memo generation for `AAPL` (`HOLD`, respecting the 10.0% single-asset exposure ceiling).
* Strict schema validation against `LLMAnalysisOutputSchema` for both assets.
* Rejection of malformed schema payloads (invalid enums, out-of-bounds sentiment or confidence).
* Confidence score format adherence (numeric, 0–100 range).

**Test Results:**
```text
 ✓ src/__tests__/alpaca.test.ts (9 tests) 9ms
 ✓ src/__tests__/database.test.ts (9 tests) 9ms
 ✓ src/__tests__/llm.test.ts (6 tests) 10ms
 ✓ src/__tests__/api.test.ts (16 tests) 104ms
 Test Files  4 passed (4)
      Tests  40 passed (40)
```
