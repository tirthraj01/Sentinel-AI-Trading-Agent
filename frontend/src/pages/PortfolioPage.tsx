import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DollarSign, Wallet, Shield, Layers, RefreshCw } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PortfolioChart } from "../components/PortfolioChart";
import { PortfolioAllocationChart } from "../components/PortfolioAllocationChart";
import { PositionTable } from "../components/PositionTable";
import { PositionDrawer } from "../components/PositionDrawer";
import { Position } from "../types";
import { usePortfolio } from "../hooks/usePortfolio";
import { usePositions } from "../hooks/usePositions";

export const PortfolioPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const { summary: portfolio, loading: portfolioLoading, refetch: refetchPortfolio } = usePortfolio();
  const { positions, loading: positionsLoading, refetch: refetchPositions } = usePositions();

  const handleSelectAsset = (symbol: string) => {
    const pos = positions.find((p) => p.symbol === symbol);
    if (pos) {
      setSelectedPosition(pos);
    }
  };

  const handleRefresh = () => {
    refetchPortfolio();
    refetchPositions();
  };

  const investedEquity = portfolio.equity - portfolio.cash;
  const maxExposure = positions.length > 0 ? Math.max(...positions.map((p) => p.allocationPercent)) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Portfolio Analytics & Allocation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            In-depth capital allocation, liquidity metrics, and portfolio concentration
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={portfolioLoading || positionsLoading}
          className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh Portfolio"
        >
          <RefreshCw className={`h-4 w-4 ${portfolioLoading || positionsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Equity"
          value={`$${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={`+${portfolio.totalPLPercent}% All-Time`}
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={[{ val: 100 }, { val: 102 }, { val: 103 }, { val: 104.8 }]}
        />
        <MetricCard
          label="Liquid Cash"
          value={`$${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption={`${((portfolio.cash / (portfolio.equity || 1)) * 100).toFixed(1)}% Portfolio Liquidity`}
          icon={<Wallet className="h-4 w-4" />}
          sparklineData={[{ val: 40 }, { val: 41 }, { val: 40.5 }, { val: 40.1 }]}
        />
        <MetricCard
          label="Active Position Value"
          value={`$${investedEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption={`${positions.length} Active Equities`}
          icon={<Layers className="h-4 w-4" />}
          sparklineData={[{ val: 60 }, { val: 61 }, { val: 62.5 }, { val: 62.7 }]}
        />
        <MetricCard
          label="Risk Exposure Index"
          value={`Max ${maxExposure.toFixed(1)}%`}
          caption="Single asset ceiling: 10%"
          icon={<Shield className="h-4 w-4" />}
          sparklineData={[{ val: 7 }, { val: 7.5 }, { val: 8.2 }, { val: maxExposure }]}
        />
      </div>

      {/* Equity Curve Chart */}
      <PortfolioChart portfolio={portfolio} />

      {/* Interactive Donut Allocation Chart */}
      <PortfolioAllocationChart onSelectAsset={handleSelectAsset} />

      {/* Positions Table */}
      <PositionTable
        positions={positions}
        onAnalyzeSymbol={(sym) => onOpenAnalysis(sym)}
        onSelectPosition={(pos) => setSelectedPosition(pos)}
      />

      {/* Slide-over Position Drawer */}
      <PositionDrawer
        position={selectedPosition}
        isOpen={Boolean(selectedPosition)}
        onClose={() => setSelectedPosition(null)}
        onRunAnalysis={(sym) => onOpenAnalysis(sym)}
      />
    </div>
  );
};
