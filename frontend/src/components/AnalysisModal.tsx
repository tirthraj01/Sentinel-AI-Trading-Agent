import React, { useState } from "react";
import { Sparkles, ShieldCheck, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { Badge } from "./Badge";
import { AgentDecision } from "../types";
import { MOCK_DECISIONS } from "../data/mockData";

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

  const steps = [
    "Collecting real-time quotes, technical momentum & order book...",
    "Scanning financial news feeds & calculating NLP sentiment score...",
    "Inspecting existing portfolio weights & cash liquidity...",
    "Synthesizing investment hypothesis & generating trade proposal...",
    "Routing proposal to Deterministic Risk Engine (zero LLM)...",
    "Finalizing paper order execution verdict...",
  ];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setCompletedDecision(null);

    // Simulate multi-step agent flow
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        // Pick appropriate mock decision
        const result =
          scenario === "approved"
            ? { ...MOCK_DECISIONS[0], symbol: selectedSymbol, runId: `run-${selectedSymbol.toLowerCase()}-${Date.now().toString().slice(-4)}` }
            : { ...MOCK_DECISIONS[1], symbol: selectedSymbol, runId: `run-${selectedSymbol.toLowerCase()}-${Date.now().toString().slice(-4)}` };

        setCompletedDecision(result);
        onCompleteAnalysis?.(result);
      }
    }, 600);
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
                    ? "bg-emerald-950/30 border-emerald-500/50 shadow-inner"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Scenario A: Approved</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  High AI conviction (86%), exposure within limits. Risk approves and paper order is placed.
                </p>
              </div>

              <div
                onClick={() => setScenario("blocked")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scenario === "blocked"
                    ? "bg-rose-950/30 border-rose-500/50 shadow-inner"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">Scenario B: Risk Veto</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  AI proposes BUY, but breaches confidence (68%) or exposure limits. Risk engine halts execution!
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-98"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Sentinel Agent Cycle ({selectedSymbol})</span>
            </button>
          </div>
        </div>
      )}

      {/* Analyzing Progress State */}
      {isAnalyzing && (
        <div className="py-6 space-y-5">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-bold text-white">
              Agent Execution in Progress
            </h4>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">
              Analyzing {selectedSymbol} • Cycle Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Animated Steps Checklist */}
          <div className="space-y-2 bg-[#0A0B0E] p-3.5 rounded-2xl border border-white/5">
            {steps.map((text, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                  idx === currentStep
                    ? "text-white font-semibold"
                    : idx < currentStep
                    ? "text-slate-400 line-through opacity-70"
                    : "text-slate-600 opacity-40"
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : idx === currentStep ? (
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Result Display */}
      {completedDecision && (
        <div className="space-y-4 py-2">
          <div
            className={`p-4 rounded-2xl border ${
              completedDecision.status === "APPROVED_EXECUTED"
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-rose-950/20 border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white font-mono">
                  {completedDecision.symbol}
                </span>
                <Badge variant={completedDecision.decision === "BUY" ? "buy" : "hold"}>
                  {completedDecision.decision}
                </Badge>
                <Badge
                  variant={
                    completedDecision.status === "APPROVED_EXECUTED"
                      ? "approved"
                      : "blocked"
                  }
                >
                  {completedDecision.status === "APPROVED_EXECUTED"
                    ? "APPROVED"
                    : "BLOCKED BY RISK"}
                </Badge>
              </div>
              <span className="text-xs font-bold text-white font-tabular">
                Confidence: {completedDecision.confidence}%
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
