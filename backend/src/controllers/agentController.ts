import { Request, Response } from "express";
import { mockAgentService } from "../services/mockAgentService.js";
import { AnalyzeRequestInput } from "../schemas/index.js";

export const getAgentDecisions = (req: Request, res: Response): void => {
  const { symbol, limit } = req.query;
  let decisions = mockAgentService.getDecisions();

  if (symbol && typeof symbol === "string") {
    decisions = decisions.filter((d) => d.symbol === symbol.toUpperCase());
  }

  if (limit) {
    const numLimit = parseInt(limit as string, 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      decisions = decisions.slice(0, numLimit);
    }
  }

  res.status(200).json({
    success: true,
    data: decisions,
    meta: {
      timestamp: new Date().toISOString(),
      total: decisions.length,
    },
  });
};

export const getAgentActivity = (req: Request, res: Response): void => {
  const { limit } = req.query;
  let activities = mockAgentService.getActivities();

  if (limit) {
    const numLimit = parseInt(limit as string, 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      activities = activities.slice(0, numLimit);
    }
  }

  res.status(200).json({
    success: true,
    data: activities,
    meta: {
      timestamp: new Date().toISOString(),
      total: activities.length,
    },
  });
};

export const analyzeSymbol = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AnalyzeRequestInput;

  const decision = await mockAgentService.runAnalysisCycle({
    symbol: body.symbol,
    forceScenario: body.forceScenario,
  });

  res.status(200).json({
    success: true,
    data: decision,
    meta: {
      timestamp: new Date().toISOString(),
      runId: decision.runId,
    },
  });
};
