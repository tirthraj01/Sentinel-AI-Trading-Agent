import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("SENTINEL Backend API (Phase 2)", () => {
  describe("GET /api/health", () => {
    it("should return healthy status and paper trading flag", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("healthy");
      expect(res.body.data.paperTrading).toBe(true);
    });
  });

  describe("GET /api/market", () => {
    it("should return all stock quotes", async () => {
      const res = await request(app).get("/api/market");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it("should return quote and sentiment for a specific ticker", async () => {
      const res = await request(app).get("/api/market?symbol=NVDA");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quote.symbol).toBe("NVDA");
      expect(res.body.data.sentiment).toBeDefined();
    });

    it("should return 404 for an unknown ticker", async () => {
      const res = await request(app).get("/api/market?symbol=UNKNOWNXYZ");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ASSET_NOT_FOUND");
    });
  });

  describe("GET /api/portfolio & GET /api/positions", () => {
    it("should return portfolio summary and paper account", async () => {
      const res = await request(app).get("/api/portfolio");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.is_paper).toBe(true);
      expect(res.body.data.summary.equity).toBeGreaterThan(0);
    });

    it("should return list of open positions", async () => {
      const res = await request(app).get("/api/positions");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((p: any) => p.symbol === "AAPL")).toBe(true);
    });
  });

  describe("Trades API", () => {
    it("GET /api/trades should return list of trades", async () => {
      const res = await request(app).get("/api/trades");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/trades should submit and fill a paper trade", async () => {
      const res = await request(app)
        .post("/api/trades")
        .send({
          symbol: "AAPL",
          side: "BUY",
          shares: 5,
          orderType: "market",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("filled");
      expect(res.body.data.symbol).toBe("AAPL");
      expect(res.body.data.shares).toBe(5);
    });

    it("POST /api/trades should reject invalid schema payload with 400", async () => {
      const res = await request(app)
        .post("/api/trades")
        .send({
          symbol: "123INVALID",
          side: "INVALID_SIDE",
          shares: -10,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details).toBeDefined();
    });
  });

  describe("Agent Intelligence API", () => {
    it("GET /api/agent/decisions should return decisions list", async () => {
      const res = await request(app).get("/api/agent/decisions");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /api/agent/activity should return activity stream", async () => {
      const res = await request(app).get("/api/agent/activity");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/agent/analyze should execute Scenario A (Approval)", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "NVDA",
          forceScenario: "APPROVED",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe("NVDA");
      expect(res.body.data.status).toBe("APPROVED_EXECUTED");
      expect(res.body.data.riskResult.approved).toBe(true);
      expect(res.body.data.alpacaOrderId).toBeDefined();
    });

    it("POST /api/agent/analyze should execute Scenario B (Risk Veto / Blocked)", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "TSLA",
          forceScenario: "BLOCKED",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe("TSLA");
      expect(res.body.data.status).toBe("BLOCKED_BY_RISK");
      expect(res.body.data.riskResult.approved).toBe(false);
      expect(res.body.data.riskResult.reasons.length).toBeGreaterThan(0);
      expect(res.body.data.alpacaOrderId).toBeUndefined(); // Zero order submitted to broker
    });

    it("POST /api/agent/analyze should reject invalid symbol with 400", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "WAYTOOLONGTICKER",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Risk Status API", () => {
    it("GET /api/risk/status should return active risk rules and status", async () => {
      const res = await request(app).get("/api/risk/status");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ACTIVE_GUARD");
      expect(Array.isArray(res.body.data.rules)).toBe(true);
      expect(res.body.data.rules.length).toBe(6);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for undefined endpoints", async () => {
      const res = await request(app).get("/api/nonexistent-route");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
