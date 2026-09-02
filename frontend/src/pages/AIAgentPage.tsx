import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import { AIDecisionCard } from "../components/AIDecisionCard";
import { MOCK_DECISIONS } from "../data/mockData";

export const AIAgentPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [decisionFilter, setDecisionFilter] = useState<string>("ALL");

  const filteredDecisions = MOCK_DECISIONS.filter((dec) => {
    if (decisionFilter === "ALL") return true;
    if (decisionFilter === "APPROVED") return dec.status === "APPROVED_EXECUTED";
    if (decisionFilter === "BLOCKED") return dec.status === "BLOCKED_BY_RISK";
    return dec.decision === decisionFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Trading Intelligence
              </h1>
              <p className="text-xs text-slate-400">
                Explainable market reasoning memos, multi-signal synthesis & trade proposals
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenAnalysis("NVDA")}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Trigger New Agent Run</span>
        </button>
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
      <div className="space-y-6">
        {filteredDecisions.map((dec) => (
          <AIDecisionCard
            key={dec.id}
            decision={dec}
            onInspectDetails={() => onOpenAnalysis(dec.symbol)}
          />
        ))}
      </div>
    </div>
  );
};
