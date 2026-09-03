import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

/**
 * Institutional Input Sanitization Regex:
 * Tickers are 1 to 10 uppercase alphabetic characters (e.g. AAPL, NVDA, UNKNOWNXYZ, BRK.B).
 * Strictly forbids SQL, HTML, script, path traversal, or control characters.
 */
const VALID_TICKER_REGEX = /^[A-Z]{1,10}(\.[A-Z]{1,2})?$/;

/**
 * Middleware: Validate and sanitize ticker symbols.
 * Prevents SQL, command, and prompt injection attacks.
 */
export const sanitizeTickerInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const rawSymbol = req.body?.symbol || req.query?.symbol || req.params?.symbol;

  if (rawSymbol !== undefined && rawSymbol !== "") {
    const symbol = String(rawSymbol).trim().toUpperCase();

    if (!VALID_TICKER_REGEX.test(symbol)) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Security validation failed: Symbol '${rawSymbol}' contains illegal characters or invalid length.`,
        },
      });
      return;
    }

    // Normalize sanitized symbol back to request
    if (req.body?.symbol) req.body.symbol = symbol;
    if (req.query?.symbol) req.query.symbol = symbol;
    if (req.params?.symbol) req.params.symbol = symbol;
  }

  next();
};

/**
 * Middleware: Validate numeric trading values for risk evaluation.
 * Rejects negative numbers, NaN, Infinity, and anomalous share quantities.
 */
export const validateTradingNumbers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { shares, price, confidence, customEquity, limitPrice } = req.body;

  if (shares !== undefined) {
    const numShares = Number(shares);
    if (!Number.isFinite(numShares) || numShares <= 0 || numShares > 1000000) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Shares must be a positive finite number between 1 and 1,000,000.",
        },
      });
      return;
    }
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0 || numPrice > 5000000) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Price must be a positive finite dollar value.",
        },
      });
      return;
    }
  }

  if (limitPrice !== undefined && limitPrice !== null) {
    const numLimit = Number(limitPrice);
    if (!Number.isFinite(numLimit) || numLimit <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Limit price must be a positive finite dollar value.",
        },
      });
      return;
    }
  }

  if (confidence !== undefined) {
    const numConf = Number(confidence);
    if (!Number.isFinite(numConf) || numConf < 0 || numConf > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Confidence score must be between 0 and 100.",
        },
      });
      return;
    }
  }

  if (customEquity !== undefined) {
    const numEquity = Number(customEquity);
    if (!Number.isFinite(numEquity) || numEquity <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Custom equity must be a positive finite value.",
        },
      });
      return;
    }
  }

  next();
};

/**
 * Rate Limiter: General API endpoints (300 requests per minute per IP)
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP. Please wait before retrying.",
    },
  },
});

/**
 * Rate Limiter: Heavy AI Agent Cycle & Analysis endpoints (60 requests per minute)
 */
export const agentAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Agent analysis throughput threshold reached. Please wait a moment.",
    },
  },
});

/**
 * Hardcoded Paper Trading Safeguard Verification:
 * Validates that production/live trade parameters can never be injected.
 */
export function verifyPaperTradingIntegrity(): {
  isPaperMode: boolean;
  guardrailsActive: boolean;
  liveTradingBlocked: boolean;
} {
  const isPaperEnv = process.env.ALPACA_PAPER_TRADE !== "false";
  const baseUrl = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";
  const isPaperUrl = baseUrl.includes("paper");

  if (!isPaperEnv || !isPaperUrl) {
    throw new Error(
      "CRITICAL SECURITY ALERT: Live trading execution attempted! SENTINEL is permanently locked to Paper Trading."
    );
  }

  return {
    isPaperMode: true,
    guardrailsActive: true,
    liveTradingBlocked: true,
  };
}
