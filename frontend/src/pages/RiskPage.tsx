import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Power,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { useRiskStatus } from "../hooks/useRiskStatus";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";

export const RiskPage: React.FC = () => {
  const { riskStatus, killSwitchActive, loading, refetch, toggleKillSwitch } = useRiskStatus();
  const { success, warning, error: toastError } = useToast();

  const [togglingKillSwitch, setTogglingKillSwitch] = useState(false);

  // Dry-run simulator state
  const [simSymbol, setSimSymbol] = useState("NVDA");
  const [simShares, setSimShares] = useState(10);
  const [simPrice, setSimPrice] = useState(128.9);
  const [simConfidence, setSimConfidence] = useState(85);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleToggleKillSwitch = async () => {
    const nextState = !killSwitchActive;
    setTogglingKillSwitch(true);
    try {
      const res = await toggleKillSwitch(nextState);
      if (res.killSwitchActive) {
        warning("Emergency Kill Switch Engaged", "All trading and order executions are strictly frozen.");
      } else {
        success("Emergency Kill Switch Disengaged", "Normal algorithmic paper trading operations resumed.");
      }
    } catch (err) {
      toastError("Failed to toggle kill switch", (err as Error).message);
    } finally {
      setTogglingKillSwitch(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const result = await api.evaluateRisk({
        symbol: simSymbol,
        decision: "BUY",
        shares: Number(simShares),
        price: Number(simPrice),
        confidence: Number(simConfidence),
      });
      setSimResult(result);
      if (result.approved) {
        success("Risk Simulation Passed", `Trade of ${simShares} ${simSymbol} conforms to all 6 safety rules.`);
      } else {
        warning("Risk Simulation Vetoed", result.reasons?.[0] || "Exceeds risk thresholds.");
      }
    } catch (err) {
      toastError("Simulation Error", (err as Error).message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deterministic Risk Engine
            </h1>
            <p className="text-xs text-slate-400">
              Isolated mathematical guardrails with absolute veto power over AI recommendations
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh risk metrics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Emergency Kill Switch Hero Panel */}
      <div
        className={`glass-panel rounded-3xl p-6 border transition-all duration-300 ${
          killSwitchActive
            ? "bg-rose-950/40 border-rose-500/50 shadow-2xl shadow-rose-950/50"
            : "border-white/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl border ${
                killSwitchActive
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                  : "bg-slate-800/50 border-white/10 text-slate-400"
              }`}
            >
              <Power className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Emergency Platform Kill Switch
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    killSwitchActive
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {killSwitchActive ? "ACTIVE — TRADING FROZEN" : "STANDBY — NORMAL OPERATIONS"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                When activated, all AI agent executions and broker order submissions are instantly blocked with a CRITICAL safety invariant.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleKillSwitch}
            disabled={togglingKillSwitch}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg ${
              killSwitchActive
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25"
            }`}
          >
            {killSwitchActive ? "Deactivate Kill Switch" : "ENGAGE EMERGENCY KILL SWITCH"}
          </button>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Deterministic Invariant: AI Cannot Bypass This Layer
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every proposal emitted by the LLM is passed through this standalone mathematical module. If any threshold is breached, the proposal is blocked immediately. Alpaca paper trading is never called, and the breach is recorded to the audit log.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Hard Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {riskStatus.rules.map((rule: any) => {
          const percentUsed = (rule.currentValue / rule.limit) * 100;
          const isWarning = percentUsed > 80;

          return (
            <div
              key={rule.id}
              className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {rule.name}
                  </h4>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  <Lock className="h-3 w-3 text-slate-500" /> Hard Rule
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {rule.description}
              </p>

              {/* Progress meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-tabular">
                  <span className="text-slate-400">Current Value:</span>
                  <span className={`font-bold ${isWarning ? "text-amber-400" : "text-white"}`}>
                    {rule.currentValue}{rule.unit} / Max {rule.limit}{rule.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWarning ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block text-right">
                  {percentUsed.toFixed(1)}% of ceiling utilized
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Risk Simulator Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Mathematical Risk Simulator (Dry-Run)</h3>
              <p className="text-xs text-slate-400">Test any arbitrary order against the 6 deterministic rules without executing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Symbol</label>
            <input
              type="text"
              value={simSymbol}
              onChange={(e) => setSimSymbol(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500/50 font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Shares</label>
            <input
              type="number"
              value={simShares}
              onChange={(e) => setSimShares(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={simPrice}
              onChange={(e) => setSimPrice(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">AI Conviction (%)</label>
            <input
              type="number"
              value={simConfidence}
              onChange={(e) => setSimConfidence(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={simulating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition-all"
          >
            {simulating ? "Evaluating..." : "Run Risk Check"}
          </button>
        </form>

        {simResult && (
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">Simulation Verdict:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  simResult.approved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {simResult.approved ? "APPROVED" : `VETOED (${simResult.riskLevel} RISK)`}
              </span>
            </div>
            {simResult.reasons && simResult.reasons.length > 0 && (
              <ul className="text-rose-300 space-y-1 mt-2 list-disc list-inside">
                {simResult.reasons.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Blocked Trades Audit Section */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Blocked Trade Log (Risk Veto History)
            </h3>
          </div>
          <span className="text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            {riskStatus.recentVetoes.length} Trades Intercepted
          </span>
        </div>

        <div className="space-y-3">
          {riskStatus.recentVetoes.map((bt: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-white text-sm">
                    {bt.symbol}
                  </span>
                  <Badge variant="blocked" size="sm">
                    VETOED
                  </Badge>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Reason: {bt.reasons?.join(" • ") || "Exceeded mathematical constraint thresholds."}
                </p>
              </div>

              <div className="text-right sm:shrink-0">
                <span className="text-[11px] text-slate-400 font-mono block">
                  {new Date(bt.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Zero Broker Exposure
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
