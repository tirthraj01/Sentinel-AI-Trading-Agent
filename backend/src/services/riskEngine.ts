import { store } from "./mockDataStore.js";
import {
  RiskEvaluation,
  RiskCheckItem,
  RiskLevel,
  RiskRuleConfig,
} from "../types/index.js";

export interface RiskEvaluationInput {
  symbol: string;
  decision: "BUY" | "SELL" | "HOLD";
  confidence: number;
  shares: number;
  price: number;
  customEquity?: number;
  customDailyLossPercent?: number;
  customDailyTradesCount?: number;
}

export class DeterministicRiskEngine {
  private killSwitchActive = false;

  /**
   * Emergency Kill Switch: immediately freezes all trade executions across the platform.
   */
  public setKillSwitch(active: boolean): void {
    this.killSwitchActive = active;
    console.log(`🚨 Emergency Kill Switch ${active ? "ACTIVATED — All trading frozen!" : "DEACTIVATED — Trading resumed."}`);
  }

  public isKillSwitchActive(): boolean {
    return this.killSwitchActive;
  }

  /**
   * Deterministic Risk Evaluation Engine:
   * Evaluates all 6 safety rules mathematically without any non-deterministic LLMs.
   */
  public evaluateProposal(input: RiskEvaluationInput): RiskEvaluation {
    const {
      symbol,
      decision,
      confidence,
      shares,
      price,
      customEquity,
      customDailyLossPercent,
      customDailyTradesCount,
    } = input;

    const sym = symbol.toUpperCase();
    const checks: RiskCheckItem[] = [];
    const reasons: string[] = [];

    // 0. EMERGENCY KILL SWITCH CHECK
    if (this.killSwitchActive) {
      return {
        approved: false,
        riskLevel: "CRITICAL",
        checks: [
          {
            name: "emergency_kill_switch",
            label: "Emergency Kill Switch",
            threshold: 0,
            actual: 1,
            passed: false,
            unit: "status",
          },
        ],
        reasons: ["CRITICAL: Emergency Kill Switch is ACTIVE. All trading is strictly frozen by administrator."],
        evaluatedAt: new Date().toISOString(),
      };
    }

    const totalPortfolioEquity = customEquity ?? store.portfolio.equity;
    const proposedTradeCost = shares * price;
    const proposedTradeAllocationPct = (proposedTradeCost / totalPortfolioEquity) * 100;

    const existingPosition = store.positions.find((p) => p.symbol === sym);
    const existingPositionValue = existingPosition ? existingPosition.marketValue : 0;
    const projectedPositionValue = existingPositionValue + proposedTradeCost;
    const projectedPositionAllocationPct = (projectedPositionValue / totalPortfolioEquity) * 100;

    // RULE 1: Max Position Size (10.0% of portfolio equity ceiling)
    const positionLimitPassed = decision !== "BUY" || projectedPositionAllocationPct <= 10.0;
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

    // RULE 2: Max Single Trade Size (5.0% of portfolio equity ceiling)
    const singleTradePassed = decision !== "BUY" || proposedTradeAllocationPct <= 5.0;
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

    // RULE 3: Daily Loss Circuit Breaker (2.0% daily drawdown limit)
    const dailyDrawdownPct =
      customDailyLossPercent ?? Math.max(0, -store.portfolio.dailyPLPercent);
    const dailyLossPassed = dailyDrawdownPct < 2.0;
    checks.push({
      name: "max_daily_loss",
      label: "Daily Loss Circuit Breaker",
      threshold: 2.0,
      actual: parseFloat(dailyDrawdownPct.toFixed(1)),
      passed: dailyLossPassed,
      unit: "%",
    });
    if (!dailyLossPassed) {
      reasons.push(
        `VETOED: Emergency circuit breaker tripped. Daily portfolio loss is ${dailyDrawdownPct.toFixed(1)}% (limit 2.0%). All BUY orders frozen.`
      );
    }

    // RULE 4: Minimum AI Confidence (70.0% conviction floor)
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
        `VETOED: AI confidence of ${confidence.toFixed(1)}% is below the mandatory 70.0% algorithmic conviction floor.`
      );
    }

    // RULE 5: Max Daily Trades (10 trades per day quota)
    const todayTradesCount =
      customDailyTradesCount ??
      store.trades.filter((t) => t.status === "filled").length;
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
      reasons.push(
        `VETOED: Maximum daily execution quota reached (${todayTradesCount}/10 filled trades).`
      );
    }

    // RULE 6: Sector Exposure Limit (40.0% sector ceiling)
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
        `VETOED: Projected ${sector} sector exposure of ${projectedSectorPct.toFixed(1)}% exceeds the 40.0% sector ceiling.`
      );
    }

    // Determine aggregate risk level & approval
    const approved = checks.every((c) => c.passed);
    let riskLevel: RiskLevel = "LOW";

    if (!approved) {
      const failedCount = checks.filter((c) => !c.passed).length;
      if (!dailyLossPassed || failedCount >= 3) {
        riskLevel = "CRITICAL";
      } else if (failedCount >= 2) {
        riskLevel = "HIGH";
      } else {
        riskLevel = "MEDIUM";
      }
    }

    return {
      approved,
      riskLevel,
      checks,
      reasons,
      evaluatedAt: new Date().toISOString(),
    };
  }

  public getRules(): RiskRuleConfig[] {
    return store.riskRules;
  }

  public resetState(): void {
    this.killSwitchActive = false;
  }
}

export const riskEngine = new DeterministicRiskEngine();
