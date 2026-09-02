import { describe, it, expect } from "vitest";
import { sentinelAgent } from "../services/agentService.js";
import { decisionRepository } from "../db/repositories/decisionRepository.js";
import { activityRepository } from "../db/repositories/activityRepository.js";
import { orderRepository } from "../db/repositories/orderRepository.js";

describe("Sentinel AI Trading Agent Pipeline (Phase 6)", () => {
  describe("Scenario A: Approved Trade Execution (NVDA)", () => {
    it("should execute the complete 6-stage pipeline and fill a paper order", async () => {
      const decision = await sentinelAgent.runPipeline({
        symbol: "NVDA",
        forceScenario: "APPROVED",
      });

      expect(decision).toBeDefined();
      expect(decision.symbol).toBe("NVDA");
      expect(decision.decision).toBe("BUY");
      expect(decision.confidence).toBeGreaterThanOrEqual(70);
      expect(decision.status).toBe("APPROVED_EXECUTED");
      expect(decision.alpacaOrderId).toBeDefined();
      expect(decision.riskResult?.approved).toBe(true);

      // Verify all 6 deterministic safety rules passed
      expect(decision.riskResult?.checks.length).toBe(6);
      expect(decision.riskResult?.checks.every((c) => c.passed)).toBe(true);
    });
  });

  describe("Scenario B: Risk Veto & Blocked Execution (TSLA)", () => {
    it("should execute the pipeline, detect risk violations, and block execution", async () => {
      const decision = await sentinelAgent.runPipeline({
        symbol: "TSLA",
        forceScenario: "BLOCKED",
      });

      expect(decision).toBeDefined();
      expect(decision.symbol).toBe("TSLA");
      expect(decision.status).toBe("BLOCKED_BY_RISK");
      expect(decision.alpacaOrderId).toBeUndefined(); // No broker order submitted!
      expect(decision.riskResult?.approved).toBe(false);
      expect(decision.riskResult?.reasons.length).toBeGreaterThan(0);

      // Check that min_ai_confidence was flagged as failed
      const confidenceCheck = decision.riskResult?.checks.find(
        (c) => c.name === "min_ai_confidence"
      );
      expect(confidenceCheck).toBeDefined();
      expect(confidenceCheck?.passed).toBe(false);
    });
  });

  describe("Transparency Feed & Activity Logging", () => {
    it("should emit chronological stage events for every pipeline phase", async () => {
      const activitiesBefore = await activityRepository.getActivities(50);
      const beforeCount = activitiesBefore.length;

      const decision = await sentinelAgent.runPipeline({
        symbol: "NVDA",
      });

      const activitiesAfter = await activityRepository.getActivities(50);
      expect(activitiesAfter.length).toBeGreaterThan(beforeCount);

      // Verify events from this specific runId exist
      const runEvents = activitiesAfter.filter((a) => a.runId === decision.runId);
      expect(runEvents.length).toBeGreaterThanOrEqual(4);

      const stagesPresent = runEvents.map((e) => e.stage);
      expect(stagesPresent).toContain("OBSERVE");
      expect(stagesPresent).toContain("ANALYZE");
      expect(stagesPresent).toContain("DECIDE");
      expect(stagesPresent).toContain("RISK_CHECK");
      expect(stagesPresent).toContain("COMPLETE");
    });
  });

  describe("Database Persistence & Audit Trail", () => {
    it("should persist the decision memo to the repository layer", async () => {
      const decision = await sentinelAgent.runPipeline({
        symbol: "NVDA",
        forceScenario: "APPROVED",
      });

      const decisions = await decisionRepository.getDecisions({ symbol: "NVDA" });
      const persisted = decisions.find((d) => d.id === decision.id);

      expect(persisted).toBeDefined();
      expect(persisted?.symbol).toBe("NVDA");
      expect(persisted?.decision).toBe("BUY");
      expect(persisted?.confidence).toBe(decision.confidence);
    });

    it("should record blocked orders in the order repository with risk reasons", async () => {
      const decision = await sentinelAgent.runPipeline({
        symbol: "TSLA",
        forceScenario: "BLOCKED",
      });

      const orders = await orderRepository.getOrders({ symbol: "TSLA", status: "blocked" });
      expect(orders.length).toBeGreaterThan(0);

      const blockedOrder = orders.find((o) => o.decisionId === decision.id);
      expect(blockedOrder).toBeDefined();
      expect(blockedOrder?.status).toBe("blocked");
      expect(blockedOrder?.riskReasons?.length).toBeGreaterThan(0);
    });
  });
});
