import React, { useState } from "react";
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
import { MarketPulse } from "../components/MarketPulse";
import { AIDecisionCard } from "../components/AIDecisionCard";
import { RiskStatusCard } from "../components/RiskStatusCard";
import { PositionTable } from "../components/PositionTable";
import { PositionDrawer } from "../components/PositionDrawer";
import { TradeTable } from "../components/TradeTable";
import { AgentTimeline } from "../components/AgentTimeline";
import { Position } from "../types";
import { usePortfolio } from "../hooks/usePortfolio";
import { usePositions } from "../hooks/usePositions";
import { useAgentDecisions } from "../hooks/useAgentDecisions";
import { useTradeHistory } from "../hooks/useTradeHistory";
import { useAgentStream } from "../hooks/useAgentStream";
import { useRiskStatus } from "../hooks/useRiskStatus";

export const DashboardPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Live hooks connected to real backend services
  const { summary: portfolio } = usePortfolio();
  const { positions } = usePositions();
  const { decisions } = useAgentDecisions();
  const { trades } = useTradeHistory();
  const { activities } = useAgentStream(8);
  const { riskStatus } = useRiskStatus();

  const latestDecision = decisions[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & System Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trading Terminal
            </h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 font-mono font-semibold">
              Live Paper Sandbox
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
          value={`$${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={`+$${portfolio.dailyPL.toFixed(2)}`}
          changeType="positive"
          caption="Today's Gain"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={[{ val: 103 }, { val: 103.5 }, { val: 104 }, { val: 103.8 }, { val: 104.8 }]}
        />
        <MetricCard
          label="Daily P/L"
          value={`+${portfolio.dailyPLPercent}%`}
          change="+1.37% vs S&P"
          changeType="positive"
          caption="Unrealized Session"
          icon={<TrendingUp className="h-4 w-4" />}
          sparklineData={[{ val: 0.2 }, { val: 0.6 }, { val: 0.8 }, { val: 1.1 }, { val: 1.37 }]}
        />
        <MetricCard
          label="Total Return"
          value={`+${portfolio.totalPLPercent}%`}
          change={`+$${portfolio.totalPL.toLocaleString()}`}
          changeType="positive"
          caption="Since Inception"
          icon={<Percent className="h-4 w-4" />}
          sparklineData={[{ val: 1.0 }, { val: 2.1 }, { val: 3.5 }, { val: 4.2 }, { val: 4.85 }]}
        />
        <MetricCard
          label="Available Paper Cash"
          value={`$${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={`$${portfolio.buyingPower.toLocaleString()} Buying Pwr`}
          changeType="neutral"
          caption="Ready Capital"
          icon={<Wallet className="h-4 w-4" />}
          sparklineData={[{ val: 45 }, { val: 44 }, { val: 43 }, { val: 42.5 }, { val: 42.1 }]}
        />
      </div>

      {/* Main Chart Section */}
      <PortfolioChart portfolio={portfolio} />

      {/* Market Pulse Row */}
      <MarketPulse
        onSelectSymbol={(sym) => {
          const matchedPos = positions.find((p) => p.symbol === sym);
          if (matchedPos) {
            setSelectedPosition(matchedPos);
          } else {
            onOpenAnalysis(sym);
          }
        }}
      />

      {/* AI Intelligence & Risk Posture Dual Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {latestDecision && (
          <AIDecisionCard
            decision={latestDecision}
            onInspectDetails={() => onOpenAnalysis(latestDecision.symbol)}
          />
        )}
        <RiskStatusCard
          evaluation={latestDecision?.riskResult}
          rules={riskStatus.rules}
        />
      </div>

      {/* Open Positions Table */}
      <PositionTable
        positions={positions}
        onAnalyzeSymbol={(sym) => onOpenAnalysis(sym)}
        onSelectPosition={(pos) => setSelectedPosition(pos)}
      />

      {/* Recent Trades & Agent Timeline Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeTable trades={trades.slice(0, 4)} />
        <AgentTimeline activities={activities.slice(0, 5)} />
      </div>

      {/* Position Detail Slide-over Drawer */}
      <PositionDrawer
        position={selectedPosition}
        isOpen={Boolean(selectedPosition)}
        onClose={() => setSelectedPosition(null)}
        onRunAnalysis={(sym) => onOpenAnalysis(sym)}
      />
    </div>
  );
};
