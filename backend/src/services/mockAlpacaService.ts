import { store } from "./mockDataStore.js";
import { Position, TradeRecord } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

export class MockAlpacaService {
  constructor() {
    this.assertPaperSafety();
  }

  private assertPaperSafety(): void {
    const isPaper = process.env.ALPACA_PAPER_TRADE !== "false";
    if (!isPaper) {
      throw new Error(
        "CRITICAL SAFETY VIOLATION: SENTINEL is strictly locked to Alpaca Paper Trading. Live execution rejected."
      );
    }
  }

  public getAccount() {
    this.assertPaperSafety();
    return {
      id: "alpaca-paper-acc-sentinel-01",
      status: "ACTIVE",
      currency: "USD",
      cash: store.portfolio.cash,
      portfolio_value: store.portfolio.equity,
      buying_power: store.portfolio.buyingPower,
      trading_blocked: false,
      transfers_blocked: false,
      account_blocked: false,
      pattern_day_trader: false,
      is_paper: true,
    };
  }

  public getPositions(): Position[] {
    this.assertPaperSafety();
    return store.positions;
  }

  public getPosition(symbol: string): Position | undefined {
    this.assertPaperSafety();
    const sym = symbol.toUpperCase();
    return store.positions.find((p) => p.symbol === sym);
  }

  public submitPaperOrder(params: {
    symbol: string;
    side: "BUY" | "SELL";
    shares: number;
    orderType: "market" | "limit";
    limitPrice?: number;
    decisionId?: string;
  }): TradeRecord {
    this.assertPaperSafety();
    const { symbol, side, shares, orderType, limitPrice, decisionId } = params;
    const sym = symbol.toUpperCase();

    // Check market price
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

    // Update in-memory positions & cash
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
          name: stock?.name || `${sym} Equity`,
          shares,
          avgEntryPrice: executionPrice,
          currentPrice: executionPrice,
          marketValue: parseFloat(totalCost.toFixed(2)),
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          allocationPercent: parseFloat(
            ((totalCost / store.portfolio.equity) * 100).toFixed(2)
          ),
          side: "long",
        });
      }
    } else {
      // SELL
      store.portfolio.cash += totalCost;
      store.portfolio.buyingPower += totalCost * 2;

      const existingPos = store.positions.find((p) => p.symbol === sym);
      if (existingPos) {
        existingPos.shares = Math.max(0, existingPos.shares - shares);
        existingPos.marketValue = parseFloat(
          (existingPos.shares * executionPrice).toFixed(2)
        );
        existingPos.allocationPercent = parseFloat(
          ((existingPos.marketValue / store.portfolio.equity) * 100).toFixed(2)
        );
      }
    }

    store.trades.unshift(tradeRecord);
    return tradeRecord;
  }
}

export const mockAlpacaService = new MockAlpacaService();
