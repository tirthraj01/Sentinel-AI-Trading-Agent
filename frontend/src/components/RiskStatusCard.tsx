import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { RiskEvaluation, RiskRuleConfig } from "../types";
import { Badge } from "./Badge";

interface RiskStatusCardProps {
  evaluation?: RiskEvaluation;
  rules?: RiskRuleConfig[];
}

export const RiskStatusCard: React.FC<RiskStatusCardProps> = ({
  evaluation,
  rules,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                Risk Engine Guard
              </span>
              <Badge variant={evaluation?.approved !== false ? "approved" : "blocked"}>
                {evaluation?.approved !== false ? "ARMED & SAFE" : "BLOCKED BREACH"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic Mathematical Rules • Non-LLM Veto
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
            System Risk
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {evaluation?.riskLevel || "LOW"}
          </span>
        </div>
      </div>

      {/* Rules Evaluation List */}
      <div className="space-y-2.5 mb-5">
        {(evaluation?.checks || []).map((check, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              check.passed
                ? "bg-white/[0.02] border-white/5 text-slate-300"
                : "bg-rose-950/20 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{check.label}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-tabular">
              <span className="text-slate-400">Limit: {check.threshold}</span>
              <span
                className={`font-semibold ${
                  check.passed ? "text-slate-200" : "text-rose-400 font-bold"
                }`}
              >
                Actual: {check.actual}
              </span>
            </div>
          </div>
        ))}

        {!evaluation?.checks && rules && (
          <div className="space-y-2">
            {rules.slice(0, 4).map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{rule.name}</span>
                </div>
                <div className="text-[11px] font-tabular text-slate-400">
                  <span>
                    Current: <strong className="text-white">{rule.currentValue}{rule.unit}</strong> / Max {rule.limit}{rule.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reassurance banner */}
      <div className="rounded-xl bg-[#0E1015] border border-white/5 p-3 flex items-center gap-2.5 text-[11px] text-slate-400">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          If an AI recommendation violates any risk check, the trade is blocked instantly with zero broker execution.
        </span>
      </div>
    </div>
  );
};
