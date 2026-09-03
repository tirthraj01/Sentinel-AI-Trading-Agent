import React, { useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  Clock,
  ChevronDown,
} from "lucide-react";
import { AgentDecision } from "../types";
import { Badge } from "./Badge";
import { DecisionWaterfall } from "./DecisionWaterfall";

interface AIDecisionCardProps {
  decision: AgentDecision;
  onInspectDetails?: (decision: AgentDecision) => void;
}

export const AIDecisionCard: React.FC<AIDecisionCardProps> = ({
  decision,
  onInspectDetails,
}) => {
  const [showWaterfall, setShowWaterfall] = useState(false);
  const isApproved = decision.status === "APPROVED_EXECUTED";
  const isBlocked = decision.status === "BLOCKED_BY_RISK";

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
      {/* Decorative gradient glow behind AI header */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Card Header: AI Identity & Symbol */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                {decision.symbol}
              </span>
              <Badge
                variant={
                  decision.decision === "BUY"
                    ? "buy"
                    : decision.decision === "SELL"
                    ? "sell"
                    : "hold"
                }
              >
                {decision.decision}
              </Badge>
              {isApproved && (
                <Badge variant="approved">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Approved</span>
                </Badge>
              )}
              {isBlocked && (
                <Badge variant="blocked">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Blocked by Risk</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              AI Market Memo • Run ID: <span className="font-mono text-slate-300">{decision.runId}</span>
            </p>
          </div>
        </div>

        {/* Confidence Gauge Badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
            AI Conviction
          </span>
          <span
            className={`text-xl font-black tracking-tight font-tabular ${
              decision.confidence >= 80
                ? "text-emerald-400"
                : decision.confidence >= 70
                ? "text-indigo-400"
                : "text-amber-400"
            }`}
          >
            {decision.confidence}%
          </span>
        </div>
      </div>

      {/* AI Reasoning Narrative Body */}
      <div className="space-y-3 mb-5">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5">
          "{decision.reasoning}"
        </p>

        {/* Metrics Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Suggested Size
            </span>
            <span className="font-bold text-white font-tabular">
              {decision.suggestedShares} Shares
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Target Alloc
            </span>
            <span className="font-bold text-white font-tabular">
              {decision.suggestedAllocationPct}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Trend Signal
            </span>
            <span className="font-bold text-indigo-400 font-mono">
              {decision.marketSummary.trend}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Risk Profile
            </span>
            <span
              className={`font-bold uppercase ${
                decision.riskAssessment === "LOW"
                  ? "text-emerald-400"
                  : decision.riskAssessment === "MEDIUM"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {decision.riskAssessment}
            </span>
          </div>
        </div>
      </div>

      {/* News Catalyst Snippet */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Newspaper className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="font-semibold text-slate-300">
              Catalyst: {decision.newsSentiment.source}
            </span>
            <span
              className={`font-tabular font-bold ${
                decision.newsSentiment.score > 0
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {decision.newsSentiment.score > 0 ? "+" : ""}
              {(decision.newsSentiment.score * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {decision.newsSentiment.headline}
          </p>
        </div>
      </div>

      {/* Risk Engine Status Banner */}
      {isApproved && (
        <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300">
              Approved by Deterministic Risk Engine. Paper order placed on Alpaca.
            </span>
          </div>
          {decision.alpacaOrderId && (
            <span className="text-[11px] font-mono text-emerald-400/80">
              {decision.alpacaOrderId}
            </span>
          )}
        </div>
      )}

      {isBlocked && decision.riskResult && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-xs font-semibold text-rose-300">
              Vetoed by Deterministic Risk Engine
            </span>
          </div>
          <ul className="text-[11px] text-rose-200/90 list-disc list-inside space-y-0.5 ml-1">
            {decision.riskResult.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Footer Details button */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(decision.createdAt).toLocaleTimeString()}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWaterfall(!showWaterfall)}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            <span>{showWaterfall ? "Hide Waterfall" : "View Waterfall"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showWaterfall ? "rotate-180" : ""
              }`}
            />
          </button>

          {onInspectDetails && (
            <button
              onClick={() => onInspectDetails(decision)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Sandbox</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Inline Decision Waterfall */}
      {showWaterfall && (
        <div className="mt-5 pt-5 border-t border-white/10 animate-fade-in">
          <DecisionWaterfall decision={decision} />
        </div>
      )}
    </div>
  );
};
