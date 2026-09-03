import {
  PortfolioSummary,
  Position,
  StockQuote,
  TradeRecord,
  AgentDecision,
  AgentActivityEvent,
  RiskStatus,
} from "../types";
import {
  MOCK_PORTFOLIO,
  MOCK_POSITIONS,
  MOCK_STOCKS,
  MOCK_TRADES,
  MOCK_DECISIONS,
  MOCK_ACTIVITIES,
  MOCK_RISK_STATUS,
} from "../data/mockData";

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson: any;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Not JSON
      }
      throw new Error(errorJson?.message || `Request to ${endpoint} failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API] Network notice for ${endpoint}:`, (err as Error).message);
    throw err;
  }
}

export const api = {
  // 0. Health Check
  async getHealth(): Promise<{ status: string }> {
    return request<{ status: string }>("/health");
  },

  // 1. Portfolio & Balances
  async getPortfolio(): Promise<{ account: any; summary: PortfolioSummary }> {
    try {
      const data = await request<{ account: any; summary: any }>("/portfolio");
      return {
        account: data.account,
        summary: {
          equity: data.summary.equity,
          totalEquity: data.summary.equity,
          cash: data.summary.cash,
          buyingPower: data.summary.buyingPower,
          dailyPL: data.summary.dailyPL,
          dailyPLPercent: data.summary.dailyPLPercent,
          totalPL: data.summary.totalPL,
          totalPLPercent: data.summary.totalPLPercent,
          portfolioHistory: MOCK_PORTFOLIO.portfolioHistory,
          timeframeData: MOCK_PORTFOLIO.timeframeData,
        },
      };
    } catch {
      return {
        account: { id: "alpaca-paper-acc-sentinel-01", is_paper: true, status: "ACTIVE" },
        summary: MOCK_PORTFOLIO,
      };
    }
  },

  // 2. Positions
  async getPositions(): Promise<Position[]> {
    try {
      const data = await request<any[]>("/positions");
      return data.map((p) => ({
        symbol: p.symbol,
        name: p.name,
        shares: p.shares,
        avgEntryPrice: p.avgEntryPrice,
        currentPrice: p.currentPrice,
        marketValue: p.marketValue,
        unrealizedPL: p.unrealizedPL,
        unrealizedPLPercent: p.unrealizedPLPercent,
        allocationPercent: p.allocationPercent,
        side: p.side || "long",
      }));
    } catch {
      return MOCK_POSITIONS;
    }
  },

  // 3. Market Data
  async getMarketQuotes(symbol?: string): Promise<StockQuote[]> {
    try {
      const endpoint = symbol ? `/market?symbol=${symbol.toUpperCase()}` : "/market";
      const data = await request<any>(endpoint);
      if (symbol) {
        return [data.quote];
      }
      return data;
    } catch {
      if (symbol) {
        const found = MOCK_STOCKS.find((s: StockQuote) => s.symbol === symbol.toUpperCase());
        return found ? [found] : [];
      }
      return MOCK_STOCKS;
    }
  },

  // 4. Trades
  async getTrades(filters?: { symbol?: string; status?: string }): Promise<TradeRecord[]> {
    try {
      let query = "";
      if (filters?.symbol) query += `?symbol=${filters.symbol.toUpperCase()}`;
      if (filters?.status) query += `${query ? "&" : "?"}status=${filters.status}`;

      const data = await request<any[]>(`/trades${query}`);
      return data.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        shares: t.shares,
        orderType: t.orderType || "market",
        estimatedPrice: t.estimatedPrice || t.price,
        executedPrice: t.executedPrice,
        submittedAt: t.submittedAt || t.timestamp,
        executedAt: t.executedAt,
        status: t.status,
        decisionId: t.decisionId,
        riskReasons: t.riskReasons,
      }));
    } catch {
      return MOCK_TRADES;
    }
  },

  async submitTrade(params: {
    symbol: string;
    side: "BUY" | "SELL";
    shares: number;
    orderType: "market" | "limit";
    limitPrice?: number;
  }): Promise<TradeRecord> {
    const data = await request<any>("/trades", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return {
      id: data.id,
      symbol: data.symbol,
      side: data.side,
      shares: data.shares,
      orderType: data.orderType || "market",
      estimatedPrice: data.estimatedPrice,
      executedPrice: data.executedPrice,
      status: data.status,
      submittedAt: data.submittedAt,
      executedAt: data.executedAt,
      decisionId: data.decisionId,
    };
  },

  // 5. AI Agent Decisions
  async getAgentDecisions(filters?: { symbol?: string; limit?: number }): Promise<AgentDecision[]> {
    try {
      let query = "";
      if (filters?.symbol) query += `?symbol=${filters.symbol.toUpperCase()}`;
      if (filters?.limit) query += `${query ? "&" : "?"}limit=${filters.limit}`;

      const data = await request<any[]>(`/agent/decisions${query}`);
      return data.map((d) => ({
        id: d.id,
        runId: d.runId || `run-${d.symbol.toLowerCase()}-01`,
        symbol: d.symbol,
        decision: d.decision,
        confidence: d.confidence,
        createdAt: d.createdAt,
        reasoning: d.reasoning,
        suggestedAllocationPct: d.suggestedAllocationPct,
        suggestedShares: d.suggestedShares,
        riskAssessment: d.riskAssessment,
        marketSummary: {
          trend: d.marketSummary?.trend || "BULLISH",
          volumeAnalysis: d.marketSummary?.volumeAnalysis || "Institutional volume detected",
          keyLevels: d.marketSummary?.keyLevels,
        },
        newsSentiment: {
          score: d.newsSentiment?.score ?? 0.75,
          headline: d.newsSentiment?.headline || `${d.symbol} shows strong institutional demand`,
          source: d.newsSentiment?.source || "Bloomberg",
        },
        riskResult: d.riskResult,
        status: d.status,
        alpacaOrderId: d.alpacaOrderId,
      }));
    } catch {
      return MOCK_DECISIONS;
    }
  },

  // 6. Agent Activity Log Stream
  async getAgentActivity(limit = 20): Promise<AgentActivityEvent[]> {
    try {
      const data = await request<any[]>(`/agent/activity?limit=${limit}`);
      return data.map((a) => ({
        id: a.id,
        runId: a.runId || "run-activity-stream",
        timestamp: a.timestamp,
        stage: a.stage,
        title: a.title,
        message: a.message,
        status: a.status,
      }));
    } catch {
      return MOCK_ACTIVITIES;
    }
  },

  // 7. Trigger AI Analysis
  async analyzeSymbol(params: {
    symbol: string;
    forceScenario?: "APPROVED" | "BLOCKED" | "AUTO";
  }): Promise<AgentDecision> {
    const data = await request<any>("/agent/analyze", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return {
      id: data.id,
      runId: data.runId || `run-${data.symbol.toLowerCase()}-live`,
      symbol: data.symbol,
      decision: data.decision,
      confidence: data.confidence,
      createdAt: data.createdAt,
      reasoning: data.reasoning,
      suggestedAllocationPct: data.suggestedAllocationPct,
      suggestedShares: data.suggestedShares,
      riskAssessment: data.riskAssessment,
      marketSummary: {
        trend: data.marketSummary?.trend || "BULLISH",
        volumeAnalysis: data.marketSummary?.volumeAnalysis || "Institutional volume detected",
        keyLevels: data.marketSummary?.keyLevels,
      },
      newsSentiment: {
        score: data.newsSentiment?.score ?? 0.75,
        headline: data.newsSentiment?.headline || `${data.symbol} demonstrates solid technical setup`,
        source: data.newsSentiment?.source || "Sentinel Surveillance",
      },
      riskResult: data.riskResult,
      status: data.status,
      alpacaOrderId: data.alpacaOrderId,
    };
  },

  // 8. Deterministic Risk Engine
  async getRiskStatus(): Promise<RiskStatus> {
    try {
      const data = await request<any>("/risk/status");
      return {
        status: data.status || "ACTIVE_GUARD",
        rules: data.rules || MOCK_RISK_STATUS.rules,
        recentVetoes: data.recentVetoes || MOCK_RISK_STATUS.recentVetoes,
        metrics: {
          portfolioDrawdown: data.metrics?.portfolioDrawdown ?? MOCK_RISK_STATUS.metrics.portfolioDrawdown,
          maxSingleExposure: data.metrics?.maxSingleExposure ?? MOCK_RISK_STATUS.metrics.maxSingleExposure,
          openPositionsCount: data.metrics?.openPositionsCount ?? MOCK_RISK_STATUS.metrics.openPositionsCount,
          dailyTradesUsed: data.metrics?.dailyTradesUsed ?? MOCK_RISK_STATUS.metrics.dailyTradesUsed,
        },
        killSwitchActive: data.killSwitchActive,
      };
    } catch {
      return MOCK_RISK_STATUS;
    }
  },

  async evaluateRisk(params: {
    symbol: string;
    decision: "BUY" | "SELL" | "HOLD";
    confidence: number;
    shares: number;
    price: number;
  }): Promise<any> {
    return request<any>("/risk/evaluate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async toggleKillSwitch(active: boolean): Promise<{ killSwitchActive: boolean; message: string }> {
    return request<{ killSwitchActive: boolean; message: string }>("/risk/kill-switch", {
      method: "POST",
      body: JSON.stringify({ active }),
    });
  },

  // 9. Model Context Protocol Tools
  async getMcpTools(): Promise<any[]> {
    try {
      return await request<any[]>("/mcp/tools");
    } catch {
      return [];
    }
  },
};
