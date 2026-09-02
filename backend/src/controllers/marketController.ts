import { Request, Response } from "express";
import { mockMarketService } from "../services/mockMarketService.js";

export const getMarketData = (req: Request, res: Response): void => {
  const { symbol } = req.query;

  if (symbol && typeof symbol === "string") {
    const quote = mockMarketService.getQuote(symbol);
    if (!quote) {
      res.status(404).json({
        success: false,
        error: {
          code: "ASSET_NOT_FOUND",
          message: `Market quote for symbol '${symbol.toUpperCase()}' not found`,
        },
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    const sentiment = mockMarketService.getNewsSentiment(symbol);
    res.status(200).json({
      success: true,
      data: {
        quote,
        sentiment,
      },
      meta: { timestamp: new Date().toISOString() },
    });
    return;
  }

  const quotes = mockMarketService.getAllQuotes();
  res.status(200).json({
    success: true,
    data: quotes,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
