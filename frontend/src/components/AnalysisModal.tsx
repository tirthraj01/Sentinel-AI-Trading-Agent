import React, { useState } from "react";
import { Sparkles, ShieldCheck, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { Badge } from "./Badge";
import { AgentDecision } from "../types";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  onCompleteAnalysis?: (decision: AgentDecision) => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = "NVDA",
  onCompleteAnalysis,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [scenario, setScenario] = useState<"approved" | "blocked">("approved");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedDecision, setCompletedDecision] = useState<AgentDecision | null>(null);

  const { success, warning, error: toastError } = useToast();

  const steps = [
    "Collecting real-time quotes, technical momentum & order book...",
    "Scanning financial news feeds & calculating NLP sentiment score...",
    "Inspecting existing portfolio weights & cash liquidity...",
    "Synthesizing investment hypothesis & generating trade proposal...",
    "Routing proposal to Deterministic Risk Engine (zero LLM)...",
    "Finalizing paper order execution verdict...",
  ];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setCompletedDecision(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length - 1) {
        setCurrentStep(step);
      }
    }, 300);

    try {
      const result = await api.analyzeSymbol({
        symbol: selectedSymbol,
        forceScenario: scenario === "approved" ? "APPROVED" : "BLOCKED",
      });

      clearInterval(interval);
      setCurrentStep(steps.length - 1);

      setTimeout(() => {
        setIsAnalyzing(false);
        setCompletedDecision(result);
        onCompleteAnalysis?.(result);

        if (result.status === "APPROVED_EXECUTED") {
          success(
            "Paper Trade Executed",
            `Sentinel approved and placed order for ${result.suggestedShares} shares of ${result.symbol} to Alpaca.`
          );
        } else {
          warning(
            "Trade Blocked by Risk Engine",
            result.riskResult?.reasons?.[0] || "Order failed risk constraints. Zero capital risked."
          );
        }
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      toastError("Analysis Error", (err as Error).message);
    }
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setCurrentStep(0);
    setCompletedDecision(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Sentinel Agent Analysis Sandbox"
      subtitle="Experience the explainable AI trading loop and deterministic risk guard"
      maxWidth="xl"
    >
      {!isAnalyzing && !completedDecision && (
        <div className="space-y-5">
          {/* Symbol Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Select Ticker Symbol
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["NVDA", "AAPL", "TSLA", "MSFT"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all ${
                    selectedSymbol === sym
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-sm"
                      : "bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Test Scenario (Proof of Risk Control)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setScenario("approved")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scenario === "approved"
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white">Scenario A: Approved</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  High conviction (85%), passes all 6 risk rules. Submitted to Alpaca paper sandbox.
                </p>
              </div>

              <div
                onClick={() => setScenario("blocked")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scenario === "blocked"
                    ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span className="font-bold text-xs text-white">Scenario B: Risk Veto</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Breaches position or confidence limits. Blocked by Deterministic Risk Engine.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Trigger Full Autonomous Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Progressing Step State */}
      {isAnalyzing && (
        <div className="py-8 px-4 text-center space-y-6 animate-fade-in">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping opacity-30" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/40 text-indigo-400">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-1">
              Analyzing {selectedSymbol}...
            </h4>
            <p className="text-xs text-indigo-300 font-mono">
              {steps[currentStep]}
            </p>
          </div>

          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Finished Result State */}
      {!isAnalyzing && completedDecision && (
        <div className="space-y-4 animate-fade-in">
          <div
            className={`p-4 rounded-2xl border ${
              completedDecision.status === "APPROVED_EXECUTED"
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-rose-950/20 border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-white">
                  {completedDecision.symbol}
                </span>
                <Badge
                  variant={
                    completedDecision.status === "APPROVED_EXECUTED"
                      ? "approved"
                      : "blocked"
                  }
                  size="sm"
                >
                  {completedDecision.status === "APPROVED_EXECUTED"
                    ? "APPROVED & EXECUTED"
                    : "BLOCKED BY RISK GUARD"}
                </Badge>
              </div>
              <span className="text-xs font-mono text-slate-400">
                AI Conviction: {completedDecision.confidence}%
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {completedDecision.reasoning}
            </p>

            {completedDecision.riskResult && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                {completedDecision.riskResult.checks.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] text-slate-400"
                  >
                    <span className="flex items-center gap-1.5">
                      {c.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                      )}
                      <span>{c.label}</span>
                    </span>
                    <span
                      className={`font-tabular font-semibold ${
                        c.passed ? "text-emerald-300" : "text-rose-400"
                      }`}
                    >
                      {c.actual} (Limit: {c.threshold})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Test Another Scenario
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
