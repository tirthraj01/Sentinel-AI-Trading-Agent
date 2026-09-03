import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, AlertCircle } from "lucide-react";
import { PositionTable } from "../components/PositionTable";
import { PositionDrawer } from "../components/PositionDrawer";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { Position } from "../types";
import { usePositions } from "../hooks/usePositions";

export const PositionsPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const { positions, loading, error, refetch } = usePositions();

  const totalMarketValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalUnrealizedPL = positions.reduce((acc, p) => acc + p.unrealizedPL, 0);
  const nearLimitPosition = positions.find((p) => p.allocationPercent >= 8.0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Active Holdings & Positions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time valuation of assets currently held in your Alpaca paper portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh positions"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Total Unrealized P/L
            </span>
            <span
              className={`text-base font-bold font-tabular ${
                totalUnrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalUnrealizedPL >= 0 ? "+" : ""}${totalUnrealizedPL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span>Connection note: {error}. Showing cached state.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-3xl p-5 border border-white/10">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
            Invested Equity
          </span>
          <span className="text-2xl font-bold text-white font-tabular">
            ${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">{positions.length} Assets Monitored</p>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/10">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
            Exposure Guard Status
          </span>
          <span className="text-2xl font-bold text-emerald-400">
            Compliant
          </span>
          <p className="text-[11px] text-slate-400 mt-2">All assets under 10% ceiling</p>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/10">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
            Approaching Limit Alert
          </span>
          <span className="text-2xl font-bold text-amber-400 font-mono">
            {nearLimitPosition ? `${nearLimitPosition.symbol} (${nearLimitPosition.allocationPercent}%)` : "None"}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            {nearLimitPosition ? "Near 10% risk ceiling" : "All positions well within limits"}
          </p>
        </div>
      </div>

      {loading && positions.length === 0 ? (
        <LoadingSkeleton type="table" />
      ) : (
        /* Main Position Table with Click-to-Inspect Row */
        <PositionTable
          positions={positions}
          onAnalyzeSymbol={(sym) => onOpenAnalysis(sym)}
          onSelectPosition={(pos) => setSelectedPosition(pos)}
        />
      )}

      {/* Position Detail Slide-over Drawer */}
      <PositionDrawer
        position={selectedPosition}
        isOpen={Boolean(selectedPosition)}
        onClose={() => setSelectedPosition(null)}
        onRunAnalysis={(sym) => onOpenAnalysis(sym)}
      />
    </div>
  );
};
