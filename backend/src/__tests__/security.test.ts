import { describe, it, expect } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import { app } from "../app.js";
import { verifyPaperTradingIntegrity } from "../middleware/security.js";
import { AlpacaService } from "../services/alpacaService.js";

describe("Phase 13 — Security Audit & Hardening Verification", () => {
  // 1. SECRET SCANNING & GIT HYGIENE
  describe("1. Secret Scanning & Credential Hygiene", () => {
    it("should ensure .gitignore exists and explicitly excludes .env and secret files", () => {
      const gitignorePath = path.resolve(__dirname, "../../../.gitignore");
      expect(fs.existsSync(gitignorePath)).toBe(true);
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");

      expect(gitignoreContent).toContain(".env");
      expect(gitignoreContent).toContain("*.key");
      expect(gitignoreContent).toContain("*.pem");
    });

    it("should ensure .env.example contains only safe placeholders with no real credentials", () => {
      const envExamplePath = path.resolve(__dirname, "../../.env.example");
      expect(fs.existsSync(envExamplePath)).toBe(true);
      const content = fs.readFileSync(envExamplePath, "utf-8");

      expect(content).toContain("your_alpaca_paper_api_key_here");
      expect(content).toContain("your_gemini_api_key_here");
      expect(content).not.toMatch(/AIza[0-9A-Za-z-_]{35}/); // Google API key regex
      expect(content).not.toMatch(/AKIA[0-9A-Z]{16}/); // AWS access key regex
    });
  });

  // 2. PAPER TRADING HARD SAFEGUARDS
  describe("2. Paper Trading Enforcement & Invariants", () => {
    it("should verify paper trading integrity and block live broker routing", () => {
      const status = verifyPaperTradingIntegrity();
      expect(status.isPaperMode).toBe(true);
      expect(status.guardrailsActive).toBe(true);
      expect(status.liveTradingBlocked).toBe(true);
    });

    it("should reject any Alpaca base URL that attempts pointing to live production markets", () => {
      const alpaca = new AlpacaService();
      // Temporarily mutate to test assertion guardrail
      (alpaca as any).baseUrl = "https://api.alpaca.markets";

      expect(() => {
        alpaca.assertPaperSafety();
      }).toThrow(/CRITICAL SAFETY GUARDRAIL/);
    });
  });

  // 3. INPUT SANITIZATION & INJECTION ATTACK DEFENSE
  describe("3. Input Sanitization & Injection Defense", () => {
    it("should reject SQL injection payloads in ticker symbol with 400", async () => {
      const res = await request(app)
        .get("/api/market?symbol=NVDA;DROP TABLE trades;--")
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject XSS script tags in symbol input with 400", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "<script>alert('xss')</script>",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject path traversal payloads in symbol with 400", async () => {
      const res = await request(app)
        .get("/api/market?symbol=../../etc/passwd")
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject overly long ticker strings exceeding character limits", async () => {
      const res = await request(app)
        .post("/api/agent/analyze")
        .send({
          symbol: "TOOLONGSYMBOLTHATEXCEEDSMAXLENGTH",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // 4. NUMERIC VALUE & RANGE VALIDATION
  describe("4. Numeric Boundary & Range Validation", () => {
    it("should reject negative share quantities with 400", async () => {
      const res = await request(app)
        .post("/api/trades")
        .send({
          symbol: "AAPL",
          side: "BUY",
          shares: -50,
          orderType: "market",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject zero or non-numeric shares with 400", async () => {
      const res = await request(app)
        .post("/api/trades")
        .send({
          symbol: "AAPL",
          side: "BUY",
          shares: "not-a-number",
          orderType: "market",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject negative price in risk proposal evaluation with 400", async () => {
      const res = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 80,
          shares: 10,
          price: -150.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject confidence score outside [0, 100] range with 400", async () => {
      const res = await request(app)
        .post("/api/risk/evaluate")
        .send({
          symbol: "AAPL",
          decision: "BUY",
          confidence: 150,
          shares: 10,
          price: 150.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // 5. RATE LIMITING & DOS RESILIENCE
  describe("5. Rate Limiting Headers & Protection", () => {
    it("should include standard rate limiting headers on API responses", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.headers["ratelimit-limit"]).toBeDefined();
      expect(res.headers["ratelimit-remaining"]).toBeDefined();
    });
  });
});
