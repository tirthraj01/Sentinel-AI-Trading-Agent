import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { alpacaMcpClient } from "../mcp/alpacaMcpClient.js";
import { alpacaMcpServer } from "../mcp/alpacaMcpServer.js";

describe("Alpaca Model Context Protocol (MCP) Integration (Phase 7)", () => {
  describe("1. Tool Discovery", () => {
    it("should discover all 6 standard Alpaca MCP tools", async () => {
      const tools = await alpacaMcpClient.discoverTools();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBe(6);

      const toolNames = tools.map((t) => t.name);
      expect(toolNames).toContain("get_stock_quote");
      expect(toolNames).toContain("get_historical_bars");
      expect(toolNames).toContain("get_account_status");
      expect(toolNames).toContain("get_open_positions");
      expect(toolNames).toContain("place_paper_order");
      expect(toolNames).toContain("screen_market_movers");

      // Verify input schemas conform to JSON Schema standard
      tools.forEach((tool) => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
        expect(typeof tool.description).toBe("string");
      });
    });
  });

  describe("2. Execute Individual MCP Tools", () => {
    it("should execute get_stock_quote for AAPL", async () => {
      const quote = await alpacaMcpClient.getStockQuote("AAPL");

      expect(quote).toBeDefined();
      expect(quote.symbol).toBe("AAPL");
      expect(typeof quote.price).toBe("number");
      expect(quote.price).toBeGreaterThan(0);
    });

    it("should execute get_historical_bars for NVDA", async () => {
      const bars = await alpacaMcpClient.getHistoricalBars("NVDA", "1Day", 5);

      expect(bars).toBeDefined();
      expect(bars.symbol).toBe("NVDA");
      expect(Array.isArray(bars.bars)).toBe(true);
    });

    it("should execute get_account_status", async () => {
      const account = await alpacaMcpClient.getAccountStatus();

      expect(account).toBeDefined();
      expect(account.is_paper).toBe(true);
      expect(account.status).toBe("ACTIVE");
      expect(account.portfolio_value).toBeGreaterThan(0);
    });

    it("should execute get_open_positions", async () => {
      const positions = await alpacaMcpClient.getOpenPositions();

      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThan(0);
      expect(positions.some((p: any) => p.symbol === "AAPL")).toBe(true);
    });

    it("should execute screen_market_movers for gainers and most_active", async () => {
      const gainers = await alpacaMcpClient.screenMarketMovers("gainers", 3);
      expect(gainers.category).toBe("gainers");
      expect(gainers.results.length).toBeLessThanOrEqual(3);

      const active = await alpacaMcpClient.screenMarketMovers("most_active", 3);
      expect(active.category).toBe("most_active");
      expect(active.results.length).toBeLessThanOrEqual(3);
    });

    it("should execute place_paper_order for 1 share of SPY", async () => {
      const res = await alpacaMcpClient.placePaperOrder({
        symbol: "SPY",
        qty: 1,
        side: "buy",
        type: "market",
      });

      expect(res).toBeDefined();
      expect(res.trade).toBeDefined();
      expect(res.trade.symbol).toBe("SPY");
      expect(res.trade.shares).toBe(1);
      expect(res.trade.side).toBe("BUY");
      expect(res.trade.alpacaOrderId).toBeDefined();
    });
  });

  describe("3. Paper-Trading Safety Invariants on Order Tool", () => {
    it("should enforce paper trading safety invariant and reject live orders", async () => {
      const originalEnv = process.env.ALPACA_PAPER_TRADE;
      process.env.ALPACA_PAPER_TRADE = "false";

      const res = await alpacaMcpServer.callTool("place_paper_order", {
        symbol: "AAPL",
        qty: 1,
        side: "buy",
      });

      expect(res.isError).toBe(true);
      expect(res.content[0].text).toContain("Live trading disabled");

      process.env.ALPACA_PAPER_TRADE = originalEnv;
    });
  });

  describe("4. REST API Endpoints for MCP", () => {
    it("GET /api/mcp/tools should list all tools", async () => {
      const res = await request(app).get("/api/mcp/tools");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(6);
      expect(res.body.meta.protocol).toContain("Model Context Protocol");
    });

    it("POST /api/mcp/call should invoke a tool through HTTP", async () => {
      const res = await request(app)
        .post("/api/mcp/call")
        .send({
          name: "get_stock_quote",
          arguments: { symbol: "NVDA" },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe("NVDA");
    });

    it("POST /api/mcp/call should return 400 for unknown tool", async () => {
      const res = await request(app)
        .post("/api/mcp/call")
        .send({
          name: "unknown_hack_tool",
          arguments: {},
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Unrecognized MCP tool");
    });
  });
});
