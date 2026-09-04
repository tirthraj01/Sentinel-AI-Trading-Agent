// Vercel Serverless Function Handler for SENTINEL API
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Parse path
  const url = req.url || "/";
  const cleanPath = url.replace(/^\/api\/?/, "").split("?")[0].replace(/\/$/, "");

  // In-memory data store for serverless instance
  const portfolio = {
    equity: 104850.25,
    cash: 42120.8,
    buyingPower: 84241.6,
    dailyPL: 1420.5,
    dailyPLPercent: 1.37,
    totalPL: 4850.25,
    totalPLPercent: 4.85,
    portfolioHistory: [
      { time: "09:30", value: 103429.75 },
      { time: "10:00", value: 103850.0 },
      { time: "10:30", value: 103600.25 },
      { time: "11:00", value: 104100.0 },
      { time: "11:30", value: 103950.5 },
      { time: "12:00", value: 104250.0 },
      { time: "12:30", value: 104400.75 },
      { time: "13:00", value: 104150.0 },
      { time: "13:30", value: 104500.25 },
      { time: "14:00", value: 104650.0 },
      { time: "14:30", value: 104350.5 },
      { time: "15:00", value: 104720.0 },
      { time: "15:30", value: 104850.25 },
    ],
  };

  const positions = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 40,
      avgEntryPrice: 218.4,
      currentPrice: 228.65,
      marketValue: 9146.0,
      unrealizedPL: 410.0,
      unrealizedPLPercent: 4.69,
      allocationPercent: 8.72,
      side: "long",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 65,
      avgEntryPrice: 118.2,
      currentPrice: 128.9,
      marketValue: 8378.5,
      unrealizedPL: 695.5,
      unrealizedPLPercent: 9.05,
      allocationPercent: 7.99,
      side: "long",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 18,
      avgEntryPrice: 441.5,
      currentPrice: 448.25,
      marketValue: 8068.5,
      unrealizedPL: 121.5,
      unrealizedPLPercent: 1.53,
      allocationPercent: 7.69,
      side: "long",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      shares: 42,
      avgEntryPrice: 184.2,
      currentPrice: 186.4,
      marketValue: 7828.8,
      unrealizedPL: 92.4,
      unrealizedPLPercent: 1.19,
      allocationPercent: 7.46,
      side: "long",
    },
  ];

  const stocks = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 128.9,
      change: 4.25,
      changePercent: 3.41,
      volume: "52.4M",
      high: 130.15,
      low: 124.8,
      pe: 72.4,
      marketCap: "3.16T",
      sector: "Technology",
      chartData: [
        { time: "09:30", price: 125.1 },
        { time: "11:30", price: 127.4 },
        { time: "13:30", price: 126.8 },
        { time: "15:30", price: 128.9 },
      ],
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 228.65,
      change: 1.85,
      changePercent: 0.82,
      volume: "48.1M",
      high: 229.4,
      low: 226.5,
      pe: 34.2,
      marketCap: "3.48T",
      sector: "Technology",
      chartData: [
        { time: "09:30", price: 226.9 },
        { time: "15:30", price: 228.65 },
      ],
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 254.3,
      change: -6.2,
      changePercent: -2.38,
      volume: "68.3M",
      high: 262.1,
      low: 251.4,
      pe: 68.9,
      marketCap: "810.5B",
      sector: "Consumer Cyclical",
      chartData: [
        { time: "09:30", price: 261.5 },
        { time: "15:30", price: 254.3 },
      ],
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 448.25,
      change: 3.1,
      changePercent: 0.7,
      volume: "21.5M",
      high: 450.2,
      low: 444.8,
      pe: 36.8,
      marketCap: "3.33T",
      sector: "Technology",
      chartData: [
        { time: "09:30", price: 445.0 },
        { time: "15:30", price: 448.25 },
      ],
    },
  ];

  const riskRules = [
    {
      id: "rule-1",
      name: "Max Position Size",
      description: "Maximum capital allocation permissible for any individual equity holding",
      limit: 10.0,
      currentValue: 8.72,
      unit: "%",
      isViolation: false,
    },
    {
      id: "rule-2",
      name: "Max Single Order Size",
      description: "Maximum capital commitment permissible on any single trade order",
      limit: 5.0,
      currentValue: 1.29,
      unit: "%",
      isViolation: false,
    },
    {
      id: "rule-3",
      name: "Max Daily Drawdown",
      description: "Intraday portfolio loss threshold triggering emergency platform freeze",
      limit: 2.0,
      currentValue: -0.42,
      unit: "%",
      isViolation: false,
    },
    {
      id: "rule-4",
      name: "Minimum AI Confidence",
      description: "Mandatory algorithmic conviction floor required for order execution",
      limit: 70.0,
      currentValue: 86.0,
      unit: "%",
      isViolation: false,
    },
    {
      id: "rule-5",
      name: "Max Daily Trades",
      description: "Maximum number of filled trades allowed per market trading session",
      limit: 10,
      currentValue: 3,
      unit: "trades",
      isViolation: false,
    },
    {
      id: "rule-6",
      name: "Max Sector Exposure",
      description: "Maximum capital allocation permissible within a single sector",
      limit: 40.0,
      currentValue: 31.6,
      unit: "%",
      isViolation: false,
    },
  ];

  // Route Dispatcher
  switch (cleanPath) {
    case "health":
      return res.status(200).json({
        success: true,
        data: {
          status: "healthy",
          service: "sentinel-backend",
          version: "0.1.0",
          paperTrading: true,
          timestamp: new Date().toISOString(),
          uptimeSeconds: 3600,
        },
      });

    case "portfolio":
      return res.status(200).json({
        success: true,
        data: {
          account: {
            id: "alpaca-paper-acc-sentinel-01",
            status: "ACTIVE",
            currency: "USD",
            buying_power: "84241.60",
            cash: "42120.80",
            portfolio_value: "104850.25",
            pattern_day_trader: false,
            is_paper: true,
          },
          summary: portfolio,
        },
      });

    case "positions":
      return res.status(200).json({
        success: true,
        data: positions,
      });

    case "market":
      return res.status(200).json({
        success: true,
        data: stocks,
      });

    case "trades":
      if (req.method === "POST") {
        const body = req.body || {};
        return res.status(201).json({
          success: true,
          data: {
            id: `trade-paper-${Date.now()}`,
            symbol: body.symbol || "NVDA",
            shares: body.shares || 10,
            price: body.price || 128.9,
            side: body.side || "BUY",
            type: "market",
            status: "filled",
            alpacaOrderId: `alp-ord-${Date.now()}`,
            executedAt: new Date().toISOString(),
          },
        });
      }
      return res.status(200).json({
        success: true,
        data: [
          {
            id: "trade-001",
            symbol: "NVDA",
            shares: 15,
            price: 124.5,
            side: "BUY",
            type: "market",
            status: "filled",
            decisionId: "dec-001",
            alpacaOrderId: "alpaca-ord-901",
            executedAt: new Date(Date.now() - 3600000).toISOString(),
            riskSnapshot: { approved: true, riskScore: 18 },
          },
          {
            id: "trade-002",
            symbol: "TSLA",
            shares: 40,
            price: 258.1,
            side: "BUY",
            type: "market",
            status: "blocked",
            decisionId: "dec-002",
            executedAt: new Date(Date.now() - 7200000).toISOString(),
            riskSnapshot: {
              approved: false,
              riskScore: 84,
              vetoReason: "Position size would exceed 10% maximum portfolio allocation ceiling",
            },
          },
        ],
      });

    case "agent/decisions":
      return res.status(200).json({
        success: true,
        data: [
          {
            id: "dec-001",
            symbol: "NVDA",
            action: "BUY",
            confidence: 88.5,
            reasoning:
              "Institutional consolidation at $125 support confirmed with 3.4x volume surge on Blackwell architecture data center demand.",
            catalyst: "Data center revenue acceleration and record gross margin expansion",
            riskLevel: "LOW",
            shares: 15,
            targetPrice: 145.0,
            stopLoss: 119.5,
            status: "APPROVED_EXECUTED",
            alpacaOrderId: "alpaca-ord-901",
            riskCheckDetails: [
              { ruleName: "Max Position Size", passed: true, message: "Resulting position: 7.99% <= 10.0%" },
              { ruleName: "Minimum AI Confidence", passed: true, message: "Conviction: 88.5% >= 70.0%" },
            ],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "dec-002",
            symbol: "TSLA",
            action: "BUY",
            confidence: 76.0,
            reasoning:
              "Robotaxi momentum and energy storage backlog. However, proposed order exceeds single asset ceiling.",
            catalyst: "Q3 delivery beat and autonomous fleet preview",
            riskLevel: "CRITICAL",
            shares: 40,
            targetPrice: 285.0,
            stopLoss: 242.0,
            status: "BLOCKED_BY_RISK",
            riskCheckDetails: [
              { ruleName: "Max Position Size", passed: false, message: "Resulting allocation: 19.8% > 10.0% ceiling" },
            ],
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      });

    case "agent/activity":
      return res.status(200).json({
        success: true,
        data: [
          {
            id: "act-01",
            runId: "run-nvda-latest",
            stage: "OBSERVE",
            timestamp: new Date().toISOString(),
            details: "Synthesizing market depth, tape speed, and macro flows for NVDA",
          },
          {
            id: "act-02",
            runId: "run-nvda-latest",
            stage: "ANALYZE",
            timestamp: new Date().toISOString(),
            details: "Bullish RSI divergence detected on 15m timeframe. Volume breakout confirmed.",
          },
          {
            id: "act-03",
            runId: "run-nvda-latest",
            stage: "DECIDE",
            timestamp: new Date().toISOString(),
            details: "Formulated BUY recommendation (88.5% conviction) for 15 shares @ $128.90",
          },
          {
            id: "act-04",
            runId: "run-nvda-latest",
            stage: "RISK_CHECK",
            timestamp: new Date().toISOString(),
            details: "Evaluating 6 deterministic rules. All checks passed. Zero violations.",
          },
          {
            id: "act-05",
            runId: "run-nvda-latest",
            stage: "EXECUTE",
            timestamp: new Date().toISOString(),
            details: "Paper order alpaca-ord-901 submitted to Alpaca Paper sandbox. Filled.",
          },
        ],
      });

    case "agent/analyze": {
      const symbol = (req.body?.symbol || "NVDA").toUpperCase();
      const isTSLA = symbol === "TSLA";

      return res.status(200).json({
        success: true,
        data: {
          id: `dec-${Date.now()}`,
          symbol,
          action: "BUY",
          confidence: isTSLA ? 74.0 : 86.5,
          reasoning: isTSLA
            ? "Momentum trade identified; however, capital sizing breaches position concentration guardrails."
            : `Strong institutional accumulation on ${symbol} with rising momentum and positive sentiment score.`,
          catalyst: isTSLA ? "EV delivery volume guidance" : "Blackwell hyperscaler enterprise deployment",
          riskLevel: isTSLA ? "HIGH" : "LOW",
          shares: isTSLA ? 40 : 10,
          targetPrice: isTSLA ? 280.0 : 145.0,
          stopLoss: isTSLA ? 240.0 : 119.5,
          status: isTSLA ? "BLOCKED_BY_RISK" : "APPROVED_EXECUTED",
          alpacaOrderId: isTSLA ? undefined : `alp-ord-${Date.now()}`,
          riskCheckDetails: [
            {
              ruleName: "Max Position Size",
              passed: !isTSLA,
              message: isTSLA ? "Exposure: 19.8% > 10.0% limit" : "Exposure: 7.99% <= 10.0% limit",
            },
            {
              ruleName: "Minimum AI Confidence",
              passed: true,
              message: isTSLA ? "Conviction: 74.0% >= 70.0%" : "Conviction: 86.5% >= 70.0%",
            },
            {
              ruleName: "Max Daily Drawdown",
              passed: true,
              message: "Intraday loss: -0.42% < 2.0% circuit breaker limit",
            },
          ],
          createdAt: new Date().toISOString(),
        },
      });
    }

    case "risk/status":
      return res.status(200).json({
        success: true,
        data: {
          rules: riskRules,
          killSwitchActive: false,
          circuitBreakerActive: false,
          currentDailyLossPercent: 0.42,
          dailyTradesCount: 3,
          maxDailyTrades: 10,
        },
      });

    case "risk/evaluate": {
      const body = req.body || {};
      const shares = body.shares || 10;
      const price = body.price || 150;
      const isOversized = shares * price > 10485;

      return res.status(200).json({
        success: true,
        data: {
          approved: !isOversized,
          riskLevel: isOversized ? "HIGH" : "LOW",
          checks: [
            {
              ruleName: "Max Position Size",
              passed: !isOversized,
              limit: 10.0,
              currentValue: isOversized ? 15.2 : 7.99,
              unit: "%",
              message: isOversized ? "Projected exposure > 10% ceiling" : "Within safety boundary",
            },
          ],
          reasons: isOversized ? ["Position size would breach 10% single-asset limit."] : [],
          evaluatedAt: new Date().toISOString(),
        },
      });
    }

    case "risk/kill-switch":
      return res.status(200).json({
        success: true,
        data: {
          killSwitchActive: !!req.body?.active,
          message: req.body?.active ? "Kill switch activated" : "Kill switch disarmed",
        },
      });

    case "demo/reset":
      return res.status(200).json({
        success: true,
        message: "Portfolio baseline reset to $100,000.",
        data: {
          portfolio: {
            equity: 100000.0,
            cash: 100000.0,
            buyingPower: 200000.0,
            dailyPL: 0.0,
            dailyPLPercent: 0.0,
            totalPL: 0.0,
            totalPLPercent: 0.0,
          },
          positionsCount: 0,
          tradesCount: 0,
          killSwitchActive: false,
        },
      });

    case "demo/trigger-scenario": {
      const scenario = req.body?.scenario || "A";
      if (scenario === "A") {
        return res.status(200).json({
          success: true,
          scenario: "A",
          data: {
            symbol: "NVDA",
            status: "APPROVED_EXECUTED",
            alpacaOrderId: `alp-ord-demo-${Date.now()}`,
            decision: "BUY",
            confidence: 86.5,
          },
        });
      } else if (scenario === "B") {
        return res.status(200).json({
          success: true,
          scenario: "B",
          data: {
            symbol: "TSLA",
            status: "BLOCKED_BY_RISK",
            decision: "BUY",
            confidence: 76.0,
            message: "Breached 10% position limit.",
          },
        });
      } else if (scenario === "C") {
        return res.status(200).json({
          success: true,
          scenario: "C",
          data: {
            symbol: "AAPL",
            status: "BLOCKED_BY_RISK",
            decision: "BUY",
            confidence: 64.0,
            message: "Conviction 64% is below 70% threshold.",
          },
        });
      } else {
        return res.status(200).json({
          success: true,
          scenario: "D",
          data: {
            symbol: "MSFT",
            status: "BLOCKED_BY_CIRCUIT_BREAKER",
            decision: "BUY",
            confidence: 94.0,
            message: "Portfolio daily drawdown 2.5% halted trading.",
          },
        });
      }
    }

    case "mcp/tools":
      return res.status(200).json({
        success: true,
        data: [
          { name: "get_account", description: "Retrieve paper account status" },
          { name: "get_positions", description: "Retrieve open paper positions" },
          { name: "get_stock_quote", description: "Fetch real-time quote" },
          { name: "evaluate_risk", description: "Deterministic mathematical evaluation" },
          { name: "submit_paper_order", description: "Submit verified paper order" },
          { name: "toggle_kill_switch", description: "Emergency freeze" },
        ],
      });

    default:
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `API endpoint /api/${cleanPath} not found.`,
        },
      });
  }
}
