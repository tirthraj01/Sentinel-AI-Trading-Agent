import React, { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Lock,
  Play,
} from "lucide-react";

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchScenario: (scenario: "A" | "B" | "C" | "D") => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onLaunchScenario,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "1. Institutional Portfolio Valuation",
      icon: <TrendingUp className="h-6 w-6 text-indigo-400" />,
      tag: "CAPITAL & LIQUIDITY",
      description:
        "SENTINEL starts with a pristine $100,000 paper trading allocation. The system tracks equity, cash reserves, intraday P/L, and historical performance curves with real-time portfolio concentration monitoring.",
      highlight: "Max 10% exposure in any single asset ticker protects against catastrophic single-stock volatility.",
      actionLabel: "Next: AI Surveillance",
    },
    {
      title: "2. AI Agent Market Surveillance",
      icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
      tag: "PERCEPTION & REASONING",
      description:
        "The agent continuously observes exchange quotes, moving bars, volume spikes, and NLP news sentiment. Structured LLM reasoning generates institutional decision memos with clear bullish/bearish catalysts.",
      highlight: "Orders require a mandatory 70% algorithmic conviction floor before proceeding to risk checks.",
      actionLabel: "Next: Risk Engine",
    },
    {
      title: "3. Deterministic Mathematical Risk Engine",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      tag: "INDEPENDENT CRO GATE",
      description:
        "Zero LLMs operate in the risk evaluation path. 6 strict mathematical rules enforce position sizes, single-order caps, sector ceilings, execution limits, and an intraday 2.0% circuit breaker.",
      highlight: "The Emergency Kill Switch provides instant administrative freezing with sub-millisecond execution.",
      actionLabel: "Next: Decision Waterfall",
    },
    {
      title: "4. Transparent Decision Waterfall",
      icon: <Workflow className="h-6 w-6 text-purple-400" />,
      tag: "AUDITABLE REASONING",
      description:
        "Inspect every sub-step of the agent's thought process: Observation (18ms) -> Technical Analysis (34ms) -> Reasoning (210ms) -> Proposed Order (12ms) -> Risk Check (4ms) -> Verdict (85ms).",
      highlight: "Full collapsible telemetry gives complete transparency into every approved trade and vetoed proposal.",
      actionLabel: "Next: Safety Invariants",
    },
    {
      title: "5. Strict Paper Sandbox Safeguards",
      icon: <Lock className="h-6 w-6 text-rose-400" />,
      tag: "ZERO LIVE CAPITAL RISK",
      description:
        "Hardcoded runtime invariants strictly lock order routing to Alpaca Paper Trading. Live broker endpoints are blocked by architectural assertions at both server boot and network request layers.",
      highlight: "Experience the platform safely in paper mode with instant one-click demo presets.",
      actionLabel: "Finish & Try Scenarios",
    },
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-xl rounded-3xl border border-white/10 p-6 sm:p-8 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interactive Guided Tour
            </span>
            <span className="text-xs text-slate-400">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guided tour"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
              {step.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">
                {step.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
            {step.description}
          </p>

          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{step.highlight}</span>
          </div>

          {/* Quick Scenario Launchers on last step */}
          {currentStep === tourSteps.length - 1 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Launch a live demo flow now:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onLaunchScenario("A");
                  }}
                  className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Scenario A (Approved)</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onLaunchScenario("B");
                  }}
                  className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Scenario B (Sizing Veto)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress & Controls */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>{step.actionLabel}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
