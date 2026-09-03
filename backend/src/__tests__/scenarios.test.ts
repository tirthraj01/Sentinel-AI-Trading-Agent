import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { riskEngine } from "../services/riskEngine.js";

describe("Phase 12 — Institutional Scenarios (A, B, C, D Verification)", () => {
  beforeEach(() => {
    riskEngine.setKillSwitch(false);
  });

  afterEach(() => {
    riskEngine.setKillSwitch(false);
  });

  // SCENARIO A: High-confidence buy -> Risk PASS -> Paper order placed -> DB updated
  describe("Scenario A: High-Confidence Buy (NVDA)", () => {
    it("should clear all 6 risk rules, submit Alpaca paper order, and update DB & portfolio", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "NVDA",
          forceScenario: "APPROVED",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const decision = res.body.data;

      // 1. Agent confidence high & buy recommendation
      expect(decision.decision).toBe("BUY");
      expect(decision.confidence).toBeGreaterThanOrEqual(70);

      // 2. Risk Engine cleared all checks
      expect(decision.riskResult.approved).toBe(true);
      expect(decision.riskResult.checks.every((c: any) => c.passed)).toBe(true);

      // 3. Alpaca Paper order placed
      expect(decision.status).toBe("APPROVED_EXECUTED");
      expect(decision.alpacaOrderId).toBeDefined();
      expect(decision.alpacaOrderId.startsWith("alpaca-")).toBe(true);

      // 4. DB records updated
      const tradesRes = await request(app).get("/api/trades?symbol=NVDA");
      const trade = tradesRes.body.data.find((t: any) => t.decisionId === decision.id);
      expect(trade).toBeDefined();
      expect(trade.status).toBe("filled");

      const positionsRes = await request(app).get("/api/positions");
      const pos = positionsRes.body.data.find((p: any) => p.symbol === "NVDA");
      expect(pos).toBeDefined();
      expect(pos.shares).toBeGreaterThan(0);
    });
  });

  // SCENARIO B: Sizing breach buy -> Risk VETO -> No order placed -> DB updated (blocked)
  describe("Scenario B: Sizing Breach (Position Exposure Limit)", () => {
    it("should detect position exposure > 10% ceiling, veto order, and prevent Alpaca broker submission", async () => {
      // Direct evaluation of oversized trade: 100 shares NVDA @ $128.90 = $12,890 + $8,378 existing = $21k (> 20% of $100k equity)
      const evalRes = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "NVDA",
          decision: "BUY",
          confidence: 90,
          shares: 100,
          price: 128.9,
          customEquity: 100000,
        });

      expect(evalRes.status).toBe(200);
      const evalData = evalRes.body.data;

      // 1. Vetoed by Risk Engine
      expect(evalData.approved).toBe(false);
      const posCheck = evalData.checks.find((c: any) => c.name === "max_position_size");
      expect(posCheck.passed).toBe(false);
      expect(evalData.reasons.some((r: string) => r.includes("10.0% single-asset limit"))).toBe(true);

      // 2. Pipeline execution verifies no order executed
      const agentRes = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "TSLA",
          forceScenario: "BLOCKED",
        });

      expect(agentRes.status).toBe(200);
      const decision = agentRes.body.data;
      expect(decision.status).toBe("BLOCKED_BY_RISK");
      expect(decision.alpacaOrderId).toBeUndefined();

      // 3. Blocked record logged in DB
      const tradesRes = await request(app).get("/api/trades?symbol=TSLA&status=blocked");
      const blockedTrade = tradesRes.body.data.find((t: any) => t.decisionId === decision.id);
      expect(blockedTrade).toBeDefined();
      expect(blockedTrade.status).toBe("blocked");
      expect(blockedTrade.riskReasons?.length).toBeGreaterThan(0);
    });
  });

  // SCENARIO C: Low-confidence buy -> Risk VETO -> No order placed -> DB updated (blocked)
  describe("Scenario C: Low-Confidence Buy (< 70% floor)", () => {
    it("should reject speculative buy with sub-70% conviction floor, keeping paper cash intact", async () => {
      // Evaluate proposal with 62% confidence (below 70% threshold)
      const evalRes = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 62.0,
          shares: 2,
          price: 228.65,
          customEquity: 100000,
        });

      expect(evalRes.status).toBe(200);
      const evalData = evalRes.body.data;

      expect(evalData.approved).toBe(false);
      const confCheck = evalData.checks.find((c: any) => c.name === "min_ai_confidence");
      expect(confCheck.passed).toBe(false);
      expect(confCheck.actual).toBe(62.0);
      expect(confCheck.threshold).toBe(70.0);
      expect(evalData.reasons.some((r: string) => r.includes("70.0%"))).toBe(true);
    });
  });

  // SCENARIO D: Circuit breaker active -> All buys blocked
  describe("Scenario D: Circuit Breaker Active (Daily Loss >= 2.0%)", () => {
    it("should trip emergency circuit breaker when portfolio daily loss is >= 2.0%, halting all BUY orders", async () => {
      // Test simulated drawdown of 2.8%
      const evalRes = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "MSFT",
          decision: "BUY",
          confidence: 95.0, // Even with 95% conviction, circuit breaker must take absolute precedence!
          shares: 1,
          price: 448.25,
          customDailyLossPercent: 2.8,
        });

      expect(evalRes.status).toBe(200);
      const evalData = evalRes.body.data;

      expect(evalData.approved).toBe(false);
      expect(evalData.riskLevel).toBe("CRITICAL");
      const lossCheck = evalData.checks.find((c: any) => c.name === "max_daily_loss");
      expect(lossCheck.passed).toBe(false);
      expect(lossCheck.actual).toBe(2.8);
      expect(lossCheck.threshold).toBe(2.0);
      expect(evalData.reasons.some((r: string) => r.includes("circuit breaker tripped"))).toBe(true);
    });
  });
});
