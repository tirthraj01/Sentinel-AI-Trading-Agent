import { Request, Response } from "express";
import { sentinelAgent } from "../services/agentService.js";
import { decisionRepository } from "../db/repositories/decisionRepository.js";
import { activityRepository } from "../db/repositories/activityRepository.js";
import { AnalyzeRequestInput } from "../schemas/index.js";

export const getAgentDecisions = async (req: Request, res: Response): Promise<void> => {
  const { symbol, limit } = req.query;
  const numLimit = limit ? parseInt(limit as string, 10) : 20;

  const decisions = await decisionRepository.getDecisions({
    symbol: typeof symbol === "string" ? symbol : undefined,
    limit: !isNaN(numLimit) ? numLimit : 20,
  });

  res.status(200).json({
    success: true,
    data: decisions,
    meta: {
      timestamp: new Date().toISOString(),
      total: decisions.length,
    },
  });
};

export const getAgentActivity = async (req: Request, res: Response): Promise<void> => {
  const { limit } = req.query;
  const numLimit = limit ? parseInt(limit as string, 10) : 20;

  const activities = await activityRepository.getActivities(!isNaN(numLimit) ? numLimit : 20);

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

  const decision = await sentinelAgent.runPipeline({
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
