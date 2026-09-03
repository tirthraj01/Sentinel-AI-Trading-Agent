import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { generalApiLimiter, verifyPaperTradingIntegrity } from "./middleware/security.js";

dotenv.config();

// Assert strict paper trading integrity on startup
verifyPaperTradingIntegrity();

export const app = express();

// Allowed origins whitelist
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

// CORS Middleware with whitelist origin protection
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, supertest)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error(`CORS policy violation: Origin '${origin}' is not permitted.`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Rate Limiter for all API routes
app.use("/api", generalApiLimiter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Mount API routes
app.use("/api", apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);
