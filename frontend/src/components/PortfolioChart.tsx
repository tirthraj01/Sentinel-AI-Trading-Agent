import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PortfolioSummary } from "../types";

interface PortfolioChartProps {
  portfolio: PortfolioSummary;
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolio }) => {
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Simulated Portfolio Equity (Paper Account)
          </span>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-tabular">
              ${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs font-bold font-tabular text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              +{portfolio.dailyPLPercent}% (+${portfolio.dailyPL.toFixed(2)} Today)
            </span>
          </div>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1 bg-[#12141A] p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                activeTimeframe === tf
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={portfolio.portfolioHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equity-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0A0B0E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl bg-[#12141A]/95 border border-white/10 p-3 shadow-xl backdrop-blur-md">
                      <p className="text-[11px] text-slate-400 font-mono mb-1">{data.time}</p>
                      <p className="text-sm font-bold text-white font-tabular">
                        ${Number(data.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#equity-gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart footer stats */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Available Cash</span>
          <span className="font-semibold text-white font-tabular">
            ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Paper Buying Power</span>
          <span className="font-semibold text-white font-tabular">
            ${portfolio.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">All-Time Profit</span>
          <span className="font-semibold text-emerald-400 font-tabular">
            +${portfolio.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({portfolio.totalPLPercent}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Mode</span>
          <span className="font-semibold text-indigo-300">
            Alpaca Sandbox
          </span>
        </div>
      </div>
    </div>
  );
};
