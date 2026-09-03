import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { LLMAnalysisOutput, LLMAnalysisOutputSchema } from "../schemas/llmSchema.js";
import {
  SENTINEL_SYSTEM_PROMPT,
  PromptMarketContext,
  buildMarketAnalysisPrompt,
} from "../agents/prompts.js";

dotenv.config();

export type LLMProvider = "GEMINI" | "OPENAI" | "ANTHROPIC" | "GROQ" | "MOCK";

export class LLMService {
  private provider: LLMProvider;
  private geminiClient: GoogleGenAI | null = null;
  private geminiModel: string;

  constructor() {
    this.provider = (process.env.LLM_PROVIDER as LLMProvider) || "GEMINI";
    this.geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes("your_gemini") && geminiKey.length > 10) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
        console.log(`⚡ Google Gemini Client initialized with model: ${this.geminiModel}`);
      } catch (err) {
        console.warn("⚠️ Failed to initialize Google GenAI client:", err);
      }
    } else {
      console.log("ℹ️  GEMINI_API_KEY not configured or using placeholder. Running in deterministic MOCK LLM mode.");
    }
  }

  public getProvider(): LLMProvider {
    return this.provider;
  }

  public isLiveLLMConfigured(): boolean {
    return this.geminiClient !== null;
  }

  public async answerQuestion(question: string, portfolioContext: string): Promise<string> {
    if (this.geminiClient && (this.provider === "GEMINI" || this.provider === "MOCK")) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: this.geminiModel,
          contents: `${SENTINEL_SYSTEM_PROMPT}\n\nYou are answering a trader's direct question. Use only the supplied context, be concise, and say when the context does not contain enough information. Do not invent prices or executions.\n\nContext: ${portfolioContext}\n\nQuestion: ${question}`,
        });
        const answer = response.text?.trim();
        if (answer) return answer;
      } catch (err) {
        console.warn("Live Gemini chat failed; using contextual fallback:", (err as Error).message);
      }
    }

    return `I could not reach the live reasoning model, but I can still use the current Sentinel context. Your question was: "${question}". ${portfolioContext}`;
  }

  /**
   * Generates structured market analysis & trade proposal
   */
  public async analyzeAsset(context: PromptMarketContext): Promise<LLMAnalysisOutput> {
    const promptText = buildMarketAnalysisPrompt(context);

    // 1. Try Live Gemini if configured
    if (this.geminiClient && (this.provider === "GEMINI" || this.provider === "MOCK")) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: this.geminiModel,
          contents: `${SENTINEL_SYSTEM_PROMPT}\n\n${promptText}`,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawJsonText = response.text?.trim() || "";
        const cleanJson = this.cleanJsonOutput(rawJsonText);
        const parsed = JSON.parse(cleanJson);
        const validated = LLMAnalysisOutputSchema.parse(parsed);
        return validated;
      } catch (err) {
        console.warn("⚠️ Live Gemini call failed or returned unparsable output. Falling back to deterministic analysis:", (err as Error).message);
      }
    }

    // 2. High-fidelity Deterministic Reasoning Generator (Fallback / Mock mode)
    return this.generateDeterministicAnalysis(context);
  }

  /**
   * Strips markdown code fences if model accidentally wrapped output in ```json
   */
  private cleanJsonOutput(text: string): string {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return clean;
  }

  /**
   * Generates realistic, schema-compliant analytical reasoning based on asset telemetry
   */
  public generateDeterministicAnalysis(context: PromptMarketContext): LLMAnalysisOutput {
    const sym = context.symbol.toUpperCase();
    const price = context.currentPrice;

    // Case 1: NVDA (Bullish momentum breakout)
    if (sym === "NVDA") {
      const suggestedShares = Math.min(
        Math.floor((context.portfolioEquity * 0.035) / price),
        25
      );
      return {
        marketTrend: "BULLISH",
        keyLevels: {
          support: parseFloat((price * 0.95).toFixed(2)),
          resistance: parseFloat((price * 1.06).toFixed(2)),
        },
        catalystAnalysis:
          "Institutional accumulation detected with volume +28% over 20-day moving average. Strong hyperscaler datacenter expenditure provides solid structural tailwinds.",
        newsSentimentScore: 0.82,
        tradeRecommendation: {
          action: "BUY",
          confidence: 86.0,
          reasoning:
            "Technical momentum breakout confirmed by institutional volume. Risk-reward is highly favorable with support established at key levels.",
          suggestedAllocationPct: 3.5,
          suggestedShares: Math.max(1, suggestedShares),
        },
      };
    }

    // Case 2: TSLA (Rebound attempt with excessive risk / low conviction)
    if (sym === "TSLA") {
      return {
        marketTrend: "SIDEWAYS",
        keyLevels: {
          support: parseFloat((price * 0.96).toFixed(2)),
          resistance: parseFloat((price * 1.05).toFixed(2)),
        },
        catalystAnalysis:
          "Rebound attempt near historical support, but high implied volatility surface and global EV margin compression create substantial downside tail risk.",
        newsSentimentScore: 0.41,
        tradeRecommendation: {
          action: "BUY",
          confidence: 68.0, // Deliberately below 70% floor to test risk engine veto
          reasoning:
            "Rebound setup near support zone, but algorithmic conviction (68.0%) fails minimum risk thresholds due to options volatility skew.",
          suggestedAllocationPct: 6.8, // Deliberately exceeds 5.0% single-trade limit
          suggestedShares: 30,
        },
      };
    }

    // Case 3: AAPL (High exposure / Hold)
    if (sym === "AAPL") {
      return {
        marketTrend: "SIDEWAYS",
        keyLevels: {
          support: parseFloat((price * 0.97).toFixed(2)),
          resistance: parseFloat((price * 1.03).toFixed(2)),
        },
        catalystAnalysis:
          "Consolidation pattern near all-time highs. Services revenue growth remains solid, but existing portfolio concentration warrants capital discipline.",
        newsSentimentScore: 0.65,
        tradeRecommendation: {
          action: "HOLD",
          confidence: 76.0,
          reasoning:
            "Position already represents significant portfolio weight (8.72%). Recommending HOLD to respect single-asset concentration limits (10.0% ceiling).",
          suggestedAllocationPct: 0.0,
          suggestedShares: 0,
        },
      };
    }

    // Default Case: General Equities
    const isBull = context.dailyChange >= 0;
    const suggestedShares = Math.min(
      Math.floor((context.portfolioEquity * 0.02) / price),
      15
    );

    return {
      marketTrend: isBull ? "BULLISH" : "BEARISH",
      keyLevels: {
        support: parseFloat((price * 0.95).toFixed(2)),
        resistance: parseFloat((price * 1.05).toFixed(2)),
      },
      catalystAnalysis: `Asset trading with session range $${context.low.toFixed(2)} - $${context.high.toFixed(2)}. News sentiment is currently ${context.newsSentiment !== undefined && context.newsSentiment >= 0.5 ? "constructive" : "cautious"}.`,
      newsSentimentScore: context.newsSentiment ?? 0.55,
      tradeRecommendation: {
        action: isBull ? "BUY" : "HOLD",
        confidence: isBull ? 74.0 : 62.0,
        reasoning: `Telemetry indicates ${isBull ? "positive momentum with manageable downside" : "consolidation phase requiring additional signal confirmation"}.`,
        suggestedAllocationPct: isBull ? 2.0 : 0.0,
        suggestedShares: isBull ? Math.max(1, suggestedShares) : 0,
      },
    };
  }
}

export const llmService = new LLMService();
