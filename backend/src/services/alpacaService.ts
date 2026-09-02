import dotenv from "dotenv";
import { store } from "./mockDataStore.js";
import { Position, TradeRecord } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export interface AlpacaAccountResponse {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: number;
  portfolio_value: number;
  buying_power: number;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  is_paper: boolean;
}

export interface AlpacaPositionRaw {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: string;
  avg_entry_price: string;
  side: "long" | "short";
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface AlpacaOrderRaw {
  id: string;
  client_order_id: string;
  created_at: string;
  submitted_at: string;
  filled_at?: string;
  symbol: string;
  qty: string;
  filled_qty: string;
  type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  time_in_force: "day" | "gtc";
  limit_price?: string;
  filled_avg_price?: string;
  status: "new" | "partially_filled" | "filled" | "done_for_day" | "canceled" | "expired" | "replaced" | "pending_cancel" | "pending_replace" | "accepted" | "pending_new" | "accepted_for_bidding" | "stopped" | "rejected" | "suspended" | "calculated";
}

export class AlpacaService {
  private baseUrl: string;
  private dataUrl: string;
  private apiKey?: string;
  private apiSecret?: string;
  private rateLimitRemaining: number = 200;
  private rateLimitReset?: string;

  constructor() {
    this.baseUrl = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";
    this.dataUrl = process.env.ALPACA_DATA_URL || "https://data.alpaca.markets";
    this.apiKey = process.env.ALPACA_API_KEY;
    this.apiSecret = process.env.ALPACA_API_SECRET;

    this.assertPaperSafety();
  }

  /**
   * CRITICAL SAFETY GUARDRAIL:
   * Asserts that live trading is strictly disabled.
   * Throws an exception if anyone attempts pointing to a live broker endpoint.
   */
  public assertPaperSafety(): void {
    if (process.env.ALPACA_PAPER_TRADE === "false") {
      throw new Error(
        "CRITICAL SAFETY GUARDRAIL: Live trading disabled! SENTINEL is strictly locked to Alpaca Paper Trading."
      );
    }
    if (!this.baseUrl.includes("paper")) {
      throw new Error(
        "CRITICAL SAFETY GUARDRAIL: Base URL must target paper-api.alpaca.markets. Live endpoint rejected."
      );
    }
  }

  public hasValidCredentials(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiSecret &&
      !this.apiKey.includes("your_alpaca") &&
      this.apiKey.length >= 10 &&
      this.apiSecret.length >= 20
    );
  }

  private getHeaders(): Record<string, string> {
    return {
      "APCA-API-KEY-ID": this.apiKey || "",
      "APCA-API-SECRET-KEY": this.apiSecret || "",
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private updateRateLimits(headers: Headers): void {
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
    if (reset) this.rateLimitReset = reset;
  }

  /**
   * GET /v2/account
   */
  public async getAccount(): Promise<AlpacaAccountResponse> {
    this.assertPaperSafety();

    if (this.hasValidCredentials()) {
      try {
        const res = await fetch(`${this.baseUrl}/v2/account`, {
          method: "GET",
          headers: this.getHeaders(),
        });
        this.updateRateLimits(res.headers);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Alpaca API Error (${res.status}): ${errText}`);
        }

        const data = (await res.json()) as any;
        return {
          id: data.id,
          account_number: data.account_number,
          status: data.status,
          currency: data.currency,
          cash: parseFloat(data.cash),
          portfolio_value: parseFloat(data.portfolio_value),
          buying_power: parseFloat(data.buying_power),
          pattern_day_trader: Boolean(data.pattern_day_trader),
          trading_blocked: Boolean(data.trading_blocked),
          transfers_blocked: Boolean(data.transfers_blocked),
          account_blocked: Boolean(data.account_blocked),
          is_paper: true,
        };
      } catch (err) {
        console.warn("⚠️ Live Alpaca request failed. Reverting to Paper Sandbox:", (err as Error).message);
      }
    }

    // High-fidelity fallback paper sandbox
    return {
      id: "alpaca-paper-acc-sentinel-01",
      account_number: "PA392817263",
      status: "ACTIVE",
      currency: "USD",
      cash: store.portfolio.cash,
      portfolio_value: store.portfolio.equity,
      buying_power: store.portfolio.buyingPower,
      pattern_day_trader: false,
      trading_blocked: false,
      transfers_blocked: false,
      account_blocked: false,
      is_paper: true,
    };
  }

  /**
   * GET /v2/positions
   */
  public async getPositions(): Promise<Position[]> {
    this.assertPaperSafety();

    if (this.hasValidCredentials()) {
      try {
        const res = await fetch(`${this.baseUrl}/v2/positions`, {
          method: "GET",
          headers: this.getHeaders(),
        });
        this.updateRateLimits(res.headers);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Alpaca API Error (${res.status}): ${errText}`);
        }

        const rawList = (await res.json()) as AlpacaPositionRaw[];
        const account = await this.getAccount();

        return rawList.map((p) => {
          const marketVal = parseFloat(p.market_value);
          const allocPct = account.portfolio_value > 0 ? (marketVal / account.portfolio_value) * 100 : 0;
          return {
            symbol: p.symbol,
            name: `${p.symbol} Holding`,
            shares: parseFloat(p.qty),
            avgEntryPrice: parseFloat(p.avg_entry_price),
            currentPrice: parseFloat(p.current_price),
            marketValue: marketVal,
            unrealizedPL: parseFloat(p.unrealized_pl),
            unrealizedPLPercent: parseFloat(p.unrealized_plpc) * 100,
            allocationPercent: parseFloat(allocPct.toFixed(2)),
            side: p.side === "short" ? "short" : "long",
          };
        });
      } catch (err) {
        console.warn("⚠️ Live Alpaca positions request failed. Reverting to Paper Sandbox:", (err as Error).message);
      }
    }

    return store.positions;
  }

