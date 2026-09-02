# SENTINEL — Frontend Architecture & Design System

---

## 1. Visual Design Philosophy

SENTINEL's visual identity draws inspiration from the refined minimalism of modern Web3 interfaces (such as Uniswap) fused with the high-density information architecture of an institutional trading terminal.

### Visual Pillars:
* **Deep Space Obsidian Palette:** Pure dark background (`#0A0B0E`), elevated card surfaces (`#12141A`), soft borders (`rgba(255, 255, 255, 0.08)`), and luminous status accents.
* **Semantic Trading Colors:**
  * **Bullish / Approved / Success:** Emerald Cyan (`#10B981` / `#06D6A0`)
  * **Bearish / Blocked / Warning:** Crimson Rose (`#EF4444` / `#F43F5E`)
  * **AI Reasoning / Neutral:** Electric Indigo / Violet (`#6366F1` / `#8B5CF6`)
  * **Risk Caution / Holding:** Amber Sun (`#F59E0B`)
* **Typography:** Clean geometric sans-serif (`Inter` or system sans) with tabular figures for financial values so numbers align crisply without jittering.
* **Refined Micro-interactions:** Glassmorphism backdrop blurs, soft hover scale, gradient pill badges, and smooth state transitions.

---

## 2. Component Hierarchy & Map

```
App
 ├── Navbar (Brand, Live Market Indicator, Paper Badge, Quick Search, Wallet/Account Summary)
 ├── Sidebar (Collapsible navigation with active indicator glow)
 └── AppLayout
      ├── Page Router
      │    ├── DashboardPage
      │    │    ├── MetricCardsGrid (Portfolio Value, Day P/L, Total Return, Cash, Exposure)
      │    │    ├── ChartContainer (Equity curve, Benchmark comparison, timeframe pills)
      │    │    ├── AIHeroDecisionCard (Latest signal, BUY/SELL/HOLD, Confidence gauge, Reasoning)
      │    │    ├── RiskPostureCard (Active rules status, Passed/Failed checks meter)
      │    │    ├── OpenPositionsTable (Symbols, avg entry, current price, unrealized P/L)
      │    │    └── AgentTimelineWidget (Live event feed: Observe -> Risk -> Order)
      │    │
      │    ├── MarketsPage (Watchlist, market movers, technical signals, search)
      │    ├── PortfolioPage (Deep breakdown, asset allocation donut chart, cash analysis)
      │    ├── PositionsPage (Detailed open & closed positions, target exit, stop loss)
      │    ├── AIAgentPage (Agent trigger panel, custom prompt overrides, deep reasoning trace)
      │    ├── RiskEnginePage (Interactive rule thresholds, simulation sandbox, blocked log)
      │    ├── TradeHistoryPage (Full audit table, Alpaca order IDs, execution timestamps)
      │    ├── AgentActivityPage (Step-by-step transparency waterfall of all agent runs)
      │    └── SettingsPage (API configuration status, paper trading safety toggles)
      │
      └── Global Modals & Notifications
           ├── TradeApprovalModal (Interactive breakdown of approved vs blocked orders)
           └── ToastNotificationCenter
```

---

## 3. UI State Handling Standard

Every data-driven component implements 5 explicit states:

1. **Loading State:** Shimmer skeleton cards and pulse indicators (`"Sentinel is analyzing market conditions..."`).
2. **Success State:** Crisp data presentation with glowing badge indicators.
3. **Empty State:** Friendly graphic, explanatory text, and an actionable trigger button (e.g., *"No paper trades yet. Trigger an AI analysis to discover trade setups."*).
4. **Error State:** Clear, non-technical explanation with retry trigger and technical error detail dropdown (`"Market data feed timed out. Retry now."`).
5. **Disabled State:** Explicit tooltip explaining why an action is blocked (e.g., *"Cannot place paper order: Market is closed"* or *"Risk check failed"*).

---

## 4. Reusable Component Inventory

* `MetricCard`: Displays large financial metrics with secondary percentage deltas.
* `Badge`: Pill badges for `APPROVED`, `BLOCKED`, `BUY`, `SELL`, `HOLD`, `PENDING`.
* `ConfidenceGauge`: Radial or linear progress bar showing AI certainty (0–100%).
* `TradeTable`: Sortable, filterable table for historical and active positions.
* `AgentTimeline`: Vertical visual stepper documenting the exact chronology of decisions.
* `RiskRuleMeter`: Visual gauge showing current value against threshold ceiling.
