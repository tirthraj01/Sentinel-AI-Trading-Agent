import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

interface RiskMeterProps {
  currentPct: number;
  maxLimit?: number;
  showLabels?: boolean;
  size?: "sm" | "md";
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  currentPct,
  maxLimit = 10.0,
  showLabels = true,
  size = "md",
}) => {
  const usageRatio = Math.min((currentPct / maxLimit) * 100, 100);

  // Status tiers
  let status: "safe" | "watch" | "near_limit" = "safe";
  let color = "bg-emerald-400";
  let textColor = "text-emerald-400";
  let label = "Safe";
  let Icon = ShieldCheck;

  if (currentPct >= 8.5) {
    status = "near_limit";
    color = "bg-rose-400";
    textColor = "text-rose-400";
    label = "Near Limit";
    Icon = AlertOctagon;
  } else if (currentPct >= 7.0) {
    status = "watch";
    color = "bg-amber-400";
    textColor = "text-amber-400";
    label = "Watch";
    Icon = AlertTriangle;
  }

  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="w-full space-y-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-tabular">
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${textColor}`} />
            <span className="text-slate-400 text-[11px]">
              Exposure: <strong className="text-white">{currentPct.toFixed(1)}%</strong> / {maxLimit}%
            </span>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              status === "near_limit"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : status === "watch"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {label}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full bg-slate-800 rounded-full ${barHeight} overflow-hidden`}>
        <div
          className={`${barHeight} rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${usageRatio}%` }}
        />
      </div>
    </div>
  );
};
