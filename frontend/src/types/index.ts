export type DecisionType = "BUY" | "SELL" | "HOLD";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type OrderStatus = "submitted" | "filled" | "blocked" | "canceled" | "rejected";

export type TimeframeKey = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export interface ChartPoint {
  time: string;
  value: number;
  benchmark?: number;
}

export interface PortfolioSummary {
  equity: number;
  cash: number;
  buyingPower: number;
  dailyPL: number;
  dailyPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
  portfolioHistory: { time: string; value: number; benchmark?: number }[];
  timeframeData?: Record<TimeframeKey, ChartPoint[]>;
}

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
  side: "long" | "short";
  riskCategory?: "safe" | "watch" | "near_limit";
  high52w?: number;
  low52w?: number;
  dailyChange?: number;
  dailyChangePercent?: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  peRatio?: number;
  marketCap?: string;
  sector: string;
  chartData: { time: string; price: number }[];
}

export interface RiskCheckItem {
  name: string;
  label: string;
  threshold: number | string;
  actual: number | string;
  passed: boolean;
  unit: string;
}

export interface RiskEvaluation {
  approved: boolean;
  riskLevel: RiskLevel;
  reasons: string[];
  checks: RiskCheckItem[];
  evaluatedAt: string;
}

export interface AgentDecision {
  id: string;
  runId: string;
  symbol: string;
  decision: DecisionType;
  confidence: number;
  reasoning: string;
  suggestedAllocationPct: number;
  suggestedShares: number;
  riskAssessment: "LOW" | "MEDIUM" | "HIGH";
  marketSummary: {
    trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
    volumeAnalysis: string;
    keyLevels?: { support: number; resistance: number };
  };
  newsSentiment: {
    score: number; // -1 to 1
    headline: string;
    source: string;
  };
  riskResult?: RiskEvaluation;
  createdAt: string;
  status: "APPROVED_EXECUTED" | "BLOCKED_BY_RISK" | "ANALYSIS_ONLY";
  alpacaOrderId?: string;
}

export interface TradeRecord {
  id: string;
  alpacaOrderId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  shares: number;
  orderType: "market" | "limit";
  estimatedPrice: number;
  executedPrice?: number;
  status: OrderStatus;
  submittedAt: string;
  executedAt?: string;
  decisionId?: string;
  riskReasons?: string[];
}

export interface AgentActivityEvent {
  id: string;
  runId: string;
  timestamp: string;
  stage: "OBSERVE" | "ANALYZE" | "RISK_CHECK" | "EXECUTION" | "COMPLETE" | "BLOCKED";
  title: string;
  message: string;
  status: "success" | "warning" | "error" | "info";
  details?: Record<string, any>;
}

export interface RiskRuleConfig {
  id: string;
  name: string;
  description: string;
  limit: number;
  currentValue: number;
  unit: string;
  isViolation: boolean;
}

export interface AllocationItem {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "sentinel";
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: "analyze" | "navigate" | "filter";
    target: string;
    label: string;
  };
}
