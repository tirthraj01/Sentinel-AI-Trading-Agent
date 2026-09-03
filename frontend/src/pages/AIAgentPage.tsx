import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Sparkles,
  Eye,
  BrainCircuit,
  Lightbulb,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react";
import { SentinelMascot } from "../components/SentinelMascot";
import { AIDecisionCard } from "../components/AIDecisionCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useAgentDecisions } from "../hooks/useAgentDecisions";

export const AIAgentPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [decisionFilter, setDecisionFilter] = useState<string>("ALL");
  const { decisions, loading, refetch } = useAgentDecisions();

  const filteredDecisions = decisions.filter((dec) => {
    if (decisionFilter === "ALL") return true;
    if (decisionFilter === "APPROVED") return dec.status === "APPROVED_EXECUTED";
    if (decisionFilter === "BLOCKED") return dec.status === "BLOCKED_BY_RISK";
    return dec.decision === decisionFilter;
  });

  const pipelineSteps = [
    {
      id: "obs",
      name: "OBSERVE",
      icon: Eye,
      statusLabel: "✓ Ingesting",
      desc: "Quotes, order books & news sentiment",
      color: "text-cyan-400",
      border: "border-cyan-500/40",
      bg: "bg-cyan-500/10",
    },
    {
      id: "ana",
      name: "ANALYZE",
      icon: BrainCircuit,
      statusLabel: "✓ Active",
      desc: "Technical momentum & multi-signal synthesis",
      color: "text-indigo-400",
      border: "border-indigo-500/40",
      bg: "bg-indigo-500/10",
    },
    {
      id: "dec",
      name: "DECIDE",
      icon: Lightbulb,
      statusLabel: "✓ Synthesizing",
      desc: "Hypothesis proposal & confidence scoring",
      color: "text-purple-400",
      border: "border-purple-500/40",
      bg: "bg-purple-500/10",
    },
    {
      id: "risk",
      name: "RISK CHECK",
      icon: ShieldCheck,
      statusLabel: "● Enforcing",
      desc: "Deterministic mathematical rule guard",
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
    },
    {
      id: "exe",
      name: "EXECUTE",
      icon: Send,
      statusLabel: "○ Guarded",
      desc: "Alpaca Paper Trading (Only if approved)",
      color: "text-amber-400",
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
    },
    {
      id: "res",
      name: "RESULT",
      icon: CheckCircle2,
      statusLabel: "✓ Audited",
      desc: "PostgreSQL immutable decision trail",
      color: "text-slate-300",
      border: "border-slate-500/40",
      bg: "bg-slate-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <SentinelMascot size="md" state="analyzing" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI Trading Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Explainable market reasoning memos, multi-signal synthesis & trade proposals
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh decisions"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => onOpenAnalysis("NVDA")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Agent Cycle</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Agent Pipeline */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Agent Decision & Execution Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic separation: The AI proposes, the Risk Engine holds absolute veto authority
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Live State Machine
          </span>
        </div>

        {/* Pipeline Nodes Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border ${step.border} ${step.bg} flex flex-col justify-between space-y-3 relative group transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
                      {step.name}
                    </span>
                    <Icon className={`h-4 w-4 ${step.color}`} />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${step.color}`}>
                    {step.statusLabel}
                  </span>
                  {step.id === "risk" && (
                    <span title="Deterministic Veto Lock">
                      <Lock className="h-3 w-3 text-emerald-400" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Compliance Disclaimer Banner */}
      <div className="rounded-2xl bg-[#0E1015] border border-white/10 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">AI-Generated Financial Analysis Disclaimer: </strong>
          All recommendations are synthetic inferences generated by Large Language Models for paper simulation. The AI does not guarantee market returns. Execution only occurs after mathematical risk validation.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "APPROVED", "BLOCKED", "BUY", "HOLD", "SELL"].map((f) => (
          <button
            key={f}
            onClick={() => setDecisionFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              decisionFilter === f
                ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/25"
                : "bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Decision Cards List */}
      {loading && decisions.length === 0 ? (
        <LoadingSkeleton type="card" />
      ) : (
        <div className="space-y-6">
          {filteredDecisions.map((dec) => (
            <AIDecisionCard
              key={dec.id}
              decision={dec}
              onInspectDetails={() => onOpenAnalysis(dec.symbol)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
