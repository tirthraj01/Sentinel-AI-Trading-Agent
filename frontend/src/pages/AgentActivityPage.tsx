import React, { useState } from "react";
import { Workflow, Radio } from "lucide-react";
import { AgentTimeline } from "../components/AgentTimeline";
import { useAgentStream } from "../hooks/useAgentStream";

export const AgentActivityPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const { activities, connected } = useAgentStream(50);

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
                  Agent Activity & Decision Tracing
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
                Step-by-step transparency feed of every observation, inference, and risk validation
              </p>
            </div>
          </div>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 self-start sm:self-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
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

      {/* Main Timeline Stream */}
      <AgentTimeline activities={filteredActivities} />
    </div>
  );
};
