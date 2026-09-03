import React, { useState } from "react";
import { Workflow, Radio } from "lucide-react";
import { AgentTimeline } from "../components/AgentTimeline";
import { DecisionWaterfall } from "../components/DecisionWaterfall";
import { useAgentStream } from "../hooks/useAgentStream";
import { useAgentDecisions } from "../hooks/useAgentDecisions";

export const AgentActivityPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "BLOCKED">("ALL");
  const [selectedDecisionIndex, setSelectedDecisionIndex] = useState<number>(0);

  const { activities, connected } = useAgentStream(50);
  const { decisions } = useAgentDecisions();

  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter === "APPROVED") return d.status === "APPROVED_EXECUTED";
    if (statusFilter === "BLOCKED") return d.status === "BLOCKED_BY_RISK";
    return true;
  });

  const activeDecision = filteredDecisions[selectedDecisionIndex] || filteredDecisions[0] || decisions[0];

  const filteredActivities = activities.filter((act) => {
    if (selectedStage === "ALL") return true;
    return act.stage === selectedStage;
  });

  const stages = ["ALL", "OBSERVE", "ANALYZE", "DECIDE", "RISK_CHECK", "BLOCKED", "EXECUTION", "COMPLETE"];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Agent Transparency & Decision Waterfall
                </h1>
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    connected
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-800 border-white/10 text-slate-400"
                  }`}
                >
                  <Radio className={`h-3 w-3 ${connected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                  <span>{connected ? "LIVE SSE STREAM" : "REST POLLING"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full 6-stage explainable waterfall: Observation $\to$ Analysis $\to$ Reasoning $\to$ Proposal $\to$ Risk Check $\to$ Final Verdict
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter for Waterfall */}
        <div className="flex items-center gap-2 bg-[#12141A] p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setSelectedDecisionIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === "ALL" ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            All Runs
          </button>
          <button
            onClick={() => {
              setStatusFilter("APPROVED");
              setSelectedDecisionIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === "APPROVED" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Approved Only
          </button>
          <button
            onClick={() => {
              setStatusFilter("BLOCKED");
              setSelectedDecisionIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === "BLOCKED" ? "bg-rose-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Blocked / Vetoed
          </button>
        </div>
      </div>

      {/* Waterfall Selection Tabs */}
      {filteredDecisions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filteredDecisions.map((dec, idx) => {
            const isSelected = activeDecision?.id === dec.id;
            const isApp = dec.status === "APPROVED_EXECUTED";
            return (
              <button
                key={dec.id}
                onClick={() => setSelectedDecisionIndex(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="font-mono">{dec.symbol}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isApp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {isApp ? "APPROVED" : "VETOED"}
                </span>
                <span className="text-[10px] text-slate-400 opacity-80">{dec.confidence}%</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Featured Decision Waterfall Component */}
      {activeDecision && <DecisionWaterfall decision={activeDecision} isLiveAnimation={connected} />}

      {/* Real-time Activity Telemetry Stream */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Raw Pipeline Event Logs (Heartbeat & Telemetry)
            </h3>
            <p className="text-xs text-slate-400">
              Low-level event broadcast stream over Server-Sent Events (SSE)
            </p>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 self-start sm:self-auto">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedStage === stage
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/25"
                    : "bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <AgentTimeline activities={filteredActivities} />
      </div>
    </div>
  );
};
