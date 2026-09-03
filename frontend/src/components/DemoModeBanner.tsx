import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

interface DemoModeBannerProps {
  onOpenTour: () => void;
  onScenarioExecuted?: (scenarioData: any) => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  onOpenTour,
  onScenarioExecuted,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [executingScenario, setExecutingScenario] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { success, warning, error, info } = useToast();

  const handleRunScenario = async (scenario: "A" | "B" | "C" | "D") => {
    setExecutingScenario(scenario);
    try {
      const res = await api.triggerDemoScenario(scenario);

      if (scenario === "A") {
        success("Scenario A Executed", "Standard Buy approved by Risk Engine & paper executed on Alpaca!");
      } else if (scenario === "B") {
        warning("Scenario B Intercepted", "TSLA trade exceeds 10% single-asset limit and was vetoed.");
      } else if (scenario === "C") {
        warning("Scenario C Vetoed", "AI conviction of 64% is below the 70% threshold.");
      } else if (scenario === "D") {
        error("Scenario D Circuit Breaker", "Daily drawdown of 2.5% reached. Trading halted!");
      }

      if (onScenarioExecuted) {
        onScenarioExecuted(res.data);
      }
    } catch (err) {
      error("Scenario Error", (err as Error).message);
    } finally {
      setExecutingScenario(null);
    }
  };

  const handleResetPortfolio = async () => {
    if (!window.confirm("Reset portfolio balance back to initial $100,000 baseline?")) {
      return;
    }

    setIsResetting(true);
    try {
      await api.resetDemoState();
      info("Portfolio Reset", "Portfolio state successfully reset to initial $100,000 cash baseline.");
      window.location.reload();
    } catch (err) {
      error("Reset Error", (err as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-[#12141A]/95 border-b border-indigo-500/20 backdrop-blur-xl sticky top-16 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Left: Mode Title & Quick Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold font-mono">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>INTERACTIVE DEMO PRESETS</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span>{isExpanded ? "Hide Scenarios" : "Preset Scenarios (A, B, C, D)"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Right: Quick Launch Buttons & Tour */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-all"
            title="Take Guided Walkthrough"
          >
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Guided Tour</span>
          </button>

          <button
            onClick={handleResetPortfolio}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-300 font-medium transition-all"
            title="Reset Portfolio to $100K Baseline"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin text-rose-400" : ""}`} />
            <span>Reset ($100K)</span>
          </button>
        </div>
      </div>

      {/* Expanded Scenario Action Tray */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-black/40 px-4 sm:px-6 lg:px-8 py-3 animate-fade-in">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Scenario A */}
            <button
              onClick={() => handleRunScenario("A")}
              disabled={executingScenario !== null}
              className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Scenario A: Standard Buy</span>
                </span>
                <Play className="h-3 w-3 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                NVDA 85% conviction. Clears all 6 risk rules. Paper order executed on Alpaca.
              </p>
            </button>

            {/* Scenario B */}
            <button
              onClick={() => handleRunScenario("B")}
              disabled={executingScenario !== null}
              className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Scenario B: Sizing Veto</span>
                </span>
                <Play className="h-3 w-3 text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                TSLA oversized trade. Breaches 10% single-asset limit. Risk Engine vetoes order.
              </p>
            </button>

            {/* Scenario C */}
            <button
              onClick={() => handleRunScenario("C")}
              disabled={executingScenario !== null}
              className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Scenario C: Low Conviction</span>
                </span>
                <Play className="h-3 w-3 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Speculative buy with 64% confidence. Sub-70% floor trips risk veto.
              </p>
            </button>

            {/* Scenario D */}
            <button
              onClick={() => handleRunScenario("D")}
              disabled={executingScenario !== null}
              className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-950/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Scenario D: Circuit Breaker</span>
                </span>
                <Play className="h-3 w-3 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Drawdown reaches 2.5%. Circuit breaker freezes all BUY orders platform-wide.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
