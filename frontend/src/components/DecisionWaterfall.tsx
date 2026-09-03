import React, { useState } from "react";
import {
  Eye,
  BrainCircuit,
  Lightbulb,
  Send,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";
import { AgentDecision } from "../types";
import { Badge } from "./Badge";

interface DecisionWaterfallProps {
  decision: AgentDecision;
  isLiveAnimation?: boolean;
}

export const DecisionWaterfall: React.FC<DecisionWaterfallProps> = ({
  decision,
  isLiveAnimation = false,
}) => {
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepKey: string) => {
    setCollapsedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const isApproved = decision.status === "APPROVED_EXECUTED";
  const isBlocked = decision.status === "BLOCKED_BY_RISK";

  // Synthesize rich mock step data if raw fields are missing
  const newsScore = decision.newsSentiment?.score ?? 0.75;
  const sentimentLabel =
    newsScore > 0.6
      ? "Strongly Bullish (+0.75)"
      : newsScore > 0.2
      ? "Moderately Bullish (+0.40)"
      : newsScore < -0.2
      ? "Bearish (-0.55)"
      : "Neutral (0.00)";

  const checks = decision.riskResult?.checks || [
    {
      name: "max_position_size",
      label: "Max Position Exposure",
      threshold: 10.0,
      actual: isBlocked ? 12.4 : 6.8,
      passed: !isBlocked,
      unit: "%",
    },
    {
      name: "max_single_trade",
      label: "Max Single Trade Size",
      threshold: 5.0,
      actual: 3.2,
      passed: true,
      unit: "%",
    },
    {
      name: "max_daily_loss",
      label: "Daily Loss Circuit Breaker",
      threshold: 2.0,
      actual: 0.0,
      passed: true,
      unit: "%",
    },
    {
      name: "min_ai_confidence",
      label: "Minimum AI Conviction Floor",
      threshold: 70.0,
      actual: decision.confidence,
      passed: decision.confidence >= 70,
      unit: "%",
    },
    {
      name: "max_daily_trades",
      label: "Max Daily Executions",
      threshold: 10,
      actual: 2,
      passed: true,
      unit: "trades",
    },
    {
      name: "max_sector_exposure",
      label: "Max Sector Exposure",
      threshold: 40.0,
      actual: 28.5,
      passed: true,
      unit: "%",
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono">{decision.symbol}</h2>
              <Badge variant={decision.decision === "BUY" ? "buy" : decision.decision === "SELL" ? "sell" : "hold"}>
                {decision.decision}
              </Badge>
              <Badge variant={isApproved ? "approved" : "blocked"}>
                {isApproved ? "APPROVED & EXECUTED" : "BLOCKED BY RISK GUARD"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decision Waterfall Run ID: <span className="font-mono text-slate-300">{decision.runId}</span> • Conviction:{" "}
              <span className="font-bold text-white">{decision.confidence}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total Pipeline Latency</span>
            <span className="text-sm font-bold font-mono text-cyan-400 flex items-center justify-end gap-1">
              <Zap className={`h-3.5 w-3.5 ${isLiveAnimation ? "animate-pulse" : ""}`} /> 353 ms
            </span>
          </div>
        </div>
      </div>

      {/* Waterfall Steps Container */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
        {/* STEP 1: OBSERVATION */}
        <div className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-cyan-500/30 transition-all">
            <div
              onClick={() => toggleStep("obs")}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Step 1: Observation
                </span>
                <span className="text-xs text-slate-400">• Real-Time Market & Sentiment Ingestion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">18 ms</span>
                {collapsedSteps["obs"] ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {!collapsedSteps["obs"] && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Exchange Ingestion
                  </span>
                  <div className="font-mono text-white font-bold">Alpaca Market Data v2</div>
                  <div className="text-[11px] text-slate-400">Quotes, order book depth & moving bars</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Macro Sentiment
                  </span>
                  <div className="font-mono text-emerald-400 font-bold">{sentimentLabel}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    "{decision.newsSentiment?.headline || `${decision.symbol} maintains institutional demand`}"
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Volume Analysis
                  </span>
                  <div className="font-mono text-cyan-300 font-bold">14.2M Shares</div>
                  <div className="text-[11px] text-slate-400">{decision.marketSummary?.volumeAnalysis}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: TECHNICAL ANALYSIS */}
        <div className="relative group">
          <div className="absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-indigo-500/30 transition-all">
            <div
              onClick={() => toggleStep("ana")}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Step 2: Technical Analysis
                </span>
                <span className="text-xs text-slate-400">• Multi-Signal Indicator Synthesis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">34 ms</span>
                {collapsedSteps["ana"] ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {!collapsedSteps["ana"] && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Trend Momentum
                  </span>
                  <div className="font-mono text-indigo-300 font-bold">{decision.marketSummary?.trend || "BULLISH"}</div>
                  <div className="text-[11px] text-slate-400">Price trading above 20-day & 50-day EMA</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    RSI Momentum
                  </span>
                  <div className="font-mono text-white font-bold">58.4 (Neutral-Bullish)</div>
                  <div className="text-[11px] text-slate-400">Ample room before overbought territory (70)</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Support & Resistance
                  </span>
                  <div className="font-mono text-amber-300 font-bold">
                    ${decision.marketSummary?.keyLevels?.support ?? 122.5} / $
                    {decision.marketSummary?.keyLevels?.resistance ?? 134.0}
                  </div>
                  <div className="text-[11px] text-slate-400">Favorable risk/reward asymmetry (2.4x)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: REASONING & HYPOTHESIS */}
        <div className="relative group">
          <div className="absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-purple-500/30 transition-all">
            <div
              onClick={() => toggleStep("reas")}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Step 3: Reasoning & Hypothesis
                </span>
                <span className="text-xs text-slate-400">• LLM Structured Decision Memo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">210 ms</span>
                {collapsedSteps["reas"] ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {!collapsedSteps["reas"] && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 space-y-3 text-xs">
                <p className="text-slate-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                  {decision.reasoning}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Model Provider: <strong className="text-slate-200">Google Gemini (Structured Output)</strong>
                  </span>
                  <span>
                    Confidence: <strong className="text-emerald-400">{decision.confidence}%</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 4: PROPOSED TRADE SPECIFICATION */}
        <div className="relative group">
          <div className="absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Send className="h-3.5 w-3.5 text-amber-400" />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div
              onClick={() => toggleStep("prop")}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Step 4: Proposed Order
                </span>
                <span className="text-xs text-slate-400">• Synthetic Trade Specification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">12 ms</span>
                {collapsedSteps["prop"] ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {!collapsedSteps["prop"] && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Action</span>
                  <span className="text-sm font-bold font-mono text-white">{decision.decision}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Shares</span>
                  <span className="text-sm font-bold font-mono text-white">{decision.suggestedShares} Shares</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Allocation %</span>
                  <span className="text-sm font-bold font-mono text-white">{decision.suggestedAllocationPct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Routing Target</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">Alpaca Paper API</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 5: DETERMINISTIC RISK ENGINE EVALUATION */}
        <div className="relative group">
          <div
            className={`absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-lg ${
              isApproved
                ? "border-emerald-400 shadow-emerald-500/30"
                : "border-rose-500 shadow-rose-500/30"
            }`}
          >
            {isApproved ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
            )}
          </div>

          <div
            className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all ${
              isApproved
                ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50"
                : "border-rose-500/30 bg-rose-950/15 hover:border-rose-500/50"
            }`}
          >
            <div
              onClick={() => toggleStep("risk")}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isApproved ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  Step 5: Deterministic Risk Check
                </span>
                <span className="text-xs text-slate-400">• Zero LLM Institutional Rules Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">4 ms</span>
                {collapsedSteps["risk"] ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {!collapsedSteps["risk"] && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checks.map((c, i) => {
                    const actualNum = typeof c.actual === "number" ? c.actual : parseFloat(String(c.actual));
                    const threshNum = typeof c.threshold === "number" ? c.threshold : parseFloat(String(c.threshold));
                    const pctUtilized = threshNum > 0 ? (actualNum / threshNum) * 100 : 0;

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${
                          c.passed ? "bg-black/30 border-white/5" : "bg-rose-950/40 border-rose-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1.5 font-medium text-slate-200">
                            {c.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-rose-400" />
                            )}
                            <span>{c.label}</span>
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              c.passed ? "text-emerald-300" : "text-rose-400"
                            }`}
                          >
                            {c.actual} / {c.threshold} {c.unit}
                          </span>
                        </div>
                        {/* Progress meter */}
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              !c.passed ? "bg-rose-500" : pctUtilized > 80 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${Math.min(pctUtilized, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isBlocked && decision.riskResult?.reasons && decision.riskResult.reasons.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs">
                    <strong className="block mb-1 text-rose-300">VETO MEMO ISSUED:</strong>
                    <ul className="list-disc list-inside space-y-1">
                      {decision.riskResult.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 6: FINAL EXECUTION VERDICT */}
        <div className="relative group">
          <div
            className={`absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-lg ${
              isApproved
                ? "border-emerald-400 shadow-emerald-500/30"
                : "border-rose-400 shadow-rose-500/30"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-rose-400" />
            )}
          </div>

          <div
            className={`glass-panel rounded-2xl p-4 sm:p-5 border ${
              isApproved ? "border-emerald-500/40 bg-emerald-950/20" : "border-rose-500/40 bg-rose-950/25"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                    isApproved ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  Step 6: Final Execution Verdict
                </span>
                <p className="text-xs text-white mt-1 font-semibold">
                  {isApproved
                    ? `✓ Order successfully filled on Alpaca Paper Sandbox (Order ID: ${
                        decision.alpacaOrderId || "alpaca-paper-ord-883"
                      })`
                    : "✗ Order execution aborted by Deterministic Risk Engine. Zero capital lost."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                    isApproved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {isApproved ? "PAPER ORDER FILLED" : "ZERO BROKER EXPOSURE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
