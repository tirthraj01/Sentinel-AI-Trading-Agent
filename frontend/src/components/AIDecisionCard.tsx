import React from "react";
import { Sparkles, ArrowUpRight, ShieldCheck, ShieldAlert, Newspaper, TrendingUp, Clock } from "lucide-react";
import { AgentDecision } from "../types";
import { Badge } from "./Badge";

interface AIDecisionCardProps {
  decision: AgentDecision;
  onInspectDetails?: (decision: AgentDecision) => void;
}

export const AIDecisionCard: React.FC<AIDecisionCardProps> = ({
  decision,
  onInspectDetails,
}) => {
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

        {/* Confidence Gauge */}
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
            AI Conviction
          </span>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  decision.confidence >= 75
                    ? "bg-emerald-400"
                    : decision.confidence >= 65
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
                style={{ width: `${decision.confidence}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white font-tabular">
              {decision.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Rationale Memo */}
      <div className="rounded-2xl bg-[#0E1015] border border-white/5 p-4 mb-5">
        <p className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
          <span>Investment Hypothesis</span>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          {decision.reasoning}
        </p>
      </div>

      {/* Market Signals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Technical Trend */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>Technical Trend</span>
            </span>
            <span className="font-semibold text-white">
              {decision.marketSummary.trend}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {decision.marketSummary.volumeAnalysis}
          </p>
        </div>

        {/* News Sentiment */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Newspaper className="h-3.5 w-3.5 text-cyan-400" />
              <span>News Sentiment</span>
            </span>
            <span
              className={`font-semibold ${
                decision.newsSentiment.score >= 0.5
                  ? "text-emerald-400"
                  : decision.newsSentiment.score <= -0.2
                  ? "text-rose-400"
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
      {onInspectDetails && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(decision.createdAt).toLocaleTimeString()}
          </span>
          <button
            onClick={() => onInspectDetails(decision)}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            <span>Inspect Full Audit Trace</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
