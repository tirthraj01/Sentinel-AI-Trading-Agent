import React from "react";
import { Settings, Shield, Database, Cpu, CheckCircle2, Lock } from "lucide-react";

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Safety Invariants
            </h1>
            <p className="text-xs text-slate-400">
              System configurations, paper trading guarantees, and service credentials
            </p>
          </div>
        </div>
      </div>

      {/* Non-Negotiable Safety Lock Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/15 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-white">
                Paper Trading Exclusivity (Strict Lock)
              </h3>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                Enforced
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SENTINEL is permanently sandboxed to Alpaca Paper Trading. Live brokerage credentials and real-money execution are strictly rejected by hardware and environment assertions at boot time.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Services Status */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
        <h3 className="text-base font-bold text-white tracking-tight">
          Service Connections & Endpoints
        </h3>

        <div className="space-y-3">
          {/* Alpaca */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                ALP
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  Alpaca Trading Gateway
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  https://paper-api.alpaca.markets
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paper Connected
            </span>
          </div>

          {/* AI LLM Provider */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  AI Model Service (Google Gemini / OpenAI)
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Provider: Gemini 2.5 Flash / Structured Output
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready
            </span>
          </div>

          {/* Supabase Database */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  Supabase PostgreSQL Audit Vault
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Table Storage: Runs, Decisions, Risk Events, Trades
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" /> Schema Active
            </span>
          </div>
        </div>
      </div>

      {/* Risk Engine Rules Overview in Settings */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Active Risk Threshold Constants
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Immutable by AI
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Max Position Exposure:</span>
            <span className="font-bold text-white font-tabular">10.0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Max Single Trade:</span>
            <span className="font-bold text-white font-tabular">5.0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Daily Loss Circuit:</span>
            <span className="font-bold text-white font-tabular">2.0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Min AI Confidence:</span>
            <span className="font-bold text-white font-tabular">70.0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Max Trades Per Day:</span>
            <span className="font-bold text-white font-tabular">10 trades</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-slate-400">Max Sector Allocation:</span>
            <span className="font-bold text-white font-tabular">40.0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
