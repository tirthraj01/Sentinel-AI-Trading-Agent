import React, { useEffect } from "react";
import { X, Sparkles, TrendingUp, TrendingDown, ArrowDownLeft } from "lucide-react";
import { Position } from "../types";
import { AssetChart } from "./AssetChart";
import { RiskMeter } from "./RiskMeter";
import { Badge } from "./Badge";
import { MOCK_DECISIONS, MOCK_TRADES } from "../data/mockData";

interface PositionDrawerProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onRunAnalysis: (symbol: string) => void;
}

export const PositionDrawer: React.FC<PositionDrawerProps> = ({
  position,
  isOpen,
  onClose,
  onRunAnalysis,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!position) return null;

  const isProfit = position.unrealizedPL >= 0;
  const isDailyPos = (position.dailyChange ?? 0) >= 0;

  // Find corresponding AI decision and trades if any
  const aiDecision = MOCK_DECISIONS.find((d) => d.symbol === position.symbol);
  const positionTrades = MOCK_TRADES.filter((t) => t.symbol === position.symbol);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full flex pl-10 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-screen max-w-md sm:max-w-lg bg-[#0E1016] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header: Symbol & Close Button */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-base text-indigo-300">
                  {position.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white font-mono tracking-tight">
                      {position.symbol}
                    </h2>
                    <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      LONG
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{position.name}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price & Daily Metric */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white font-tabular">
                  ${position.currentPrice.toFixed(2)}
                </span>
                {position.dailyChange !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-bold font-tabular mt-0.5 ${
                      isDailyPos ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isDailyPos ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isDailyPos ? "+" : ""}
                      {position.dailyChange.toFixed(2)} ({isDailyPos ? "+" : ""}
                      {position.dailyChangePercent?.toFixed(2)}%) Today
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onClose();
                  onRunAnalysis(position.symbol);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Analyze</span>
              </button>
            </div>

            {/* Interactive Asset Chart */}
            <div className="rounded-2xl bg-[#12141A] border border-white/5 p-4">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-2">
                Price Performance & Entry Basis
              </span>
              <AssetChart
                symbol={position.symbol}
                currentPrice={position.currentPrice}
                avgEntryPrice={position.avgEntryPrice}
                height={180}
              />
            </div>

            {/* Position Financials Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 text-[11px] block">Shares Owned</span>
                <span className="text-base font-bold text-white font-tabular mt-0.5 block">
                  {position.shares} shares
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 text-[11px] block">Average Entry</span>
                <span className="text-base font-bold text-white font-tabular mt-0.5 block">
                  ${position.avgEntryPrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 text-[11px] block">Market Value</span>
                <span className="text-base font-bold text-white font-tabular mt-0.5 block">
                  ${position.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 text-[11px] block">Unrealized P/L</span>
                <span
                  className={`text-base font-bold font-tabular mt-0.5 block ${
                    isProfit ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isProfit ? "+" : ""}${position.unrealizedPL.toFixed(2)} ({isProfit ? "+" : ""}
                  {position.unrealizedPLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Position Risk Ceiling Visualization */}
            <div className="rounded-2xl bg-[#12141A] border border-white/5 p-4 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                Risk Engine Exposure Status
              </span>
              <RiskMeter currentPct={position.allocationPercent} maxLimit={10.0} />
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {position.allocationPercent >= 8.5
                  ? "Near Limit: Any new BUY proposal will likely be vetoed by the Sentinel Risk Engine to avoid overconcentration."
                  : position.allocationPercent >= 7.0
                  ? "Watchlist Alert: Position is healthy but approaching the 10.0% single-asset threshold."
                  : "Safe Allocation: Well below portfolio concentration caps."}
              </p>
            </div>

            {/* AI View for this Asset */}
            <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Agent View</span>
                </span>
                {aiDecision && (
                  <Badge
                    variant={
                      aiDecision.decision === "BUY"
                        ? "buy"
                        : aiDecision.decision === "SELL"
                        ? "sell"
                        : "hold"
                    }
                    size="sm"
                  >
                    {aiDecision.decision} ({aiDecision.confidence}%)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiDecision
                  ? aiDecision.reasoning
                  : `Sentinel actively monitors ${position.symbol} order flow, volume trends, and macroeconomic news sentiment.`}
              </p>
            </div>

            {/* Recent Orders for this Asset */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Order Activity
              </span>
              {positionTrades.length > 0 ? (
                <div className="space-y-2">
                  {positionTrades.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-semibold text-white font-mono">
                          {t.side} {t.shares} shares
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-tabular text-[11px]">
                        <span>${t.estimatedPrice.toFixed(2)}</span>
                        <span>•</span>
                        <span>{new Date(t.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No recent orders for this asset.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-center">
            <span className="text-[11px] text-slate-500">
              Alpaca Paper Trading Account • Live Execution Disabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
