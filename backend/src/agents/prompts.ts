export const SENTINEL_SYSTEM_PROMPT = `
You are SENTINEL, an explainable, risk-aware autonomous AI trading agent built for the Alpaca Paper Trading platform.

### CORE PRINCIPLES:
1. Capital preservation precedes profit maximization.
2. The AI generates trade hypotheses, but deterministic mathematical risk rules hold ultimate veto power.
3. Every recommendation must be transparent, justified, and explainable in plain financial terms.
4. Always specify exact confidence percentages (0 to 100) reflecting analytical conviction.
5. Suggested allocations must respect portfolio risk constraints (single trade allocation <= 5.0%, single position limit <= 10.0%).

### YOUR OBJECTIVES:
- Ingest technical price action, volume profiles, and macroeconomic sentiment.
- Identify support/resistance key levels.
- Provide a clear catalyst analysis.
- Issue an unambiguous action: "BUY", "SELL", or "HOLD".
- Provide structured JSON adhering strictly to the requested schema.
`.trim();

export interface PromptMarketContext {
  symbol: string;
  name: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  volume: string;
  high: number;
  low: number;
  sector: string;
  newsHeadline?: string;
  newsSentiment?: number;
  portfolioEquity: number;
  availableCash: number;
  existingPositionShares?: number;
  existingPositionWeight?: number;
}

export function buildMarketAnalysisPrompt(context: PromptMarketContext): string {
  return `
Analyze the following asset and portfolio state to produce a structured trading decision memo:

### ASSET TELEMETRY:
- Symbol: ${context.symbol} (${context.name})
- Current Price: $${context.currentPrice.toFixed(2)}
- 24h Price Change: ${context.dailyChange >= 0 ? "+" : ""}$${context.dailyChange.toFixed(2)} (${context.dailyChangePercent >= 0 ? "+" : ""}${context.dailyChangePercent.toFixed(2)}%)
- Session High / Low: $${context.high.toFixed(2)} / $${context.low.toFixed(2)}
- 24h Volume: ${context.volume}
- Sector: ${context.sector}
- Recent News Catalyst: "${context.newsHeadline || "General market momentum"}"
- News Sentiment Score: ${context.newsSentiment !== undefined ? context.newsSentiment.toFixed(2) : "0.50"} (0.0=Extreme Bearish, 1.0=Extreme Bullish)

### PORTFOLIO STATE:
- Total Equity: $${context.portfolioEquity.toFixed(2)}
- Available Liquid Cash: $${context.availableCash.toFixed(2)}
- Existing Shares Owned: ${context.existingPositionShares || 0}
- Current Portfolio Weight: ${context.existingPositionWeight ? context.existingPositionWeight.toFixed(2) : "0.00"}% (Risk ceiling is 10.0%)

### REQUIRED JSON OUTPUT STRUCTURE:
Respond ONLY with a valid JSON object with NO markdown formatting, backticks, or preamble:
{
  "marketTrend": "BULLISH" | "BEARISH" | "SIDEWAYS",
  "keyLevels": {
    "support": <number>,
    "resistance": <number>
  },
  "catalystAnalysis": "<detailed 1-2 sentence assessment of catalysts and macro environment>",
  "newsSentimentScore": <number between 0.0 and 1.0>,
  "tradeRecommendation": {
    "action": "BUY" | "SELL" | "HOLD",
    "confidence": <number between 0 and 100>,
    "reasoning": "<concise, professional financial explanation of the trade rationale>",
    "suggestedAllocationPct": <number between 0.0 and 5.0>,
    "suggestedShares": <integer number of shares to trade>
  }
}
`.trim();
}
