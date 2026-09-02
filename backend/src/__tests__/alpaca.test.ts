import { describe, it, expect, beforeEach } from "vitest";
import { alpacaService, AlpacaService } from "../services/alpacaService.js";

describe("Alpaca Paper Trading Service (Phase 4)", () => {
  describe("Critical Paper Trading Safety Assertions", () => {
    it("should allow paper trading mode when ALPACA_PAPER_TRADE is true", () => {
      expect(() => alpacaService.assertPaperSafety()).not.toThrow();
    });

    it("should throw a critical error if live trading is attempted", () => {
      const originalEnv = process.env.ALPACA_PAPER_TRADE;
      process.env.ALPACA_PAPER_TRADE = "false";

      expect(() => alpacaService.assertPaperSafety()).toThrow(
        /Live trading disabled/
      );

      process.env.ALPACA_PAPER_TRADE = originalEnv;
    });

    it("should throw an error if the base URL does not target paper-api.alpaca.markets", () => {
      const originalBaseUrl = process.env.ALPACA_BASE_URL;
      process.env.ALPACA_BASE_URL = "https://api.alpaca.markets"; // Live broker URL

      expect(() => new AlpacaService()).toThrow(
        /Base URL must target paper-api\.alpaca\.markets/
      );

      process.env.ALPACA_BASE_URL = originalBaseUrl;
    });
  });

  describe("Alpaca Account & Position Ingestion", () => {
    it("should fetch paper account details with is_paper=true", async () => {
      const account = await alpacaService.getAccount();
      expect(account).toBeDefined();
      expect(account.is_paper).toBe(true);
      expect(account.status).toBe("ACTIVE");
      expect(account.currency).toBe("USD");
      expect(account.cash).toBeGreaterThan(0);
      expect(account.portfolio_value).toBeGreaterThan(0);
    });

    it("should fetch paper holdings with valid metrics", async () => {
      const positions = await alpacaService.getPositions();
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThan(0);

      const aapl = positions.find((p) => p.symbol === "AAPL");
      expect(aapl).toBeDefined();
      expect(aapl?.shares).toBeGreaterThan(0);
      expect(aapl?.marketValue).toBeGreaterThan(0);
    });

    it("should fetch single position by ticker", async () => {
      const pos = await alpacaService.getPosition("NVDA");
      expect(pos).toBeDefined();
      expect(pos?.symbol).toBe("NVDA");
    });
  });

  describe("Alpaca Order Submission", () => {
    it("should submit a small paper order (1 share of SPY)", async () => {
      const order = await alpacaService.submitPaperOrder({
        symbol: "SPY",
        side: "BUY",
        shares: 1,
        orderType: "market",
      });

      expect(order).toBeDefined();
      expect(order.symbol).toBe("SPY");
      expect(order.shares).toBe(1);
      expect(order.side).toBe("BUY");
      expect(order.alpacaOrderId).toBeDefined();
      expect(order.alpacaOrderId?.startsWith("alpaca-")).toBe(true);
      expect(["filled", "submitted"]).toContain(order.status);
    });

    it("should submit a paper order for AAPL and update position", async () => {
      const prevPos = await alpacaService.getPosition("AAPL");
      const prevShares = prevPos ? prevPos.shares : 0;

      const order = await alpacaService.submitPaperOrder({
        symbol: "AAPL",
        side: "BUY",
        shares: 2,
        orderType: "market",
      });

      expect(order.symbol).toBe("AAPL");
      expect(order.shares).toBe(2);

      const updatedPos = await alpacaService.getPosition("AAPL");
      expect(updatedPos?.shares).toBe(prevShares + 2);
    });
  });

  describe("Rate Limit Status", () => {
    it("should report rate limit remaining quota", () => {
      const status = alpacaService.getRateLimitStatus();
      expect(status).toBeDefined();
      expect(typeof status.remaining).toBe("number");
      expect(status.remaining).toBeGreaterThanOrEqual(0);
    });
  });
});
