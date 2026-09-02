import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TimeframeKey } from "../types";
import { MOCK_ASSET_CHARTS } from "../data/mockData";

interface AssetChartProps {
  symbol: string;
  currentPrice: number;
  avgEntryPrice?: number;
  height?: number;
  showTimeframeSelector?: boolean;
}

const timeframes: TimeframeKey[] = ["1D", "1W", "1M", "3M", "1Y"];

export const AssetChart: React.FC<AssetChartProps> = ({
  symbol,
  currentPrice,
  avgEntryPrice,
  height = 240,
  showTimeframeSelector = true,
}) => {
  const [selectedTf, setSelectedTf] = useState<TimeframeKey>("1D");

  // Lookup chart points for this symbol and timeframe, or fallback to sensible generation
  const symbolCharts = MOCK_ASSET_CHARTS[symbol] || MOCK_ASSET_CHARTS["AAPL"];
  const points = symbolCharts[selectedTf] || symbolCharts["1D"];

  const firstPrice = points[0]?.price || currentPrice;
  const lastPrice = points[points.length - 1]?.price || currentPrice;
  const periodChange = lastPrice - firstPrice;
  const periodChangePct = (periodChange / firstPrice) * 100;
  const isPositive = periodChange >= 0;

  return (
    <div className="w-full space-y-3">
      {/* Top Controls: Price & Timeframe pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white font-tabular">
              ${lastPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-bold font-tabular px-2 py-0.5 rounded-full ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositive ? "+" : ""}${periodChange.toFixed(2)} ({isPositive ? "+" : ""}
              {periodChangePct.toFixed(2)}%)
            </span>
          </div>
          {avgEntryPrice && (
            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
              Avg Cost Basis: <strong className="text-slate-200">${avgEntryPrice.toFixed(2)}</strong>
            </span>
          )}
        </div>

        {showTimeframeSelector && (
          <div className="flex items-center gap-1 bg-[#12141A] p-1 rounded-xl border border-white/10">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTf(tf)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  selectedTf === tf
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Recharts Area */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`asset-grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? "#10B981" : "#F43F5E"}
                  stopOpacity={0.35}
                />
                <stop
                  offset="90%"
                  stopColor={isPositive ? "#10B981" : "#F43F5E"}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const diffFromEntry = avgEntryPrice ? data.price - avgEntryPrice : null;
                  const diffPct = avgEntryPrice ? (diffFromEntry! / avgEntryPrice) * 100 : null;

                  return (
                    <div className="rounded-xl bg-[#12141A]/95 border border-white/10 p-2.5 shadow-xl backdrop-blur-md text-xs">
                      <p className="text-[10px] text-slate-400 font-mono mb-1">{data.time}</p>
                      <p className="font-bold text-white font-tabular">
                        ${data.price.toFixed(2)}
                      </p>
                      {avgEntryPrice && diffFromEntry !== null && (
                        <p className={`text-[10px] font-tabular mt-0.5 ${diffFromEntry >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          vs Entry: {diffFromEntry >= 0 ? "+" : ""}${diffFromEntry.toFixed(2)} ({diffPct?.toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Average Entry Price Reference Line */}
            {avgEntryPrice && (
              <ReferenceLine
                y={avgEntryPrice}
                stroke="#6366F1"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Entry $${avgEntryPrice.toFixed(2)}`,
                  fill: "#A5B4FC",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10B981" : "#F43F5E"}
              strokeWidth={2}
              fill={`url(#asset-grad-${symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
