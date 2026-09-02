import React from "react";
import { Link } from "react-router-dom";
import { Shield, Sparkles, Search, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onOpenAnalysisModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAnalysisModal }) => {

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0B0E]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 border border-white/10 p-2 shadow-inner group-hover:border-indigo-500/50 transition-all">
              <Shield className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  SENTINEL
                </span>
                <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                  AI AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Explainable, Risk-Aware Trading
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Fast Search & Actions */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker (AAPL, NVDA, TSLA, SPY)..."
              className="w-full bg-[#12141A] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right Badges & Account Status */}
        <div className="flex items-center gap-3">
          {/* Paper Trading Indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Alpaca Paper Active</span>
          </div>

          {/* Risk Engine Guard Badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Risk Guard 100%</span>
          </div>

          {/* Trigger Analysis Button */}
          <button
            onClick={onOpenAnalysisModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analyze Symbol</span>
          </button>
        </div>
      </div>
    </header>
  );
};
