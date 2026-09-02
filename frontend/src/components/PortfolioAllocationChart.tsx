import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MOCK_ALLOCATIONS } from "../data/mockData";
import { PieChart as PieIcon } from "lucide-react";

interface PortfolioAllocationChartProps {
  onSelectAsset?: (symbol: string) => void;
}

export const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({
  onSelectAsset,
}) => {
  const [hoveredAsset, setHoveredAsset] = useState<typeof MOCK_ALLOCATIONS[0] | null>(null);

  const activeAsset = hoveredAsset || MOCK_ALLOCATIONS[0];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Portfolio Asset Allocation
          </h3>
        </div>
        <span className="text-xs text-slate-400">Interactive Donut</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut Chart with Center HUD */}
        <div className="relative h-56 w-56 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_ALLOCATIONS}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={4}
                dataKey="percentage"
                onMouseEnter={(_, index) => setHoveredAsset(MOCK_ALLOCATIONS[index])}
                onClick={(_, index) => onSelectAsset?.(MOCK_ALLOCATIONS[index].symbol)}
                cursor="pointer"
              >
                {MOCK_ALLOCATIONS.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="rgba(10, 11, 14, 0.8)"
                    strokeWidth={2}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout Information */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              {activeAsset.symbol}
            </span>
            <span className="text-xl font-black text-white font-tabular">
              {activeAsset.percentage.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-tabular truncate max-w-[100px]">
              ${activeAsset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {MOCK_ALLOCATIONS.map((item) => (
            <div
              key={item.symbol}
              onClick={() => onSelectAsset?.(item.symbol)}
              onMouseEnter={() => setHoveredAsset(item)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeAsset.symbol === item.symbol
                  ? "bg-white/[0.06] border-white/20 shadow-sm"
                  : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="text-xs font-bold text-white font-mono block">
                    {item.symbol}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[130px] block">
                    {item.name}
                  </span>
                </div>
              </div>

              <div className="text-right font-tabular">
                <span className="text-xs font-bold text-white block">
                  {item.percentage}%
                </span>
                <span className="text-[10px] text-slate-400">
                  ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
