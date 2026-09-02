# SENTINEL — Model Context Protocol (MCP) Integration Specification (Phase 7)

---

## 1. What is MCP (Model Context Protocol)?

> **Definition:**  
> The Model Context Protocol (MCP) is an open standard that enables AI models and autonomous agents to discover and interact with external data sources, tools, and execution services in a uniform, structured format. In SENTINEL, MCP serves as the standardized tool abstraction layer connecting the AI agent to market data and paper trading operations.

---

## 2. Implemented Alpaca MCP Tools

Located in [`backend/src/mcp/alpacaMcpServer.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/mcp/alpacaMcpServer.ts) and [`backend/src/mcp/alpacaMcpClient.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/mcp/alpacaMcpClient.ts):

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| **`get_stock_quote`** | `symbol` (string, required) | Retrieves real-time pricing, 24h change, day high/low, and volume. |
| **`get_historical_bars`** | `symbol` (string, required), `timeframe` (string, default "1Day"), `limit` (number, default 10) | Fetches historical price bars and volume for technical momentum and moving average calculations. |
| **`get_account_status`** | `{}` | Inspects Alpaca paper account equity, cash balance, and buying power. |
| **`get_open_positions`** | `{}` | Retrieves currently open equity positions, market values, and portfolio weight allocations. |
| **`place_paper_order`** | `symbol` (string), `qty` (number), `side` ("buy" \| "sell"), `type` ("market" \| "limit"), `limit_price` (optional number) | Places a paper trading order. Strictly locked to paper sandbox. |
| **`screen_market_movers`** | `direction` ("gainers" \| "losers" \| "most_active"), `limit` (number) | Screens top equity movers across US exchanges. |

---

## 3. Strict Paper-Trading Safety Invariants

Even within the MCP tool interface, SENTINEL enforces non-negotiable safety guardrails:
1. **Paper Sandbox Lock:**  
   The `place_paper_order` tool invokes `alpacaService.assertPaperSafety()` prior to taking any action. If `ALPACA_PAPER_TRADE === "false"`, execution immediately halts with:  
   `"CRITICAL SAFETY GUARDRAIL: Live trading disabled! SENTINEL is strictly locked to Alpaca Paper Trading."`
2. **Endpoint Restriction:**  
   Base URL must strictly point to `https://paper-api.alpaca.markets`. Any invocation directed at live trading brokers is rejected.

---

## 4. MCP REST Endpoints

1. **`GET /api/mcp/tools`**:
   - Returns discovery metadata and JSON Schemas for all 6 tools.
   - Conforms to the MCP tool discovery standard.
2. **`POST /api/mcp/call`**:
   - Body: `{ "name": "<tool_name>", "arguments": { ... } }`
   - Invokes the specified tool and returns formatted results.

---

## 5. Automated Test Verification

Automated test suite in [`backend/src/__tests__/mcp.test.ts`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/backend/src/__tests__/mcp.test.ts) verifies:
* Tool discovery returning all 6 tools with valid JSON Schemas.
* Execution of `get_stock_quote` for AAPL.
* Execution of `get_historical_bars` for NVDA.
* Execution of `get_account_status` and `get_open_positions`.
* Execution of `screen_market_movers` for gainers and most active tickers.
* Execution of `place_paper_order` for 1 share of SPY.
* Enforcement of the paper trading safety invariant on `place_paper_order`.
* REST endpoints `GET /api/mcp/tools` and `POST /api/mcp/call`.

**Test Results:**
```text
 ✓ src/__tests__/alpaca.test.ts (9 tests) 15ms
 ✓ src/__tests__/database.test.ts (9 tests) 12ms
 ✓ src/__tests__/llm.test.ts (6 tests) 14ms
 ✓ src/__tests__/agent.test.ts (5 tests) 16ms
 ✓ src/__tests__/mcp.test.ts (11 tests) 70ms
 ✓ src/__tests__/api.test.ts (16 tests) 145ms
 Test Files  6 passed (6)
      Tests  56 passed (56)
   Duration  1.70s
```
