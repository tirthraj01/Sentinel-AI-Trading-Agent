import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  Sparkles,
  Star,
  BarChart3,
  Activity,
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
      <div className="dashboard-hero glass-panel rounded-[28px] p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_30%)]" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="command-pill">LIVE PAPER SANDBOX</span>
              <span className="command-pill command-pill-muted">AI SIGNALS ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-[-0.06em] text-white leading-none">
              AI Command Deck
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Institutional-grade surveillance, risk containment, and explainable execution intelligence built to defend capital and accelerate conviction.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[260px]">
            <div className="terminal-status-panel rounded-2xl p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate-400">
                <span>Market Regime</span>
                <span className="text-emerald-300">Risk-On</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-black text-white font-tabular">76%</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                  Bullish Bias
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenAnalysis("NVDA")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.35)] hover:shadow-[0_18px_35px_rgba(99,102,241,0.5)] hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Agent Cycle</span>
            </button>
          </div>
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="glass-panel rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Pinned Watchlist</p><h2 className="mt-1 text-lg font-bold text-white">Market breadth</h2></div>
            <span className="text-[11px] text-slate-500">{positions.length} active symbols</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {positions.map((position) => (
              <button key={position.symbol} onClick={() => onOpenAnalysis(position.symbol)} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/5">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{position.symbol}</span><Star className="h-3 w-3 fill-amber-300 text-amber-300" /></div>
                <div className="mt-3 font-mono text-sm text-slate-200">${position.currentPrice.toFixed(2)}</div>
                <div className={`mt-1 text-[11px] font-semibold ${position.unrealizedPL >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{position.unrealizedPL >= 0 ? "+" : ""}{position.unrealizedPLPercent.toFixed(2)}%</div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="terminal-status-panel rounded-3xl p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400"><BarChart3 className="h-3.5 w-3.5 text-cyan-300" />Exposure</div><p className="mt-3 font-mono text-2xl font-bold text-white">{positions.reduce((sum, position) => sum + position.allocationPercent, 0).toFixed(1)}%</p><p className="mt-1 text-[11px] text-slate-500">Across open positions</p></div>
          <div className="terminal-status-panel rounded-3xl p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400"><Activity className="h-3.5 w-3.5 text-emerald-300" />Drawdown</div><p className="mt-3 font-mono text-2xl font-bold text-emerald-300">0.0%</p><p className="mt-1 text-[11px] text-slate-500">Current session</p></div>
          <div className="terminal-status-panel rounded-3xl p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Benchmark</div><p className="mt-3 font-mono text-2xl font-bold text-white">+{portfolio.dailyPLPercent.toFixed(2)}%</p><p className="mt-1 text-[11px] text-slate-500">Portfolio daily return</p></div>
          <div className="terminal-status-panel rounded-3xl p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">AI confidence</div><p className="mt-3 font-mono text-2xl font-bold text-cyan-300">{latestDecision ? `${latestDecision.confidence}%` : "--"}</p><p className="mt-1 text-[11px] text-slate-500">Latest signal</p></div>
        </div>
      </section>

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
