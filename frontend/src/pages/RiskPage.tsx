import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { MOCK_RISK_RULES, MOCK_TRADES } from "../data/mockData";
import { Badge } from "../components/Badge";

export const RiskPage: React.FC = () => {
  const [rules] = useState(MOCK_RISK_RULES);
  const blockedTrades = MOCK_TRADES.filter((t) => t.status === "blocked");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deterministic Risk Engine
            </h1>
            <p className="text-xs text-slate-400">
              Isolated mathematical guardrails with absolute veto power over AI recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Deterministic Invariant: AI Cannot Bypass This Layer
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every proposal emitted by the LLM is passed through this standalone mathematical module. If any threshold is breached, the proposal is blocked immediately. Alpaca paper trading is never called, and the breach is recorded to the audit log.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => {
          const percentUsed =
            rule.unit === "%" ? (rule.currentValue / rule.limit) * 100 : (rule.currentValue / rule.limit) * 100;
          const isWarning = percentUsed > 80;

          return (
            <div
              key={rule.id}
              className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {rule.name}
                  </h4>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  <Lock className="h-3 w-3 text-slate-500" /> Hard Rule
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {rule.description}
              </p>

              {/* Progress meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-tabular">
                  <span className="text-slate-400">Current Value:</span>
                  <span className={`font-bold ${isWarning ? "text-amber-400" : "text-white"}`}>
                    {rule.currentValue}{rule.unit} / Max {rule.limit}{rule.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWarning ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block text-right">
                  {percentUsed.toFixed(1)}% of ceiling utilized
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Blocked Trades Audit Section */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Blocked Trade Log (Risk Veto History)
            </h3>
          </div>
          <span className="text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            {blockedTrades.length} Trades Intercepted
          </span>
        </div>

        <div className="space-y-3">
          {blockedTrades.map((bt) => (
            <div
              key={bt.id}
              className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-white text-sm">
                    {bt.symbol}
                  </span>
                  <span className="text-xs uppercase font-bold text-rose-400">
                    {bt.side} {bt.shares} Shares
                  </span>
                  <Badge variant="blocked" size="sm">
                    VETOED
                  </Badge>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Reason: {bt.riskReasons?.join(" • ") || "Exceeded mathematical constraint thresholds."}
                </p>
              </div>

              <div className="text-right sm:shrink-0">
                <span className="text-[11px] text-slate-400 font-mono block">
                  {new Date(bt.submittedAt).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Zero Broker Exposure
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
