import { Request, Response } from "express";
import { store } from "../services/mockDataStore.js";
import { alpacaService } from "../services/alpacaService.js";

export const getPortfolio = async (_req: Request, res: Response): Promise<void> => {
  const account = await alpacaService.getAccount();

  res.status(200).json({
    success: true,
    data: {
      account,
      summary: store.portfolio,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const getPositions = async (_req: Request, res: Response): Promise<void> => {
  const positions = await alpacaService.getPositions();

  res.status(200).json({
    success: true,
    data: positions,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
