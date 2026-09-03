import { Request, Response } from "express";
import { sentinelAgent } from "../services/agentService.js";
import { decisionRepository } from "../db/repositories/decisionRepository.js";
import { activityRepository } from "../db/repositories/activityRepository.js";
import { AnalyzeRequestInput } from "../schemas/index.js";
import { llmService } from "../services/llmService.js";
import { store } from "../services/mockDataStore.js";
import { mockRiskService } from "../services/mockRiskService.js";

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

export const askSentinel = async (req: Request, res: Response): Promise<void> => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 1000) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Message is required and must be 1,000 characters or fewer." },
    });
    return;
  }

  const context = `Current portfolio equity: $${store.portfolio.equity.toFixed(2)}. Cash: $${store.portfolio.cash.toFixed(2)}. Buying power: $${store.portfolio.buyingPower.toFixed(2)}. Open positions: ${store.positions.map((position) => `${position.symbol} ${position.shares} shares (${position.allocationPercent.toFixed(2)}%)`).join(", ")}. Recent trades: ${store.trades.slice(0, 5).map((trade) => `${trade.side} ${trade.shares} ${trade.symbol} (${trade.status})`).join(", ")}. Risk status: ${mockRiskService.getRiskStatus().status}.`;
  const answer = await llmService.answerQuestion(message, context);

  res.status(200).json({
    success: true,
    data: { answer, provider: llmService.isLiveLLMConfigured() ? "GEMINI" : "DETERMINISTIC" },
    meta: { timestamp: new Date().toISOString() },
  });
};
