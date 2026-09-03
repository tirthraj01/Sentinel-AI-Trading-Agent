import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Search, ShieldCheck, Menu } from "lucide-react";
import { SentinelMascot } from "./SentinelMascot";

interface NavbarProps {
  onOpenAnalysisModal?: () => void;
  onSearch?: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAnalysisModal,
  onSearch,
  onToggleMobileMenu,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    onSearch?.(normalizedQuery);
    navigate(`/markets?search=${encodeURIComponent(normalizedQuery)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0B0E]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <SentinelMascot size="sm" state="idle" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  SENTINEL
                </span>
                <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 shadow-sm">
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
          <form onSubmit={submitSearch} className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <input
              type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticker, company, or metric..."
              className="w-full bg-[#12141A]/90 border border-white/10 rounded-2xl py-1.5 pl-9 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </span>
          </form>
        </div>

        {/* Right Badges & Account Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Paper Trading Indicator */}
          <div
            className="flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-sm transition-all hover:border-emerald-500/60 cursor-default"
            title="Alpaca Paper Trading Account • Live Trading Disabled"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Alpaca Paper Active</span>
            <span className="sm:hidden text-[11px]">Paper</span>
          </div>

          {/* Risk Engine Guard Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 transition-all hover:border-indigo-500/60 cursor-default"
            title="Deterministic Mathematical Risk Engine • Non-LLM Veto Guard"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Risk Guard Active</span>
          </div>

          {/* Trigger Analysis Button */}
          <button
            onClick={onOpenAnalysisModal}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analyze Symbol</span>
            <span className="sm:hidden">Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
