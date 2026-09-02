import { Request, Response } from "express";
import { store } from "../services/mockDataStore.js";
import { alpacaService } from "../services/alpacaService.js";
import { CreateTradeRequestInput } from "../schemas/index.js";

export const getTrades = (req: Request, res: Response): void => {
  const { symbol, status, limit } = req.query;

  let results = [...store.trades];

  if (symbol && typeof symbol === "string") {
    results = results.filter((t) => t.symbol === symbol.toUpperCase());
  }

  if (status && typeof status === "string") {
    results = results.filter((t) => t.status === status);
  }

  if (limit) {
    const numLimit = parseInt(limit as string, 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      results = results.slice(0, numLimit);
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    meta: {
      timestamp: new Date().toISOString(),
      total: results.length,
    },
  });
};

export const createTrade = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateTradeRequestInput;

  const order = await alpacaService.submitPaperOrder({
    symbol: body.symbol,
    side: body.side,
    shares: body.shares,
    orderType: body.orderType,
    limitPrice: body.limitPrice,
  });

  res.status(201).json({
    success: true,
    data: order,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
