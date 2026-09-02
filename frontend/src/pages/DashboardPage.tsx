import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PortfolioChart } from "../components/PortfolioChart";
import { AIDecisionCard } from "../components/AIDecisionCard";
import { RiskStatusCard } from "../components/RiskStatusCard";
import { PositionTable } from "../components/PositionTable";
import { TradeTable } from "../components/TradeTable";
import { AgentTimeline } from "../components/AgentTimeline";
import { StockCard } from "../components/StockCard";
import {
  MOCK_PORTFOLIO,
  MOCK_POSITIONS,
  MOCK_STOCKS,
  MOCK_DECISIONS,
  MOCK_TRADES,
  MOCK_ACTIVITIES,
  MOCK_RISK_RULES,
} from "../data/mockData";

export const DashboardPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & System Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trading Terminal
            </h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 font-mono font-semibold">
              v1.0 Paper
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time portfolio surveillance with AI market intelligence and deterministic risk guards
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAnalysis("NVDA")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Agent Cycle</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Portfolio Value"
          value={`$${MOCK_PORTFOLIO.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={`+$${MOCK_PORTFOLIO.dailyPL.toFixed(2)}`}
          changeType="positive"
          caption="Today's Gain"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Daily P/L"
          value={`+${MOCK_PORTFOLIO.dailyPLPercent}%`}
          change="+1.37% vs S&P"
          changeType="positive"
          caption="Unrealized Session"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Return"
          value={`+${MOCK_PORTFOLIO.totalPLPercent}%`}
          change={`+$${MOCK_PORTFOLIO.totalPL.toLocaleString()}`}
          changeType="positive"
          caption="Since Inception"
          icon={<Percent className="h-4 w-4" />}
        />
        <MetricCard
          label="Available Paper Cash"
          value={`$${MOCK_PORTFOLIO.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="$84,241 Buying Pwr"
          changeType="neutral"
          caption="Ready Capital"
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      {/* Main Chart Section */}
      <PortfolioChart portfolio={MOCK_PORTFOLIO} />

      {/* AI Intelligence & Risk Posture Dual Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIDecisionCard
          decision={MOCK_DECISIONS[0]}
          onInspectDetails={() => onOpenAnalysis(MOCK_DECISIONS[0].symbol)}
        />
        <RiskStatusCard
          evaluation={MOCK_DECISIONS[0].riskResult}
          rules={MOCK_RISK_RULES}
        />
      </div>

      {/* Watchlist & Market Overview Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Watchlist & Market Overview
            </h2>
            <p className="text-xs text-slate-400">
              Live market snapshots ready for agent screening
            </p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
            <span>5 Tracked Tickers</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_STOCKS.slice(0, 3).map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onAnalyze={(sym) => onOpenAnalysis(sym)}
            />
          ))}
        </div>
      </div>

      {/* Open Positions Table */}
      <PositionTable
        positions={MOCK_POSITIONS}
        onAnalyzeSymbol={(sym) => onOpenAnalysis(sym)}
      />

      {/* Recent Trades & Agent Timeline Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeTable trades={MOCK_TRADES.slice(0, 4)} />
        <AgentTimeline activities={MOCK_ACTIVITIES.slice(0, 5)} />
      </div>
    </div>
  );
};
