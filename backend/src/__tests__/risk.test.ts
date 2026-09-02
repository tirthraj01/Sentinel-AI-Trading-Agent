import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { riskEngine } from "../services/riskEngine.js";

describe("Deterministic Mathematical Risk Engine (Phase 8)", () => {
  beforeEach(() => {
    riskEngine.setKillSwitch(false);
  });

  afterEach(() => {
    riskEngine.setKillSwitch(false);
  });

  describe("Individual Rule Testing (Pass vs Fail)", () => {
    // RULE 1: Max Position Size (10% limit)
    describe("Rule 1: Max Position Size (10% ceiling)", () => {
      it("should PASS when total projected position is <= 10%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "NVDA",
          decision: "BUY",
          confidence: 85,
          shares: 5,
          price: 128.9,
          customEquity: 100000,
        });

        const check = result.checks.find((c) => c.name === "max_position_size");
        expect(check?.passed).toBe(true);
      });

      it("should FAIL when total projected position exceeds 10%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "NVDA",
          decision: "BUY",
          confidence: 85,
          shares: 80, // 80 * 128.9 = $10,312 + existing $8,378 = ~$18.6k (18.6% > 10%)
          price: 128.9,
          customEquity: 100000,
        });

        const check = result.checks.find((c) => c.name === "max_position_size");
        expect(check?.passed).toBe(false);
        expect(result.approved).toBe(false);
        expect(result.reasons.some((r) => r.includes("10.0% single-asset limit"))).toBe(true);
      });
    });

    // RULE 2: Max Single Trade Size (5% limit)
    describe("Rule 2: Max Single Trade Size (5% ceiling)", () => {
      it("should PASS when single trade allocation is <= 5%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "SPY",
          decision: "BUY",
          confidence: 85,
          shares: 5, // 5 * 550 = $2,750 (2.75% of $100k)
          price: 550.0,
          customEquity: 100000,
        });

        const check = result.checks.find((c) => c.name === "max_single_trade");
        expect(check?.passed).toBe(true);
      });

      it("should FAIL when single trade allocation exceeds 5%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "SPY",
          decision: "BUY",
          confidence: 85,
          shares: 15, // 15 * 550 = $8,250 (8.25% > 5%)
          price: 550.0,
          customEquity: 100000,
        });

        const check = result.checks.find((c) => c.name === "max_single_trade");
        expect(check?.passed).toBe(false);
        expect(result.approved).toBe(false);
        expect(result.reasons.some((r) => r.includes("5.0% single-trade limit"))).toBe(true);
      });
    });

    // RULE 3: Daily Loss Circuit Breaker (2% limit)
    describe("Rule 3: Daily Loss Circuit Breaker (2% limit)", () => {
      it("should PASS when daily drawdown is < 2.0%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 85,
          shares: 5,
          price: 228.65,
          customDailyLossPercent: 0.8,
        });

        const check = result.checks.find((c) => c.name === "max_daily_loss");
        expect(check?.passed).toBe(true);
      });

      it("should FAIL and trigger circuit breaker when daily drawdown is >= 2.0%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 85,
          shares: 5,
          price: 228.65,
          customDailyLossPercent: 2.3, // 2.3% drawdown trips circuit breaker
        });

        const check = result.checks.find((c) => c.name === "max_daily_loss");
        expect(check?.passed).toBe(false);
        expect(result.approved).toBe(false);
        expect(result.riskLevel).toBe("CRITICAL");
        expect(result.reasons.some((r) => r.includes("circuit breaker tripped"))).toBe(true);
      });
    });

    // RULE 4: Minimum AI Confidence (70% floor)
    describe("Rule 4: Minimum AI Conviction Floor (70%)", () => {
      it("should PASS when AI confidence is >= 70.0%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "MSFT",
          decision: "BUY",
          confidence: 78.5,
          shares: 2,
          price: 448.25,
        });

        const check = result.checks.find((c) => c.name === "min_ai_confidence");
        expect(check?.passed).toBe(true);
      });

      it("should FAIL when AI confidence is < 70.0%", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "MSFT",
          decision: "BUY",
          confidence: 68.0, // Below 70% threshold
          shares: 2,
          price: 448.25,
        });

        const check = result.checks.find((c) => c.name === "min_ai_confidence");
        expect(check?.passed).toBe(false);
        expect(result.approved).toBe(false);
        expect(result.reasons.some((r) => r.includes("70.0% algorithmic conviction floor"))).toBe(true);
      });
    });

    // RULE 5: Max Daily Trades (10 limit)
    describe("Rule 5: Max Daily Trades Quota (10 executions)", () => {
      it("should PASS when executed trades count is < 10", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "AMZN",
          decision: "BUY",
          confidence: 82,
          shares: 5,
          price: 188.7,
          customDailyTradesCount: 4,
        });

        const check = result.checks.find((c) => c.name === "max_daily_trades");
        expect(check?.passed).toBe(true);
      });

      it("should FAIL when executed trades count has reached 10", () => {
        const result = riskEngine.evaluateProposal({
          symbol: "AMZN",
          decision: "BUY",
          confidence: 82,
          shares: 5,
          price: 188.7,
          customDailyTradesCount: 10,
        });

        const check = result.checks.find((c) => c.name === "max_daily_trades");
        expect(check?.passed).toBe(false);
        expect(result.approved).toBe(false);
        expect(result.reasons.some((r) => r.includes("Maximum daily execution quota reached"))).toBe(true);
      });
    });
  });

  describe("Combined Complex Scenarios", () => {
    it("Scenario 1: Valid trade passes all checks -> APPROVED with LOW risk", () => {
      const result = riskEngine.evaluateProposal({
        symbol: "AMZN",
        decision: "BUY",
        confidence: 86.0,
        shares: 5,
        price: 188.7,
        customDailyLossPercent: 0.0,
        customDailyTradesCount: 2,
      });

      expect(result.approved).toBe(true);
      expect(result.riskLevel).toBe("LOW");
      expect(result.reasons.length).toBe(0);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it("Scenario 2: High-confidence (90%) but oversized trade (7%) -> REJECTED", () => {
      const result = riskEngine.evaluateProposal({
        symbol: "AMZN",
        decision: "BUY",
        confidence: 90.0, // High conviction
        shares: 40, // 40 * 188.70 = $7,548 (~7.2% of equity -> oversized)
        price: 188.7,
        customEquity: 104850,
      });

      expect(result.approved).toBe(false);
      expect(result.reasons.some((r) => r.includes("5.0% single-trade limit"))).toBe(true);
    });

    it("Scenario 3: Right-sized trade (2%) but low-confidence (65%) -> REJECTED", () => {
      const result = riskEngine.evaluateProposal({
        symbol: "NVDA",
        decision: "BUY",
        confidence: 65.0, // Fails conviction floor
        shares: 10, // Small trade
        price: 128.9,
      });

      expect(result.approved).toBe(false);
      expect(result.reasons.some((r) => r.includes("70.0%"))).toBe(true);
    });

    it("Scenario 4: Trading after daily loss limit hit (2.5%) -> REJECTED with CRITICAL risk", () => {
      const result = riskEngine.evaluateProposal({
        symbol: "NVDA",
        decision: "BUY",
        confidence: 88.0,
        shares: 5,
        price: 128.9,
        customDailyLossPercent: 2.5,
      });

      expect(result.approved).toBe(false);
      expect(result.riskLevel).toBe("CRITICAL");
      expect(result.reasons.some((r) => r.includes("circuit breaker tripped"))).toBe(true);
    });

    it("Scenario 5: Emergency kill switch active -> REJECTED with CRITICAL risk", () => {
      riskEngine.setKillSwitch(true);

      const result = riskEngine.evaluateProposal({
        symbol: "NVDA",
        decision: "BUY",
        confidence: 95.0,
        shares: 1,
        price: 128.9,
      });

      expect(result.approved).toBe(false);
      expect(result.riskLevel).toBe("CRITICAL");
      expect(result.reasons.some((r) => r.includes("Emergency Kill Switch is ACTIVE"))).toBe(true);
    });
  });

  describe("HTTP REST Endpoints for Risk Engine", () => {
    it("GET /api/risk/status should return active risk rules and metrics", async () => {
      const res = await request(app).get("/api/risk/status");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.rules)).toBe(true);
      expect(typeof res.body.data.killSwitchActive).toBe("boolean");
    });

    it("POST /api/risk/evaluate should evaluate an arbitrary trade proposal", async () => {
      const res = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "NVDA",
          decision: "BUY",
          confidence: 84,
          shares: 10,
          price: 128.9,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.checks).toBeDefined();
      expect(typeof res.body.data.approved).toBe("boolean");
    });

    it("POST /api/risk/kill-switch should toggle emergency freeze", async () => {
      const resActivate = await request(app)
        .post("/api/risk/kill-switch")
        .send({ active: true });

      expect(resActivate.status).toBe(200);
      expect(resActivate.body.data.killSwitchActive).toBe(true);

      const resDeactivate = await request(app)
        .post("/api/risk/kill-switch")
        .send({ active: false });

      expect(resDeactivate.status).toBe(200);
      expect(resDeactivate.body.data.killSwitchActive).toBe(false);
    });
  });
});
