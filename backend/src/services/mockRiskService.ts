import { store } from "./mockDataStore.js";
import { RiskEvaluation, RiskCheckItem, RiskLevel } from "../types/index.js";

export class MockRiskService {
  public evaluateProposal(params: {
    symbol: string;
    decision: "BUY" | "SELL" | "HOLD";
    confidence: number;
    shares: number;
    price: number;
  }): RiskEvaluation {
    const { symbol, decision, confidence, shares, price } = params;
    const sym = symbol.toUpperCase();
    const checks: RiskCheckItem[] = [];
    const reasons: string[] = [];

    const totalPortfolioEquity = store.portfolio.equity;
    const proposedTradeCost = shares * price;
    const proposedTradeAllocationPct = (proposedTradeCost / totalPortfolioEquity) * 100;

    const existingPosition = store.positions.find((p) => p.symbol === sym);
    const existingPositionValue = existingPosition ? existingPosition.marketValue : 0;
    const projectedPositionValue = existingPositionValue + proposedTradeCost;
    const projectedPositionAllocationPct = (projectedPositionValue / totalPortfolioEquity) * 100;

    // 1. Max Position Exposure (10% limit)
    const positionLimitPassed =
      decision !== "BUY" || projectedPositionAllocationPct <= 10.0;
    checks.push({
      name: "max_position_size",
      label: "Max Position Exposure",
      threshold: 10.0,
      actual: parseFloat(projectedPositionAllocationPct.toFixed(1)),
      passed: positionLimitPassed,
      unit: "%",
    });
    if (!positionLimitPassed) {
      reasons.push(
        `VETOED: Projected position of ${projectedPositionAllocationPct.toFixed(1)}% exceeds the 10.0% single-asset limit.`
      );
    }

    // 2. Max Single Trade Size (5% limit)
    const singleTradePassed =
      decision !== "BUY" || proposedTradeAllocationPct <= 5.0;
    checks.push({
      name: "max_single_trade",
      label: "Max Single Trade Size",
      threshold: 5.0,
      actual: parseFloat(proposedTradeAllocationPct.toFixed(1)),
      passed: singleTradePassed,
      unit: "%",
    });
    if (!singleTradePassed) {
      reasons.push(
        `VETOED: Proposed allocation of ${proposedTradeAllocationPct.toFixed(1)}% exceeds the 5.0% single-trade limit.`
      );
    }

    // 3. Daily Loss Circuit Breaker (2% limit)
    const dailyDrawdownPct = Math.max(0, -store.portfolio.dailyPLPercent);
    const dailyLossPassed = dailyDrawdownPct < 2.0;
    checks.push({
      name: "max_daily_loss",
      label: "Daily Drawdown Circuit Breaker",
      threshold: 2.0,
      actual: parseFloat(dailyDrawdownPct.toFixed(1)),
      passed: dailyLossPassed,
      unit: "%",
    });
    if (!dailyLossPassed) {
      reasons.push("VETOED: Emergency circuit breaker tripped (drawdown >= 2.0%).");
    }

    // 4. Minimum AI Confidence (70% floor)
    const confidencePassed = confidence >= 70.0;
    checks.push({
      name: "min_ai_confidence",
      label: "Minimum AI Conviction Floor",
      threshold: 70.0,
      actual: parseFloat(confidence.toFixed(1)),
      passed: confidencePassed,
      unit: "%",
    });
    if (!confidencePassed) {
      reasons.push(
        `VETOED: AI confidence of ${confidence.toFixed(1)}% is below the mandatory 70.0% threshold.`
      );
    }

    // 5. Max Daily Executions (10 trades limit)
    const todayTradesCount = store.trades.filter((t) => t.status === "filled").length;
    const dailyTradesPassed = todayTradesCount < 10;
    checks.push({
      name: "max_daily_trades",
      label: "Max Daily Executions",
      threshold: 10,
      actual: todayTradesCount,
      passed: dailyTradesPassed,
      unit: "trades",
    });
    if (!dailyTradesPassed) {
      reasons.push("VETOED: Daily execution quota reached (10 trades).");
    }

    // 6. Max Sector Exposure (40% limit)
    const stock = store.stocks.find((s) => s.symbol === sym);
    const sector = stock?.sector || "Technology";
    const sectorPositions = store.positions.filter(
      (p) => store.stocks.find((s) => s.symbol === p.symbol)?.sector === sector
    );
    const currentSectorValue = sectorPositions.reduce((sum, p) => sum + p.marketValue, 0);
    const projectedSectorPct =
      ((currentSectorValue + (decision === "BUY" ? proposedTradeCost : 0)) /
        totalPortfolioEquity) *
      100;
    const sectorLimitPassed = projectedSectorPct <= 40.0;
    checks.push({
      name: "max_sector_exposure",
      label: "Max Sector Exposure",
      threshold: 40.0,
      actual: parseFloat(projectedSectorPct.toFixed(1)),
      passed: sectorLimitPassed,
      unit: "%",
    });
    if (!sectorLimitPassed) {
      reasons.push(
        `VETOED: Sector exposure ${projectedSectorPct.toFixed(1)}% exceeds the 40.0% ceiling.`
      );
    }

    // 7. Cash availability check
    if (decision === "BUY" && proposedTradeCost > store.portfolio.cash) {
      reasons.push(
        `VETOED: Insufficient paper cash ($${store.portfolio.cash.toFixed(2)} available vs $${proposedTradeCost.toFixed(2)} required).`
      );
    }

    const approved = checks.every((c) => c.passed) && reasons.length === 0;

    let riskLevel: RiskLevel = "LOW";
    if (!approved) {
      riskLevel = reasons.some((r) => r.includes("circuit breaker") || r.includes("70.0%"))
        ? "CRITICAL"
        : "HIGH";
    } else if (projectedPositionAllocationPct >= 7.5) {
      riskLevel = "MEDIUM";
    }

    if (approved) {
      reasons.push("All 6 deterministic safety rules passed successfully.");
    }

    return {
      approved,
      riskLevel,
      reasons,
      checks,
      evaluatedAt: new Date().toISOString(),
    };
  }

  public getRiskStatus() {
    return {
      status: "ACTIVE_GUARD",
      rules: store.riskRules,
      recentVetoes: store.trades
        .filter((t) => t.status === "blocked")
        .map((t) => ({
          symbol: t.symbol,
          timestamp: t.submittedAt,
          reasons: t.riskReasons || [],
        })),
      metrics: {
        portfolioDrawdown: 0.0,
        maxSingleExposure: 8.72,
        openPositionsCount: store.positions.length,
        dailyTradesUsed: store.trades.filter((t) => t.status === "filled").length,
      },
    };
  }
}

export const mockRiskService = new MockRiskService();
