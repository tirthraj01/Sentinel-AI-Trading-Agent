import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { riskEngine } from "../services/riskEngine.js";

describe("Phase 15 — Demo Mode & Interactive Scenario Suite", () => {
  beforeEach(() => {
    riskEngine.setKillSwitch(false);
  });

  afterEach(() => {
    riskEngine.setKillSwitch(false);
  });

  describe("1. Portfolio State Reset (POST /api/demo/reset)", () => {
    it("should reset the portfolio to a pristine $100,000 cash baseline", async () => {
      const res = await request(app).post("/api/demo/reset");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.portfolio.equity).toBe(100000.0);
      expect(res.body.data.portfolio.cash).toBe(100000.0);
      expect(res.body.data.killSwitchActive).toBe(false);
      expect(res.body.data.positionsCount).toBe(0);
      expect(res.body.data.tradesCount).toBe(0);
    });
  });

  describe("2. Interactive Demo Scenarios (POST /api/demo/trigger-scenario)", () => {
    it("should execute Scenario A: Standard Buy Approved (NVDA)", async () => {
      const res = await request(app)
        .post("/api/demo/trigger-scenario")
        .send({ scenario: "A" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scenario).toBe("A");
      expect(res.body.data.symbol).toBe("NVDA");
      expect(res.body.data.status).toBe("APPROVED_EXECUTED");
      expect(res.body.data.alpacaOrderId).toBeDefined();
    });

    it("should execute Scenario B: Position Sizing Veto (TSLA)", async () => {
      const res = await request(app)
        .post("/api/demo/trigger-scenario")
        .send({ scenario: "B" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scenario).toBe("B");
      expect(res.body.data.symbol).toBe("TSLA");
      expect(res.body.data.status).toBe("BLOCKED_BY_RISK");
      expect(res.body.data.alpacaOrderId).toBeUndefined();
    });

    it("should execute Scenario C: Low Conviction Floor Veto (< 70%)", async () => {
      const res = await request(app)
        .post("/api/demo/trigger-scenario")
        .send({ scenario: "C" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scenario).toBe("C");
      expect(res.body.data.status).toBe("BLOCKED_BY_RISK");
      expect(res.body.data.confidence).toBeLessThan(70);
      expect(res.body.data.riskResult.approved).toBe(false);
    });

    it("should execute Scenario D: Emergency Circuit Breaker (>= 2% drawdown)", async () => {
      const res = await request(app)
        .post("/api/demo/trigger-scenario")
        .send({ scenario: "D" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scenario).toBe("D");
      expect(res.body.data.status).toBe("BLOCKED_BY_CIRCUIT_BREAKER");
      expect(res.body.data.riskResult.riskLevel).toBe("CRITICAL");
      expect(res.body.data.riskResult.approved).toBe(false);
    });

    it("should reject an invalid scenario code with 400", async () => {
      const res = await request(app)
        .post("/api/demo/trigger-scenario")
        .send({ scenario: "Z_INVALID" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_SCENARIO");
    });
  });
});
