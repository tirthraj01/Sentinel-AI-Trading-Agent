import { Request, Response } from "express";
import { store } from "../services/mockDataStore.js";
import { riskEngine } from "../services/riskEngine.js";
import { sentinelAgent } from "../services/agentService.js";

/**
 * POST /api/demo/reset
 * Resets portfolio to initial $100,000 cash state, clears recent trades/vetoes,
 * and restores default market baseline.
 */
export const resetDemoState = (_req: Request, res: Response): void => {
  store.resetDemoState();
  riskEngine.resetState();

  res.status(200).json({
    success: true,
    message: "Demo state successfully reset to initial $100,000 portfolio baseline.",
    data: {
      portfolio: store.portfolio,
      positionsCount: store.positions.length,
      tradesCount: store.trades.length,
      killSwitchActive: riskEngine.isKillSwitchActive(),
    },
  });
};

/**
 * POST /api/demo/trigger-scenario
 * One-click scenario dispatcher:
 * - 'A': Standard Buy Approved (NVDA)
 * - 'B': Position Sizing Veto (TSLA > 10% ceiling)
 * - 'C': Low Conviction Veto (Confidence < 70%)
 * - 'D': Emergency Circuit Breaker (Daily loss >= 2%)
 */
export const triggerDemoScenario = async (req: Request, res: Response): Promise<void> => {
  const { scenario } = req.body;

  if (!scenario || !["A", "B", "C", "D"].includes(scenario)) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_SCENARIO",
        message: "Scenario must be one of 'A', 'B', 'C', or 'D'.",
      },
    });
    return;
  }

  try {
    let result;

    switch (scenario) {
      case "A": {
        // Standard Buy Approved (NVDA)
        result = await sentinelAgent.runPipeline({ symbol: "NVDA", forceScenario: "APPROVED" });
        break;
      }
      case "B": {
        // Position Sizing Veto (TSLA)
        result = await sentinelAgent.runPipeline({ symbol: "TSLA", forceScenario: "BLOCKED" });
        break;
      }
      case "C": {
        // Low Conviction Veto (< 70% threshold)
        // Direct evaluation returning conviction breach
        const evaluation = riskEngine.evaluateProposal({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 64.0,
          shares: 5,
          price: 228.65,
        });
        result = {
          scenario: "C",
          title: "Low AI Conviction Veto",
          symbol: "AAPL",
          confidence: 64.0,
          decision: "BUY",
          riskResult: evaluation,
          status: "BLOCKED_BY_RISK",
          message: "Speculative buy vetoed: Conviction of 64.0% is below the mandatory 70.0% floor.",
        };
        break;
      }
      case "D": {
        // Emergency Circuit Breaker (Tripped by 2.5% drawdown)
        const evaluation = riskEngine.evaluateProposal({
          symbol: "MSFT",
          decision: "BUY",
          confidence: 94.0,
          shares: 2,
          price: 448.25,
          customDailyLossPercent: 2.5,
        });
        result = {
          scenario: "D",
          title: "Emergency Circuit Breaker Tripped",
          symbol: "MSFT",
          confidence: 94.0,
          decision: "BUY",
          riskResult: evaluation,
          status: "BLOCKED_BY_CIRCUIT_BREAKER",
          message: "Trading halted: Portfolio daily drawdown reached 2.5% (limit 2.0%). All BUY orders frozen.",
        };
        break;
      }
    }

    res.status(200).json({
      success: true,
      scenario,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: "SCENARIO_EXECUTION_ERROR",
        message: (err as Error).message,
      },
    });
  }
};
