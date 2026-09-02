import { alpacaMcpServer, McpToolDefinition, McpToolResult } from "./alpacaMcpServer.js";

export class AlpacaMcpClient {
  /**
   * Discovers and lists all MCP tools exposed by the Alpaca MCP server
   */
  public async discoverTools(): Promise<McpToolDefinition[]> {
    return alpacaMcpServer.listTools();
  }

  /**
   * Invokes an MCP tool by name
   */
  public async invokeTool(name: string, args: Record<string, any> = {}): Promise<McpToolResult> {
    return alpacaMcpServer.callTool(name, args);
  }

  public async getStockQuote(symbol: string): Promise<any> {
    const result = await this.invokeTool("get_stock_quote", { symbol });
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to fetch stock quote via MCP");
    }
    return JSON.parse(result.content[0].text);
  }

  public async getHistoricalBars(symbol: string, timeframe = "1Day", limit = 10): Promise<any> {
    const result = await this.invokeTool("get_historical_bars", { symbol, timeframe, limit });
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to fetch historical bars via MCP");
    }
    return JSON.parse(result.content[0].text);
  }

  public async getAccountStatus(): Promise<any> {
    const result = await this.invokeTool("get_account_status");
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to fetch account status via MCP");
    }
    return JSON.parse(result.content[0].text);
  }

  public async getOpenPositions(): Promise<any> {
    const result = await this.invokeTool("get_open_positions");
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to fetch open positions via MCP");
    }
    return JSON.parse(result.content[0].text);
  }

  public async placePaperOrder(params: {
    symbol: string;
    qty: number;
    side: "buy" | "sell";
    type?: "market" | "limit";
    limit_price?: number;
  }): Promise<any> {
    const result = await this.invokeTool("place_paper_order", params);
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to place paper order via MCP");
    }
    return JSON.parse(result.content[0].text);
  }

  public async screenMarketMovers(
    direction: "gainers" | "losers" | "most_active" = "gainers",
    limit = 5
  ): Promise<any> {
    const result = await this.invokeTool("screen_market_movers", { direction, limit });
    if (result.isError) {
      throw new Error(result.content[0]?.text || "Failed to screen market movers via MCP");
    }
    return JSON.parse(result.content[0].text);
  }
}

export const alpacaMcpClient = new AlpacaMcpClient();
