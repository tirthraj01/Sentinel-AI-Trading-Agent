import { z } from "zod";

export const LLMAnalysisOutputSchema = z.object({
  marketTrend: z.enum(["BULLISH", "BEARISH", "SIDEWAYS"], {
    errorMap: () => ({ message: "marketTrend must be BULLISH, BEARISH, or SIDEWAYS" }),
  }),
  keyLevels: z.object({
    support: z.number().positive("Support level must be positive"),
    resistance: z.number().positive("Resistance level must be positive"),
  }),
  catalystAnalysis: z.string().min(5, "Catalyst analysis must be provided"),
  newsSentimentScore: z
    .number()
    .min(0, "Sentiment score cannot be less than 0")
    .max(1, "Sentiment score cannot exceed 1"),
  tradeRecommendation: z.object({
    action: z.enum(["BUY", "SELL", "HOLD"], {
      errorMap: () => ({ message: "Action must be BUY, SELL, or HOLD" }),
    }),
    confidence: z
      .number()
      .min(0, "Confidence must be >= 0")
      .max(100, "Confidence must be <= 100"),
    reasoning: z.string().min(10, "Reasoning must provide meaningful context"),
    suggestedAllocationPct: z
      .number()
      .min(0, "Allocation percentage cannot be negative")
      .max(100, "Allocation percentage cannot exceed 100"),
    suggestedShares: z
      .number()
      .int("Shares must be an integer")
      .min(0, "Shares cannot be negative"),
  }),
});

export type LLMAnalysisOutput = z.infer<typeof LLMAnalysisOutputSchema>;
