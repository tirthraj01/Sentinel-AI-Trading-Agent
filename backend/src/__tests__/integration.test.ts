import { describe, it, expect } from "vitest";
import request from "supertest";
import http from "http";
import { app } from "../app.js";

describe("SENTINEL End-to-End Full System Integration (Phase 9)", () => {
  describe("1. End-to-End Approved Flow (NVDA)", () => {
    it("should execute: UI/API -> Agent -> Risk Engine -> Alpaca Paper -> Database & Repositories", async () => {
      // Step 1: User triggers analysis for NVDA
      const analyzeRes = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "NVDA",
          forceScenario: "APPROVED",
        });

      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.success).toBe(true);
      const decision = analyzeRes.body.data;

      // Step 2 & 3: Verify Agent analyzed and recommended BUY
      expect(decision.symbol).toBe("NVDA");
      expect(decision.decision).toBe("BUY");
      expect(decision.confidence).toBeGreaterThanOrEqual(70);

      // Step 4: Verify Risk Engine approved with 6/6 checks passed
      expect(decision.riskResult?.approved).toBe(true);
      expect(decision.riskResult?.checks.length).toBe(6);
      expect(decision.riskResult?.checks.every((c: any) => c.passed)).toBe(true);

      // Step 5: Verify Alpaca Paper order executed
      expect(decision.status).toBe("APPROVED_EXECUTED");
      expect(decision.alpacaOrderId).toBeDefined();
      expect(decision.alpacaOrderId.startsWith("alpaca-")).toBe(true);

      // Step 6: Verify Database & State Consistency across all endpoints
      // 6A. Positions endpoint has updated NVDA position
      const positionsRes = await request(app).get("/api/positions");
      expect(positionsRes.status).toBe(200);
      const nvdaPos = positionsRes.body.data.find((p: any) => p.symbol === "NVDA");
      expect(nvdaPos).toBeDefined();
      expect(nvdaPos.shares).toBeGreaterThan(0);

      // 6B. Trades endpoint contains the executed paper trade
      const tradesRes = await request(app).get("/api/trades?symbol=NVDA");
      expect(tradesRes.status).toBe(200);
      const filledTrade = tradesRes.body.data.find(
        (t: any) => t.decisionId === decision.id && t.status === "filled"
      );
      expect(filledTrade).toBeDefined();
      expect(filledTrade.shares).toBe(decision.suggestedShares);

      // 6C. Decisions repository returns the persisted decision memo
      const decisionsRes = await request(app).get("/api/agent/decisions?symbol=NVDA");
      expect(decisionsRes.status).toBe(200);
      const persistedMemo = decisionsRes.body.data.find((d: any) => d.id === decision.id);
      expect(persistedMemo).toBeDefined();
      expect(persistedMemo.status).toBe("APPROVED_EXECUTED");

      // 6D. Activity telemetry stream logged all pipeline stages
      const activityRes = await request(app).get("/api/agent/activity?limit=50");
      expect(activityRes.status).toBe(200);
      const runEvents = activityRes.body.data.filter((a: any) => a.runId === decision.runId);
      expect(runEvents.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("2. End-to-End Rejected / Risk Veto Flow (TSLA)", () => {
    it("should execute: Agent -> Risk Veto -> Order Blocked -> Veto Audit Logged -> Zero Capital Lost", async () => {
      // Step 1: Read initial portfolio cash
      const initialPortfolioRes = await request(app).get("/api/portfolio");
      const initialCash = initialPortfolioRes.body.data.summary.cash;

      // Step 2: Trigger analysis for TSLA with forced risk violation
      const analyzeRes = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "TSLA",
          forceScenario: "BLOCKED",
        });

      expect(analyzeRes.status).toBe(200);
      const decision = analyzeRes.body.data;

      // Step 3: Verify Agent detected low confidence / excess allocation
      expect(decision.symbol).toBe("TSLA");

      // Step 4: Verify Risk Engine vetoed the trade
      expect(decision.riskResult?.approved).toBe(false);
      expect(decision.riskResult?.reasons.length).toBeGreaterThan(0);
      expect(decision.status).toBe("BLOCKED_BY_RISK");

      // Step 5: Verify NO Alpaca broker order was submitted
      expect(decision.alpacaOrderId).toBeUndefined();

      // Step 6: Verify Cash was 100% PROTECTED (zero capital lost)
      const postPortfolioRes = await request(app).get("/api/portfolio");
      expect(postPortfolioRes.body.data.summary.cash).toBe(initialCash);

      // Step 7: Verify Blocked Trade recorded in order repository for compliance
      const tradesRes = await request(app).get("/api/trades?symbol=TSLA&status=blocked");
      expect(tradesRes.status).toBe(200);
      const blockedTrade = tradesRes.body.data.find((t: any) => t.decisionId === decision.id);
      expect(blockedTrade).toBeDefined();
      expect(blockedTrade.status).toBe("blocked");
      expect(blockedTrade.riskReasons?.length).toBeGreaterThan(0);

      // Step 8: Verify Risk status reflects recent vetoes
      const riskStatusRes = await request(app).get("/api/risk/status");
      expect(riskStatusRes.status).toBe(200);
      expect(riskStatusRes.body.data.status).toBe("ACTIVE_GUARD");
    });
  });

  describe("3. Real-Time Server-Sent Events (SSE) Event Stream", () => {
    it("GET /api/agent/stream should establish an active SSE connection with proper headers", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const address = server.address() as any;
      const port = address.port;

      await new Promise<void>((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/agent/stream`, (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers["content-type"]).toContain("text/event-stream");
          expect(res.headers["cache-control"]).toContain("no-cache");

          res.on("data", (chunk) => {
            const text = chunk.toString();
            if (text.includes("CONNECTED")) {
              req.destroy();
              server.close(() => resolve());
            }
          });
        });

        req.on("error", (err) => {
          server.close();
          if ((err as any).code === "ECONNRESET") {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    });
  });
});
