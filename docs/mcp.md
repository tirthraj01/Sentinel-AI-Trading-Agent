# SENTINEL — Model Context Protocol (MCP) Integration Specification

---

## 1. What is MCP (Model Context Protocol)?

> **Beginner Definition:**  
> The Model Context Protocol (MCP) is an open standard that allows AI applications to discover and interact with external data sources and tools in a uniform, standardized way. Think of it like a USB-C port for AI: instead of writing custom code for every API, an AI model connects to an MCP server and immediately sees what tools and information are available.

---

## 2. Official Alpaca MCP Architecture

SENTINEL aligns with the official **Alpaca MCP Server (V2)** (`github.com/alpacahq/alpaca-mcp-server`).

The official Alpaca MCP server exposes toolsets including:
* `account`: Checking balances, buying power, portfolio history.
* `stock-data`: Fetching bars, quotes, market movers, volume, and company snapshots.
* `trading`: Submitting and managing orders.

---

## 3. Division of Responsibilities & Safety Guardrails

A critical engineering question in agentic trading is:  
**Should the AI model execute orders directly via MCP tools?**

**Answer in SENTINEL: Absolutely NOT.**

If an AI model can directly call an MCP `submit_order` tool without a middleware interceptor, the deterministic risk engine would be rendered useless. The AI could hallucinate, ignore limits, and place arbitrary trades.

SENTINEL enforces a tripartite division:

| Operation Category | Primary Execution Channel | Architectural Rationale |
| :--- | :--- | :--- |
| **Market Data & Discovery** | **Alpaca MCP Tools** (`stock-data`, quotes, bars, news) | Standardized query interface allowing the agent to discover market state dynamically. |
| **Portfolio & Account Read** | **Alpaca MCP Tools** (`account`, `positions`) | Read-only inspection tools that carry zero financial risk. |
| **Trade Proposal & Reasoning** | **Local LLM Service** | Generates hypothesis, calculates confidence, and synthesizes news and indicators into a structured proposal. |
| **Risk Validation** | **Local Deterministic Risk Engine** | 100% mathematical, non-LLM rule checks (position limits, daily loss limits, confidence floors). |
| **Paper Order Execution** | **Direct Alpaca API via Risk Guard** | Orders are **only** submitted through a strictly gated execution service after risk approval. |

---

## 4. MCP Agent Tool Schema

When the agent executes its observation cycle, it interacts with MCP tools:

```typescript
// MCP Tool Discovery Signature Example
export interface McpMarketTool {
  name: "get_market_snapshot";
  description: "Fetches current price, daily change, and volume for a symbol";
  parameters: {
    symbol: string;
  };
}

export interface McpAccountTool {
  name: "get_account_balance";
  description: "Retrieves current cash balance and equity from Alpaca Paper account";
  parameters: {};
}
```

By keeping read tools open to MCP and restricting execution behind the Risk Engine, SENTINEL achieves modern agentic flexibility without compromising financial safety.
