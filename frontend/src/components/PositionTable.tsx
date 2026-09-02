import React from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Position } from "../types";

interface PositionTableProps {
  positions: Position[];
  onAnalyzeSymbol?: (symbol: string) => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  positions,
  onAnalyzeSymbol,
}) => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Open Portfolio Positions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active paper holdings monitored by Sentinel Risk Guard
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
              <th className="py-3 px-4 font-semibold text-right">Portfolio Weight</th>
              <th className="py-3 px-5 font-semibold text-center">AI Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {positions.map((pos) => {
              const isProfit = pos.unrealizedPL >= 0;
              return (
                <tr
                  key={pos.symbol}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-xs text-indigo-300">
                        {pos.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-white font-mono block text-sm">
                          {pos.symbol}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px] block">
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
                  <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-400"
                          style={{ width: `${Math.min(pos.allocationPercent * 4, 100)}%` }}
                        />
                      </div>
                      <span>{pos.allocationPercent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => onAnalyzeSymbol?.(pos.symbol)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
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
