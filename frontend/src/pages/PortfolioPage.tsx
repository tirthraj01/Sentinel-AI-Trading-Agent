import React from "react";
import { DollarSign, Wallet, Shield, PieChart as PieIcon, Layers } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PortfolioChart } from "../components/PortfolioChart";
import { PositionTable } from "../components/PositionTable";
import { MOCK_PORTFOLIO, MOCK_POSITIONS } from "../data/mockData";

export const PortfolioPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
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
        />
        <MetricCard
          label="Liquid Cash"
          value={`$${MOCK_PORTFOLIO.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption="40.1% Portfolio Liquidity"
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Position Value"
          value={`$${(MOCK_PORTFOLIO.equity - MOCK_PORTFOLIO.cash).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          caption="5 Active Equities"
          icon={<Layers className="h-4 w-4" />}
        />
        <MetricCard
          label="Risk Exposure Index"
          value="Low (8.7%)"
          caption="Max single asset < 10%"
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Equity Curve Chart */}
      <PortfolioChart portfolio={MOCK_PORTFOLIO} />

      {/* Asset Allocation Breakdown */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Capital Distribution & Weighting
            </h3>
          </div>
          <span className="text-xs text-slate-400">Target Max: 10% per ticker</span>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-800 mb-6">
          <div style={{ width: "40.1%" }} className="bg-slate-500" title="Cash: 40.1%" />
          <div style={{ width: "26.4%" }} className="bg-indigo-500" title="SPY: 26.4%" />
          <div style={{ width: "8.7%" }} className="bg-emerald-500" title="AAPL: 8.7%" />
          <div style={{ width: "8.6%" }} className="bg-cyan-500" title="MSFT: 8.6%" />
          <div style={{ width: "8.0%" }} className="bg-purple-500" title="NVDA: 8.0%" />
          <div style={{ width: "6.3%" }} className="bg-amber-500" title="AMZN: 6.3%" />
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Cash (USD)
            </span>
            <span className="text-sm font-bold text-white font-tabular">40.1%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> SPY Index
            </span>
            <span className="text-sm font-bold text-white font-tabular">26.4%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> AAPL
            </span>
            <span className="text-sm font-bold text-white font-tabular">8.7%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> MSFT
            </span>
            <span className="text-sm font-bold text-white font-tabular">8.6%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> NVDA
            </span>
            <span className="text-sm font-bold text-white font-tabular">8.0%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> AMZN
            </span>
            <span className="text-sm font-bold text-white font-tabular">6.3%</span>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <PositionTable positions={MOCK_POSITIONS} />
    </div>
  );
};
