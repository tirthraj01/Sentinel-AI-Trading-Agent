import React from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { StockQuote } from "../types";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface StockCardProps {
  stock: StockQuote;
  onAnalyze?: (symbol: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onAnalyze }) => {
  const isPositive = stock.change >= 0;

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {stock.symbol}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">
              {stock.name}
            </p>
          </div>

          <button
            onClick={() => onAnalyze?.(stock.symbol)}
            className="flex items-center gap-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Analyze with Sentinel Agent"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analyze</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xl font-bold text-white font-tabular">
            ${stock.price.toFixed(2)}
          </span>
          <div
            className={`flex items-center gap-1 text-xs font-bold font-tabular ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline mini chart */}
      <div className="h-16 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stock.chartData}>
            <defs>
              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? "#10B981" : "#F43F5E"}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? "#10B981" : "#F43F5E"}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10B981" : "#F43F5E"}
              strokeWidth={2}
              fill={`url(#grad-${stock.symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Vol: {stock.volume}</span>
        <span>Cap: {stock.marketCap || "N/A"}</span>
      </div>
    </div>
  );
};
