import { Request, Response } from "express";

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      service: "sentinel-backend",
      version: "0.1.0",
      environment: process.env.NODE_ENV || "development",
      paperTrading: process.env.ALPACA_PAPER_TRADE !== "false",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
