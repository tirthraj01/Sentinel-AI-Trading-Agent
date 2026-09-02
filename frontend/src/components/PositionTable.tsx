import React from "react";
import { TrendingUp, TrendingDown, Sparkles, ChevronRight } from "lucide-react";
import { Position } from "../types";
import { RiskMeter } from "./RiskMeter";

interface PositionTableProps {
  positions: Position[];
  onAnalyzeSymbol?: (symbol: string) => void;
  onSelectPosition?: (position: Position) => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  positions,
  onAnalyzeSymbol,
  onSelectPosition,
}) => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Open Portfolio Positions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to open interactive asset chart & risk drawer
          </p>
        </div>
        <span className="text-xs font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
          {positions.length} Active Assets
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 bg-white/[0.01]">
              <th className="py-3 px-5 font-semibold">Asset</th>
              <th className="py-3 px-4 font-semibold text-right">Shares</th>
              <th className="py-3 px-4 font-semibold text-right">Avg Entry</th>
              <th className="py-3 px-4 font-semibold text-right">Current Price</th>
              <th className="py-3 px-4 font-semibold text-right">Market Value</th>
              <th className="py-3 px-4 font-semibold text-right">Unrealized P/L</th>
              <th className="py-3 px-5 font-semibold min-w-[160px]">Portfolio Weight</th>
              <th className="py-3 px-5 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {positions.map((pos) => {
              const isProfit = pos.unrealizedPL >= 0;
              return (
                <tr
                  key={pos.symbol}
                  onClick={() => onSelectPosition?.(pos)}
                  className="hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-xs text-indigo-300 group-hover:border-indigo-500/50 transition-colors">
                        {pos.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono block text-sm">
                            {pos.symbol}
                          </span>
                          <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <span className="text-[11px] text-slate-400 truncate max-w-[130px] block">
                          {pos.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular text-slate-200">
                    {pos.shares}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                    ${pos.avgEntryPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular font-semibold text-white">
                    ${pos.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular font-semibold text-white">
                    ${pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular">
                    <div className={`inline-flex items-center gap-1 font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>
                        {isProfit ? "+" : ""}${pos.unrealizedPL.toFixed(2)} ({isProfit ? "+" : ""}{pos.unrealizedPLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                    <RiskMeter
                      currentPct={pos.allocationPercent}
                      maxLimit={10.0}
                      size="sm"
                    />
                  </td>
                  <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onAnalyzeSymbol?.(pos.symbol)}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Analyze</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
