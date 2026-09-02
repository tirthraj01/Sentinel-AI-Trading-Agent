import { v4 as uuidv4 } from "uuid";
import { store } from "./mockDataStore.js";
import { mockMarketService } from "./mockMarketService.js";
import { mockRiskService } from "./mockRiskService.js";
import { mockAlpacaService } from "./mockAlpacaService.js";
import { AgentDecision, AgentActivityEvent, DecisionType } from "../types/index.js";

export class MockAgentService {
  public async runAnalysisCycle(params: {
    symbol: string;
    forceScenario?: "APPROVED" | "BLOCKED" | "AUTO";
  }): Promise<AgentDecision> {
    const { symbol, forceScenario = "AUTO" } = params;
    const sym = symbol.toUpperCase();
    const runId = `run-${sym.toLowerCase()}-${Date.now().toString().slice(-6)}`;
    const decisionId = `dec-${uuidv4().slice(0, 8)}`;

    // 1. Stage: OBSERVE
    const stock = mockMarketService.getQuote(sym) || {
      symbol: sym,
      name: `${sym} Corp.`,
      price: 150.0,
      change: 1.5,
      changePercent: 1.0,
      volume: "15.0M",
      high: 152.0,
      low: 148.0,
      open: 149.0,
      previousClose: 148.5,
      sector: "Technology",
      chartData: [],
    };
    const news = mockMarketService.getNewsSentiment(sym);

    this.logActivity({
      runId,
      stage: "OBSERVE",
      title: `Market Telemetry Ingested for ${sym}`,
      message: `Received real-time quotes ($${stock.price.toFixed(2)}) and news sentiment score (${(news.score * 100).toFixed(0)}%).`,
      status: "info",
    });

    // 2. Stage: ANALYZE
    this.logActivity({
      runId,
      stage: "ANALYZE",
      title: `Multi-Signal Synthesis for ${sym}`,
      message: `Analyzing volume profile (${stock.volume}), moving average convergence, and macroeconomic risk factors.`,
      status: "info",
    });

    // 3. Stage: DECIDE
    let decisionType: DecisionType = "BUY";
    let confidence = 84.0;
    let suggestedShares = 20;
    let reasoning = `Technical momentum continuation supported by positive institutional volume. News sentiment is favorable at ${(news.score * 100).toFixed(0)}%.`;

    if (forceScenario === "BLOCKED" || (forceScenario === "AUTO" && sym === "TSLA")) {
      decisionType = "BUY";
      confidence = 68.0; // Under 70% threshold
      suggestedShares = 35; // Excess allocation
      reasoning = `Rebound attempt near support zone. High options volatility creates downside skew, resulting in low algorithmic confidence (${confidence}%).`;
    } else if (sym === "AAPL") {
      decisionType = "HOLD";
      confidence = 75.0;
      suggestedShares = 0;
      reasoning = `Position already at 8.72% portfolio concentration, approaching the 10.0% ceiling. Sentinel recommends HOLD to prevent over-allocation.`;
    } else if (forceScenario === "APPROVED" || sym === "NVDA") {
      decisionType = "BUY";
      confidence = 86.0;
      suggestedShares = 15;
      reasoning = `Bullish breakout continuation confirmed by institutional accumulation and strong generative AI compute demand.`;
    }

    const proposedTradeCost = suggestedShares * stock.price;
    const suggestedAllocationPct = parseFloat(
      ((proposedTradeCost / store.portfolio.equity) * 100).toFixed(1)
    );

    // 4. Stage: RISK_CHECK
    const riskResult = mockRiskService.evaluateProposal({
      symbol: sym,
      decision: decisionType,
      confidence,
      shares: suggestedShares,
      price: stock.price,
    });

    if (riskResult.approved) {
      this.logActivity({
        runId,
        stage: "RISK_CHECK",
        title: `Risk Guard Cleared for ${sym}`,
        message: `All deterministic safety rules passed. Proposed allocation (${suggestedAllocationPct}%) within exposure ceiling.`,
        status: "success",
      });
    } else {
      this.logActivity({
        runId,
        stage: "BLOCKED",
        title: `Risk Engine Veto on ${sym}`,
        message: `Trade proposal rejected by deterministic guard: ${riskResult.reasons.join(" ")}`,
        status: "warning",
      });
    }

    // 5. Stage: EXECUTE (Paper Only)
    let alpacaOrderId: string | undefined;
    let finalStatus: "APPROVED_EXECUTED" | "BLOCKED_BY_RISK" | "ANALYSIS_ONLY" =
      "ANALYSIS_ONLY";

    if (decisionType === "BUY" && riskResult.approved) {
      const order = mockAlpacaService.submitPaperOrder({
        symbol: sym,
        side: "BUY",
        shares: suggestedShares,
        orderType: "market",
        decisionId,
      });
      alpacaOrderId = order.alpacaOrderId;
      finalStatus = "APPROVED_EXECUTED";

      this.logActivity({
        runId,
        stage: "EXECUTION",
        title: `Alpaca Paper Order Submitted for ${sym}`,
        message: `Order ${alpacaOrderId} filled: BUY ${suggestedShares} ${sym} @ $${stock.price.toFixed(2)}.`,
        status: "success",
      });
    } else if (!riskResult.approved) {
      finalStatus = "BLOCKED_BY_RISK";
      // Record blocked trade
      store.trades.unshift({
        id: `tr-${uuidv4().slice(0, 8)}`,
        symbol: sym,
        side: "BUY",
        shares: suggestedShares,
        orderType: "market",
        estimatedPrice: stock.price,
        status: "blocked",
        submittedAt: new Date().toISOString(),
        decisionId,
        riskReasons: riskResult.reasons,
      });
    }

    const decisionRecord: AgentDecision = {
      id: decisionId,
      runId,
      symbol: sym,
      decision: decisionType,
      confidence,
      reasoning,
      suggestedAllocationPct,
      suggestedShares,
      riskAssessment: riskResult.riskLevel as "LOW" | "MEDIUM" | "HIGH",
      marketSummary: {
        trend: stock.change >= 0 ? "BULLISH" : "BEARISH",
        volumeAnalysis: `${stock.volume} volume with institutional presence`,
        keyLevels: {
          support: parseFloat((stock.price * 0.96).toFixed(2)),
          resistance: parseFloat((stock.price * 1.05).toFixed(2)),
        },
      },
      newsSentiment: news,
      riskResult,
      createdAt: new Date().toISOString(),
      status: finalStatus,
      alpacaOrderId,
    };

    store.decisions.unshift(decisionRecord);

    this.logActivity({
      runId,
      stage: "COMPLETE",
      title: `Agent Cycle Complete for ${sym}`,
      message: `Final status: ${finalStatus}. Immutable record stored with ID ${decisionId}.`,
      status: "info",
    });

    return decisionRecord;
  }

  public getDecisions(): AgentDecision[] {
    return store.decisions;
  }

  public getActivities(): AgentActivityEvent[] {
    return store.activities;
  }

  private logActivity(event: Omit<AgentActivityEvent, "id" | "timestamp">): void {
    const activity: AgentActivityEvent = {
      id: `act-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    store.activities.unshift(activity);
  }
}

export const mockAgentService = new MockAgentService();
