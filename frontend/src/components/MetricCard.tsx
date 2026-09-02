import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  caption?: string;
  icon?: React.ReactNode;
  sparklineData?: { val: number }[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeType = "neutral",
  caption,
  icon,
  sparklineData,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-5 relative overflow-hidden group border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
      {/* Soft luminous top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-tabular">
          {value}
        </span>

        {/* Optional mini sparkline */}
        {sparklineData && (
          <div className="h-8 w-20 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`mc-grad-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={changeType === "positive" ? "#10B981" : "#6366F1"}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={changeType === "positive" ? "#10B981" : "#6366F1"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke={changeType === "positive" ? "#10B981" : "#6366F1"}
                  strokeWidth={1.5}
                  fill={`url(#mc-grad-${label.replace(/\s+/g, "")})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {(change || caption) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg ${
                changeType === "positive"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : changeType === "negative"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
              }`}
            >
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
              {changeType === "neutral" && <Minus className="h-3 w-3" />}
              <span>{change}</span>
            </span>
          )}
          {caption && <span className="text-slate-400 truncate">{caption}</span>}
        </div>
      )}
    </div>
  );
};
