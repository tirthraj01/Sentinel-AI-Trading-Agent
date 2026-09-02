import { Request, Response } from "express";
import { riskEngine } from "../services/riskEngine.js";
import { mockRiskService } from "../services/mockRiskService.js";
import { store } from "../services/mockDataStore.js";

export const getRiskStatus = (_req: Request, res: Response): void => {
  const status = mockRiskService.getRiskStatus();

  res.status(200).json({
    success: true,
    data: {
      ...status,
      killSwitchActive: riskEngine.isKillSwitchActive(),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const evaluateRiskProposal = (req: Request, res: Response): void => {
  const { symbol, decision, confidence, shares, price, customEquity } = req.body;

  if (!symbol || !shares || !price) {
    res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Missing required fields: symbol, shares, price",
    });
    return;
  }

  const evaluation = riskEngine.evaluateProposal({
    symbol: String(symbol).toUpperCase(),
    decision: decision || "BUY",
    confidence: Number(confidence) || 80,
    shares: Number(shares),
    price: Number(price),
    customEquity: customEquity ? Number(customEquity) : undefined,
  });

  res.status(200).json({
    success: true,
    data: evaluation,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const toggleKillSwitch = (req: Request, res: Response): void => {
  const { active } = req.body;

  if (typeof active !== "boolean") {
    res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Field 'active' (boolean) is required in request body.",
    });
    return;
  }

  riskEngine.setKillSwitch(active);

  res.status(200).json({
    success: true,
    data: {
      killSwitchActive: riskEngine.isKillSwitchActive(),
      message: active
        ? "Emergency Kill Switch ACTIVATED. All paper and live trades are frozen."
        : "Emergency Kill Switch DEACTIVATED. Normal trading operations resumed.",
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
