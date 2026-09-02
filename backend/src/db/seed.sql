-- ============================================================
-- SENTINEL — Seed Data for Supabase / PostgreSQL
-- ============================================================

-- 1. Insert Paper Account
INSERT INTO accounts (id, account_number, status, currency, equity, cash, buying_power, is_paper)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'alpaca-paper-acc-sentinel-01',
  'ACTIVE',
  'USD',
  104850.25,
  42120.80,
  84241.60,
  true
) ON CONFLICT (account_number) DO UPDATE
SET equity = EXCLUDED.equity, cash = EXCLUDED.cash;

-- 2. Insert Initial Risk Rules
INSERT INTO risk_rules (id, name, description, limit_value, unit, is_active)
VALUES
  ('rule-1', 'Max Position Size', 'Maximum portfolio equity allocated to any single asset', 10.00, '%', true),
  ('rule-2', 'Max Single Trade Size', 'Maximum capital committed in a single buy transaction', 5.00, '%', true),
  ('rule-3', 'Daily Loss Circuit Breaker', 'Emergency circuit breaker that freezes trading if portfolio drops', 2.00, '%', true),
  ('rule-4', 'Minimum AI Confidence', 'Mandatory algorithmic conviction floor required for order execution', 70.00, '%', true),
  ('rule-5', 'Max Daily Trades', 'Maximum number of filled trades allowed per market trading session', 10.00, 'trades', true),
  ('rule-6', 'Max Sector Exposure', 'Maximum capital allocation permissible within a single sector', 40.00, '%', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Holdings / Positions
INSERT INTO positions (account_id, symbol, name, shares, avg_entry_price, current_price, market_value, unrealized_pl, unrealized_pl_percent, allocation_percent, side)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AAPL', 'Apple Inc.', 40, 218.40, 228.65, 9146.00, 410.00, 4.69, 8.72, 'long'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'NVDA', 'NVIDIA Corporation', 65, 118.20, 128.90, 8378.50, 695.50, 9.05, 7.99, 'long'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MSFT', 'Microsoft Corp.', 20, 432.10, 448.25, 8965.00, 323.00, 3.74, 8.55, 'long'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AMZN', 'Amazon.com Inc.', 35, 182.50, 188.70, 6604.50, 217.00, 3.40, 6.30, 'long'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SPY', 'SPDR S&P 500 ETF Trust', 50, 542.00, 552.75, 27637.50, 537.50, 1.98, 26.36, 'long')
ON CONFLICT (account_id, symbol) DO NOTHING;

-- 4. Insert Initial Agent Decision Memo (Scenario A Approved)
INSERT INTO agent_decisions (id, run_id, symbol, decision, confidence, reasoning, suggested_allocation_pct, suggested_shares, risk_assessment, market_summary, news_sentiment, status, alpaca_order_id)
VALUES (
  'dec-scenario-a',
  'run-nvda-101',
  'NVDA',
  'BUY',
  86.00,
  'Technical momentum breakout supported by heavy institutional volume (+28% vs 20-day avg). RSI at 61 confirms bullish continuation without extreme overbought signals.',
  3.50,
  25,
  'LOW',
  '{"trend": "BULLISH", "volumeAnalysis": "Above average accumulation across institutional blocks"}'::jsonb,
  '{"score": 0.82, "headline": "Hyperscalers expand generative AI datacenter capital expenditure targets", "source": "Bloomberg Technology"}'::jsonb,
  'APPROVED_EXECUTED',
  'alpaca-ord-9921'
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert Initial Risk Evaluation for Scenario A
INSERT INTO risk_evaluations (decision_id, approved, risk_level, reasons, checks)
VALUES (
  'dec-scenario-a',
  true,
  'LOW',
  '["All 6 deterministic safety rules passed successfully."]'::jsonb,
  '[
    {"name": "max_position_size", "label": "Max Position Exposure", "threshold": 10.0, "actual": 8.0, "passed": true, "unit": "%"},
    {"name": "max_single_trade", "label": "Max Single Trade Size", "threshold": 5.0, "actual": 3.1, "passed": true, "unit": "%"},
    {"name": "max_daily_loss", "label": "Max Daily Drawdown", "threshold": 2.0, "actual": 0.0, "passed": true, "unit": "%"},
    {"name": "min_ai_confidence", "label": "Min AI Confidence", "threshold": 70.0, "actual": 86.0, "passed": true, "unit": "%"},
    {"name": "max_daily_trades", "label": "Max Daily Executions", "threshold": 10, "actual": 3, "passed": true, "unit": "trades"},
    {"name": "max_sector_exposure", "label": "Max Tech Sector Cap", "threshold": 40.0, "actual": 31.6, "passed": true, "unit": "%"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- 6. Insert Initial Agent Decision Memo (Scenario B Vetoed)
INSERT INTO agent_decisions (id, run_id, symbol, decision, confidence, reasoning, suggested_allocation_pct, suggested_shares, risk_assessment, market_summary, news_sentiment, status)
VALUES (
  'dec-scenario-b',
  'run-tsla-102',
  'TSLA',
  'BUY',
  68.00,
  'Rebound setup near key support zone of $242.00. However, options volatility surface indicates elevated tail risk, and AI confidence score (68%) fails the minimum 70% threshold required for automated paper execution.',
  6.80,
  30,
  'HIGH',
  '{"trend": "SIDEWAYS", "volumeAnalysis": "Elevated sell volume following delivery report"}'::jsonb,
  '{"score": 0.41, "headline": "EV margin pressure rises amid intensifying overseas competition", "source": "Reuters Markets"}'::jsonb,
  'BLOCKED_BY_RISK'
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert Initial Risk Evaluation for Scenario B
INSERT INTO risk_evaluations (decision_id, approved, risk_level, reasons, checks)
VALUES (
  'dec-scenario-b',
  false,
  'CRITICAL',
  '["VETOED: AI confidence of 68.0% is below the mandatory 70.0% floor.", "VETOED: Proposed allocation 6.8% exceeds the 5.0% single-trade limit."]'::jsonb,
  '[
    {"name": "max_position_size", "label": "Max Position Exposure", "threshold": 10.0, "actual": 6.8, "passed": true, "unit": "%"},
    {"name": "max_single_trade", "label": "Max Single Trade Size", "threshold": 5.0, "actual": 6.8, "passed": false, "unit": "%"},
    {"name": "max_daily_loss", "label": "Max Daily Drawdown", "threshold": 2.0, "actual": 0.0, "passed": true, "unit": "%"},
    {"name": "min_ai_confidence", "label": "Min AI Confidence", "threshold": 70.0, "actual": 68.0, "passed": false, "unit": "%"},
    {"name": "max_daily_trades", "label": "Max Daily Executions", "threshold": 10, "actual": 3, "passed": true, "unit": "trades"},
    {"name": "max_sector_exposure", "label": "Max Tech Sector Cap", "threshold": 40.0, "actual": 31.6, "passed": true, "unit": "%"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;
