import { describe, it, expect } from "vitest";
import { positionRepository } from "../db/repositories/positionRepository.js";
import { orderRepository } from "../db/repositories/orderRepository.js";
import { decisionRepository } from "../db/repositories/decisionRepository.js";
import { activityRepository } from "../db/repositories/activityRepository.js";
import { isSupabaseConfigured } from "../db/supabaseClient.js";
import { TradeRecord, AgentDecision, Position } from "../types/index.js";

describe("SENTINEL Database & Repository Layer (Phase 3)", () => {
  describe("Fallback Mode & Client Configuration", () => {
    it("should handle unconfigured Supabase gracefully without crashing", () => {
      const configured = isSupabaseConfigured();
      expect(typeof configured).toBe("boolean");
    });
  });

  describe("Position Repository", () => {
    it("should read open positions", async () => {
      const positions = await positionRepository.getPositions();
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThanOrEqual(5);
      expect(positions.some((p) => p.symbol === "AAPL")).toBe(true);
    });

    it("should read single position by symbol", async () => {
      const pos = await positionRepository.getPositionBySymbol("NVDA");
      expect(pos).toBeDefined();
      expect(pos?.symbol).toBe("NVDA");
      expect(pos?.shares).toBeGreaterThan(0);
    });

    it("should upsert a position accurately", async () => {
      const testPos: Position = {
        symbol: "TEST",
        name: "Test Asset Inc.",
        shares: 10,
        avgEntryPrice: 100.0,
        currentPrice: 105.0,
        marketValue: 1050.0,
        unrealizedPL: 50.0,
        unrealizedPLPercent: 5.0,
        allocationPercent: 1.0,
        side: "long",
      };

      const result = await positionRepository.upsertPosition(testPos);
      expect(result.symbol).toBe("TEST");

      const fetched = await positionRepository.getPositionBySymbol("TEST");
      expect(fetched).toBeDefined();
      expect(fetched?.shares).toBe(10);
    });
  });

  describe("Order & Trade History Repository", () => {
    it("should write a new order record", async () => {
      const newOrder: TradeRecord = {
        id: "tr-test-write-001",
        alpacaOrderId: "alpaca-test-ord-001",
        symbol: "AMZN",
        side: "BUY",
        shares: 12,
        orderType: "market",
        estimatedPrice: 188.5,
        executedPrice: 188.5,
        status: "filled",
        submittedAt: new Date().toISOString(),
        executedAt: new Date().toISOString(),
      };

      const created = await orderRepository.createOrder(newOrder);
      expect(created.id).toBe("tr-test-write-001");
      expect(created.status).toBe("filled");
    });

    it("should read orders with optional symbol filter", async () => {
      const orders = await orderRepository.getOrders({ symbol: "AMZN" });
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.some((o) => o.symbol === "AMZN")).toBe(true);
    });
  });

  describe("Agent Decision & Risk Evaluation Repository", () => {
    it("should write an agent decision with nested deterministic risk evaluation", async () => {
      const newDecision: AgentDecision = {
        id: "dec-db-test-01",
        runId: "run-db-test-01",
        symbol: "GOOGL",
        decision: "BUY",
        confidence: 82.5,
        reasoning: "Search advertising and Cloud AI ARR acceleration.",
        suggestedAllocationPct: 2.5,
        suggestedShares: 15,
        riskAssessment: "LOW",
        marketSummary: {
          trend: "BULLISH",
          volumeAnalysis: "Healthy accumulation above 50-day EMA",
        },
        newsSentiment: {
          score: 0.76,
          headline: "Cloud revenue exceeds consensus estimates",
          source: "CNBC",
        },
        riskResult: {
          approved: true,
          riskLevel: "LOW",
          reasons: ["Passed exposure, trade size, and conviction checks."],
          checks: [
            { name: "max_position_size", label: "Max Position Exposure", threshold: 10, actual: 2.5, passed: true, unit: "%" },
            { name: "min_ai_confidence", label: "Min AI Conviction", threshold: 70, actual: 82.5, passed: true, unit: "%" },
          ],
          evaluatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        status: "APPROVED_EXECUTED",
        alpacaOrderId: "alpaca-paper-googl-01",
      };

      const created = await decisionRepository.createDecision(newDecision);
      expect(created.id).toBe("dec-db-test-01");
      expect(created.riskResult?.approved).toBe(true);
    });

    it("should read decisions list and return risk evaluations", async () => {
      const decisions = await decisionRepository.getDecisions({ symbol: "GOOGL" });
      expect(Array.isArray(decisions)).toBe(true);
      const googDec = decisions.find((d) => d.id === "dec-db-test-01");
      expect(googDec).toBeDefined();
      expect(googDec?.confidence).toBe(82.5);
    });
  });

  describe("Agent Activity / Logs Repository", () => {
    it("should write and read agent activity logs", async () => {
      const logEvent = {
        id: "act-db-test-001",
        runId: "run-db-test-01",
        stage: "RISK_CHECK" as const,
        title: "Risk Check Executed",
        message: "Automated risk validation completed with 0 violations.",
        status: "success" as const,
        timestamp: new Date().toISOString(),
      };

      await activityRepository.logActivity(logEvent);
      const logs = await activityRepository.getActivities(10);
      expect(logs.some((l) => l.id === "act-db-test-001")).toBe(true);
    });
  });
});
