import React from "react";
import { Eye, BrainCircuit, ShieldCheck, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { AgentActivityEvent } from "../types";

interface AgentTimelineProps {
  activities: AgentActivityEvent[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ activities }) => {
  const getStageIcon = (stage: AgentActivityEvent["stage"]) => {
    switch (stage) {
      case "OBSERVE":
        return <Eye className="h-4 w-4 text-cyan-400" />;
      case "ANALYZE":
        return <BrainCircuit className="h-4 w-4 text-indigo-400" />;
      case "RISK_CHECK":
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      case "BLOCKED":
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case "EXECUTION":
      case "COMPLETE":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStageBadge = (stage: AgentActivityEvent["stage"]) => {
    switch (stage) {
      case "OBSERVE":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "ANALYZE":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "RISK_CHECK":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "BLOCKED":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "EXECUTION":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Agent Reasoning & Execution Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time auditable waterfall of observations, AI inferences, risk checks, and paper executions
          </p>
        </div>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          Live Transparency Stream
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[30px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#12141A] border border-white/20 shadow-md group-hover:border-indigo-500 transition-colors">
              {getStageIcon(act.stage)}
            </div>

            <div className="rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-4 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStageBadge(act.stage)}`}>
                    {act.stage}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {act.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-tabular font-mono">
                  <span>{act.timestamp}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{act.runId}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {act.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
