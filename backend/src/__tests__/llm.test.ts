import { describe, it, expect } from "vitest";
import { llmService } from "../services/llmService.js";
import { LLMAnalysisOutputSchema } from "../schemas/llmSchema.js";
import { PromptMarketContext } from "../agents/prompts.js";

describe("LLM Service & Structured Reasoning (Phase 5)", () => {
  const mockNvdaContext: PromptMarketContext = {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    currentPrice: 128.9,
    dailyChange: 4.15,
    dailyChangePercent: 3.33,
    volume: "65.4M",
    high: 130.2,
    low: 125.4,
    sector: "Semiconductors",
    newsHeadline: "Hyperscalers expand generative AI datacenter capital expenditure targets",
    newsSentiment: 0.82,
    portfolioEquity: 104850.25,
    availableCash: 42120.8,
    existingPositionShares: 65,
    existingPositionWeight: 7.99,
  };

  const mockAaplContext: PromptMarketContext = {
    symbol: "AAPL",
    name: "Apple Inc.",
    currentPrice: 228.65,
    dailyChange: 2.45,
    dailyChangePercent: 1.08,
    volume: "48.2M",
    high: 229.4,
    low: 226.1,
    sector: "Technology",
    newsHeadline: "Services division revenue growth offsets seasonal hardware cycle lull",
    newsSentiment: 0.65,
    portfolioEquity: 104850.25,
    availableCash: 42120.8,
    existingPositionShares: 40,
    existingPositionWeight: 8.72,
  };

  describe("Analysis Generation for NVDA", () => {
    it("should generate a structured analysis memo for NVDA", async () => {
      const result = await llmService.analyzeAsset(mockNvdaContext);

      expect(result).toBeDefined();
      expect(result.tradeRecommendation.action).toBe("BUY");
      expect(result.marketTrend).toBe("BULLISH");
      expect(result.catalystAnalysis.length).toBeGreaterThan(10);
      expect(result.keyLevels.support).toBeLessThan(mockNvdaContext.currentPrice);
      expect(result.keyLevels.resistance).toBeGreaterThan(mockNvdaContext.currentPrice);
    });
  });

  describe("Analysis Generation for AAPL", () => {
    it("should generate a risk-aware analysis memo for AAPL (respecting concentration limits)", async () => {
      const result = await llmService.analyzeAsset(mockAaplContext);

      expect(result).toBeDefined();
      expect(result.tradeRecommendation.action).toBe("HOLD");
      expect(result.tradeRecommendation.reasoning).toContain("8.72%");
      expect(result.tradeRecommendation.suggestedAllocationPct).toBe(0);
    });
  });

  describe("Schema Compliance & Validation", () => {
    it("should strictly validate against LLMAnalysisOutputSchema for NVDA", async () => {
      const result = await llmService.analyzeAsset(mockNvdaContext);
      const parsed = LLMAnalysisOutputSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it("should strictly validate against LLMAnalysisOutputSchema for AAPL", async () => {
      const result = await llmService.analyzeAsset(mockAaplContext);
      const parsed = LLMAnalysisOutputSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it("should reject invalid schema outputs", () => {
      const invalidPayload = {
        marketTrend: "SUPER_MOON", // Invalid enum
        keyLevels: { support: -10, resistance: 0 },
        catalystAnalysis: "",
        newsSentimentScore: 2.5, // Out of 0-1 bounds
        tradeRecommendation: {
          action: "YOLO", // Invalid action
          confidence: 150, // Out of 100 bounds
          reasoning: "none",
          suggestedAllocationPct: -5,
          suggestedShares: -1,
        },
      };

      const parsed = LLMAnalysisOutputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.errors.length).toBeGreaterThan(3);
      }
    });
  });

  describe("Confidence Score Format Verification", () => {
    it("confidence score must be a number between 0 and 100", async () => {
      const nvdaResult = await llmService.analyzeAsset(mockNvdaContext);
      const aaplResult = await llmService.analyzeAsset(mockAaplContext);

      expect(typeof nvdaResult.tradeRecommendation.confidence).toBe("number");
      expect(nvdaResult.tradeRecommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(nvdaResult.tradeRecommendation.confidence).toBeLessThanOrEqual(100);

      expect(typeof aaplResult.tradeRecommendation.confidence).toBe("number");
      expect(aaplResult.tradeRecommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(aaplResult.tradeRecommendation.confidence).toBeLessThanOrEqual(100);
    });
  });
});
