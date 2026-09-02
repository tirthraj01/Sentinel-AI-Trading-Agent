import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { MOCK_STOCKS, MOCK_DECISIONS } from "../data/mockData";

interface MarketPulseProps {
  onSelectSymbol: (symbol: string) => void;
}

export const MarketPulse: React.FC<MarketPulseProps> = ({ onSelectSymbol }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Market Pulse</span>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time multi-asset stream with AI sentiment & sparkline momentum
          </p>
        </div>
        <span className="text-xs text-indigo-400 font-semibold font-mono">
          Alpaca Feed
        </span>
      </div>

      {/* Horizontal Scroll / Grid of Compact Pulse Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOCK_STOCKS.map((stock) => {
          const isPos = stock.change >= 0;
          const aiDec = MOCK_DECISIONS.find((d) => d.symbol === stock.symbol);
          const sentiment = aiDec?.newsSentiment.score ?? 0.5;

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectSymbol(stock.symbol)}
              className="glass-panel glass-panel-hover rounded-2xl p-3.5 border border-white/10 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-white text-xs">
                    {stock.symbol}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      sentiment >= 0.7
                        ? "bg-emerald-500/15 text-emerald-300"
                        : sentiment <= 0.3
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                    title="AI Sentiment"
                  >
                    {sentiment >= 0.7 ? "BULL" : sentiment <= 0.3 ? "BEAR" : "NEUT"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-bold text-white font-tabular">
                    ${stock.price.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-0.5 text-[10px] font-semibold font-tabular ${
                    isPos ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  <span>
                    {isPos ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Sparkline mini chart */}
              <div className="h-9 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stock.chartData}>
                    <defs>
                      <linearGradient id={`pulse-grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPos ? "#10B981" : "#F43F5E"} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={isPos ? "#10B981" : "#F43F5E"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPos ? "#10B981" : "#F43F5E"}
                      strokeWidth={1.5}
                      fill={`url(#pulse-grad-${stock.symbol})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
