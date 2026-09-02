import React from "react";
import { useOutletContext } from "react-router-dom";
import { PositionTable } from "../components/PositionTable";
import { MOCK_POSITIONS } from "../data/mockData";

export const PositionsPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const totalMarketValue = MOCK_POSITIONS.reduce((acc, p) => acc + p.marketValue, 0);
  const totalUnrealizedPL = MOCK_POSITIONS.reduce((acc, p) => acc + p.unrealizedPL, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Active Holdings & Positions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time valuation of assets currently in your Alpaca paper portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Total Unrealized P/L
            </span>
            <span className="text-base font-bold text-emerald-400 font-tabular">
              +${totalUnrealizedPL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-3xl p-5 border border-white/10">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
            Invested Equity
          </span>
          <span className="text-2xl font-bold text-white font-tabular">
            ${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">5 Assets Monitored</p>
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
            Largest Position
          </span>
          <span className="text-2xl font-bold text-white font-mono">
            AAPL (8.72%)
          </span>
          <p className="text-[11px] text-slate-400 mt-2">Approaching 10% limit</p>
        </div>
      </div>

      {/* Main Position Table */}
      <PositionTable
        positions={MOCK_POSITIONS}
        onAnalyzeSymbol={(sym) => onOpenAnalysis(sym)}
      />
    </div>
  );
};
