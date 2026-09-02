import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DollarSign, Wallet, Shield, Layers } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PortfolioChart } from "../components/PortfolioChart";
import { PortfolioAllocationChart } from "../components/PortfolioAllocationChart";
import { PositionTable } from "../components/PositionTable";
import { PositionDrawer } from "../components/PositionDrawer";
import { MOCK_PORTFOLIO, MOCK_POSITIONS } from "../data/mockData";
import { Position } from "../types";

export const PortfolioPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const handleSelectAsset = (symbol: string) => {
    const pos = MOCK_POSITIONS.find((p) => p.symbol === symbol);
    if (pos) {
      setSelectedPosition(pos);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Portfolio Analytics & Allocation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          In-depth capital allocation, liquidity metrics, and portfolio concentration
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Equity"
          value={`$${MOCK_PORTFOLIO.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+4.85% All-Time"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={[{ val: 100 }, { val: 102 }, { val: 103 }, { val: 104.8 }]}
        />
        <MetricCard
          label="Liquid Cash"
          value={`$${MOCK_PORTFOLIO.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption="40.1% Portfolio Liquidity"
          icon={<Wallet className="h-4 w-4" />}
          sparklineData={[{ val: 40 }, { val: 41 }, { val: 40.5 }, { val: 40.1 }]}
        />
        <MetricCard
          label="Active Position Value"
          value={`$${(MOCK_PORTFOLIO.equity - MOCK_PORTFOLIO.cash).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption="5 Active Equities"
          icon={<Layers className="h-4 w-4" />}
          sparklineData={[{ val: 60 }, { val: 61 }, { val: 62.5 }, { val: 62.7 }]}
        />
        <MetricCard
          label="Risk Exposure Index"
          value="Low (8.7%)"
          caption="Max single asset < 10%"
          icon={<Shield className="h-4 w-4" />}
          sparklineData={[{ val: 7 }, { val: 7.5 }, { val: 8.2 }, { val: 8.7 }]}
        />
      </div>

      {/* Equity Curve Chart */}
      <PortfolioChart portfolio={MOCK_PORTFOLIO} />

      {/* Interactive Donut Allocation Chart */}
      <PortfolioAllocationChart onSelectAsset={handleSelectAsset} />

      {/* Positions Table */}
      <PositionTable
        positions={MOCK_POSITIONS}
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
