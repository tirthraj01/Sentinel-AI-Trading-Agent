import { store } from "../services/mockDataStore.js";
import { mockMarketService } from "../services/mockMarketService.js";
import { alpacaService } from "../services/alpacaService.js";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

export class AlpacaMcpServer {
  private tools: McpToolDefinition[] = [
    {
      name: "get_stock_quote",
      description: "Retrieve real-time price, volume, day high/low, and daily change for a US equity ticker.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol (e.g. AAPL, NVDA, TSLA, SPY)",
          },
        },
        required: ["symbol"],
      },
    },
    {
      name: "get_historical_bars",
      description: "Fetch historical price bars and volume for technical momentum and indicator calculation.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol",
          },
          timeframe: {
            type: "string",
            description: "Bar interval (e.g. 1Min, 5Min, 1Hour, 1Day)",
            default: "1Day",
          },
          limit: {
            type: "number",
            description: "Number of bars to return (max 100)",
            default: 10,
          },
        },
        required: ["symbol"],
      },
    },
    {
      name: "get_account_status",
      description: "Inspect Alpaca paper account status, equity, cash balance, and buying power.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_open_positions",
      description: "Retrieve all currently open equity positions, market values, and portfolio weight allocations.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "place_paper_order",
      description: "Place a paper trading order with fractional share support. Strictly paper sandbox only.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol to trade",
          },
          qty: {
            type: "number",
            description: "Number of shares to trade",
          },
          side: {
            type: "string",
            enum: ["buy", "sell"],
            description: "Order direction",
          },
          type: {
            type: "string",
            enum: ["market", "limit"],
            description: "Order execution type",
            default: "market",
          },
          limit_price: {
            type: "number",
            description: "Required when type is limit",
          },
        },
        required: ["symbol", "qty", "side"],
      },
    },
    {
      name: "screen_market_movers",
      description: "Screen for top market gainers, losers, and highest volume equities.",
      inputSchema: {
        type: "object",
        properties: {
          direction: {
            type: "string",
            enum: ["gainers", "losers", "most_active"],
            description: "Market mover category to screen",
            default: "gainers",
          },
          limit: {
            type: "number",
            description: "Maximum results to return",
            default: 5,
          },
        },
      },
    },
  ];

  /**
   * Lists all available MCP tools
   */
  public listTools(): McpToolDefinition[] {
    return this.tools;
  }

  /**
   * Executes a tool invocation following the MCP Protocol specification
   */
  public async callTool(name: string, args: Record<string, any>): Promise<McpToolResult> {
    try {
      switch (name) {
        case "get_stock_quote": {
          const sym = String(args.symbol || "").toUpperCase();
          if (!sym) {
            return {
              isError: true,
              content: [{ type: "text", text: "Error: symbol parameter is required" }],
            };
          }
          const quote = mockMarketService.getQuote(sym);
          if (!quote) {
            return {
              isError: true,
              content: [{ type: "text", text: `Stock quote not found for ticker "${sym}"` }],
            };
          }
          return {
            content: [{ type: "text", text: JSON.stringify(quote, null, 2) }],
          };
        }

        case "get_historical_bars": {
          const sym = String(args.symbol || "").toUpperCase();
          const quote = mockMarketService.getQuote(sym);
          const limit = Number(args.limit) || 10;
          const chartBars = quote ? quote.chartData.slice(-limit) : [];
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    symbol: sym,
                    timeframe: args.timeframe || "1Day",
                    bars: chartBars,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_account_status": {
          const account = await alpacaService.getAccount();
          return {
            content: [{ type: "text", text: JSON.stringify(account, null, 2) }],
          };
        }

        case "get_open_positions": {
          const positions = await alpacaService.getPositions();
          return {
            content: [{ type: "text", text: JSON.stringify(positions, null, 2) }],
          };
        }

        case "place_paper_order": {
          // CRITICAL SAFETY GUARDRAIL
          alpacaService.assertPaperSafety();

          const sym = String(args.symbol || "").toUpperCase();
          const qty = Number(args.qty);
          const side = String(args.side).toUpperCase() as "BUY" | "SELL";
          const orderType = (args.type === "limit" ? "limit" : "market") as "market" | "limit";
          const limitPrice = args.limit_price ? Number(args.limit_price) : undefined;

          if (!sym || isNaN(qty) || qty <= 0) {
            return {
              isError: true,
              content: [{ type: "text", text: "Error: Invalid order parameters (symbol and positive qty required)" }],
            };
          }

          const trade = await alpacaService.submitPaperOrder({
            symbol: sym,
            shares: qty,
            side,
            orderType,
            limitPrice,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: `Paper order executed successfully in Alpaca Sandbox.`,
                    trade,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "screen_market_movers": {
          const direction = args.direction || "gainers";
          const limit = Number(args.limit) || 5;

          let sorted = [...store.stocks];
          if (direction === "gainers") {
            sorted.sort((a, b) => b.changePercent - a.changePercent);
          } else if (direction === "losers") {
            sorted.sort((a, b) => a.changePercent - b.changePercent);
          } else {
            // Most active by volume
            sorted.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    category: direction,
                    results: sorted.slice(0, limit),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          return {
            isError: true,
            content: [{ type: "text", text: `Unrecognized MCP tool name: "${name}"` }],
          };
      }
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `MCP Execution Error: ${(err as Error).message}` }],
      };
    }
  }
}

export const alpacaMcpServer = new AlpacaMcpServer();
