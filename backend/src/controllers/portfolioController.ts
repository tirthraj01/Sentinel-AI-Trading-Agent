import { Request, Response } from "express";
import { store } from "../services/mockDataStore.js";
import { mockAlpacaService } from "../services/mockAlpacaService.js";

export const getPortfolio = (_req: Request, res: Response): void => {
  const account = mockAlpacaService.getAccount();

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

export const getPositions = (_req: Request, res: Response): void => {
  const positions = mockAlpacaService.getPositions();

  res.status(200).json({
    success: true,
    data: positions,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
