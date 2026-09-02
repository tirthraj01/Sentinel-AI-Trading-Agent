import { StockQuote } from "../types/index.js";
import { store } from "./mockDataStore.js";

export class MockMarketService {
  public getAllQuotes(): StockQuote[] {
    return store.stocks;
  }

  public getQuote(symbol: string): StockQuote | null {
    const sym = symbol.toUpperCase();
    return store.stocks.find((s) => s.symbol === sym) || null;
  }

  public getNewsSentiment(symbol: string): { score: number; headline: string; source: string } {
    const sym = symbol.toUpperCase();
    if (sym === "NVDA") {
      return {
        score: 0.82,
        headline: "Hyperscalers expand generative AI datacenter capital expenditure targets",
        source: "Bloomberg Technology",
      };
    }
    if (sym === "TSLA") {
      return {
        score: 0.41,
        headline: "EV margin pressure rises amid intensifying overseas competition",
        source: "Reuters Markets",
      };
    }
    if (sym === "AAPL") {
      return {
        score: 0.65,
        headline: "Services division revenue growth offsets seasonal hardware cycle lull",
        source: "Wall Street Journal",
      };
    }
    return {
      score: 0.58,
      headline: `Market analysts reiterate neutral-to-positive outlook for ${sym}`,
      source: "MarketWatch",
    };
  }
}

export const mockMarketService = new MockMarketService();
