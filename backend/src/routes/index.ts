import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { getMarketData } from "../controllers/marketController.js";
import { getPortfolio, getPositions } from "../controllers/portfolioController.js";
import { getTrades, createTrade } from "../controllers/tradesController.js";
import {
  getAgentDecisions,
  getAgentActivity,
  analyzeSymbol,
} from "../controllers/agentController.js";
import { getRiskStatus } from "../controllers/riskController.js";
import { getMcpTools, callMcpTool } from "../controllers/mcpController.js";
import { validateBody } from "../middleware/validate.js";
import { AnalyzeRequestSchema, CreateTradeRequestSchema } from "../schemas/index.js";

export const apiRouter = Router();

// Health check
apiRouter.get("/health", getHealth);

// Market data & quotes
apiRouter.get("/market", getMarketData);

// Portfolio & positions
apiRouter.get("/portfolio", getPortfolio);
apiRouter.get("/positions", getPositions);

// Trades
apiRouter.get("/trades", getTrades);
apiRouter.post("/trades", validateBody(CreateTradeRequestSchema), createTrade);

// AI Agent
apiRouter.get("/agent/decisions", getAgentDecisions);
apiRouter.get("/agent/activity", getAgentActivity);
apiRouter.post("/agent/analyze", validateBody(AnalyzeRequestSchema), analyzeSymbol);

// Risk Engine
apiRouter.get("/risk/status", getRiskStatus);

// Model Context Protocol (MCP) Endpoints
apiRouter.get("/mcp/tools", getMcpTools);
apiRouter.post("/mcp/call", callMcpTool);