  /**
   * GET /v2/positions/{symbol}
   */
  public async getPosition(symbol: string): Promise<Position | undefined> {
    const positions = await this.getPositions();
    return positions.find((p) => p.symbol === symbol.toUpperCase());
  }

  /**
   * POST /v2/orders
   */
  public async submitPaperOrder(params: {
    symbol: string;
    side: "BUY" | "SELL";
    shares: number;
    orderType: "market" | "limit";
    limitPrice?: number;
    decisionId?: string;
  }): Promise<TradeRecord> {
    this.assertPaperSafety();
    const { symbol, side, shares, orderType, limitPrice, decisionId } = params;
    const sym = symbol.toUpperCase();

    if (this.hasValidCredentials()) {
      try {
        const payload = {
          symbol: sym,
          qty: shares.toString(),
          side: side.toLowerCase(),
          type: orderType,
          time_in_force: "day",
          ...(limitPrice && orderType === "limit" ? { limit_price: limitPrice.toString() } : {}),
        };

        const res = await fetch(`${this.baseUrl}/v2/orders`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        });
        this.updateRateLimits(res.headers);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Alpaca Order Submission Error (${res.status}): ${errText}`);
        }

        const data = (await res.json()) as AlpacaOrderRaw;
        const tradeRecord: TradeRecord = {
          id: `tr-${uuidv4().slice(0, 8)}`,
          alpacaOrderId: data.id,
          symbol: data.symbol,
          side: data.side.toUpperCase() as "BUY" | "SELL",
          shares: parseFloat(data.qty),
          orderType: data.type === "limit" ? "limit" : "market",
          estimatedPrice: limitPrice || 150.0,
          executedPrice: data.filled_avg_price ? parseFloat(data.filled_avg_price) : undefined,
          status: data.status === "filled" ? "filled" : "submitted",
          submittedAt: data.submitted_at || new Date().toISOString(),
          executedAt: data.filled_at,
          decisionId,
        };

        store.trades.unshift(tradeRecord);
        return tradeRecord;
      } catch (err) {
        console.warn("⚠️ Live Alpaca order failed. Executing in Paper Sandbox:", (err as Error).message);
      }
    }

    // Reliable in-memory Paper Sandbox Execution
    const stock = store.stocks.find((s) => s.symbol === sym);
    const executionPrice = limitPrice || stock?.price || 150.0;
    const totalCost = executionPrice * shares;

    const alpacaOrderId = `alpaca-paper-${uuidv4().slice(0, 8)}`;
    const tradeRecord: TradeRecord = {
      id: `tr-${uuidv4().slice(0, 8)}`,
      alpacaOrderId,
      symbol: sym,
      side,
      shares,
      orderType,
      estimatedPrice: executionPrice,
      executedPrice: executionPrice,
      status: "filled",
      submittedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      decisionId,
    };

    // Update balances & positions
    if (side === "BUY") {
      store.portfolio.cash -= totalCost;
      store.portfolio.buyingPower -= totalCost * 2;

      const existingPos = store.positions.find((p) => p.symbol === sym);
      if (existingPos) {
        const newShares = existingPos.shares + shares;
        const newCostBasis = (existingPos.avgEntryPrice * existingPos.shares + totalCost) / newShares;
        existingPos.shares = newShares;
        existingPos.avgEntryPrice = parseFloat(newCostBasis.toFixed(2));
        existingPos.marketValue = parseFloat((newShares * executionPrice).toFixed(2));
        existingPos.allocationPercent = parseFloat(
          ((existingPos.marketValue / store.portfolio.equity) * 100).toFixed(2)
        );
      } else {
        store.positions.push({
          symbol: sym,
          name: stock?.name || `${sym} Holding`,
          shares,
          avgEntryPrice: executionPrice,
          currentPrice: executionPrice,
          marketValue: parseFloat(totalCost.toFixed(2)),
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          allocationPercent: parseFloat(((totalCost / store.portfolio.equity) * 100).toFixed(2)),
          side: "long",
        });
      }
    } else {
      store.portfolio.cash += totalCost;
      store.portfolio.buyingPower += totalCost * 2;
      const existingPos = store.positions.find((p) => p.symbol === sym);
      if (existingPos) {
        existingPos.shares = Math.max(0, existingPos.shares - shares);
        existingPos.marketValue = parseFloat((existingPos.shares * executionPrice).toFixed(2));
        existingPos.allocationPercent = parseFloat(
          ((existingPos.marketValue / store.portfolio.equity) * 100).toFixed(2)
        );
      }
    }

    store.trades.unshift(tradeRecord);
    return tradeRecord;
  }

  public getRateLimitStatus(): { remaining: number; reset?: string } {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
    };
  }
}

export const alpacaService = new AlpacaService();
