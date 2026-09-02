import { Request, Response } from "express";
import { mockRiskService } from "../services/mockRiskService.js";

export const getRiskStatus = (_req: Request, res: Response): void => {
  const status = mockRiskService.getRiskStatus();

  res.status(200).json({
    success: true,
    data: status,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
