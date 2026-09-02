-- ============================================================
-- SENTINEL — Supabase / PostgreSQL Initial Schema Migration
-- Version: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Accounts Table (Paper Trading Portfolio Accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  equity NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
  cash NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
  buying_power NUMERIC(14, 2) NOT NULL DEFAULT 200000.00,
  is_paper BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Positions Table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(16) NOT NULL,
  name VARCHAR(128) NOT NULL,
  shares NUMERIC(12, 4) NOT NULL DEFAULT 0,
  avg_entry_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  market_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  unrealized_pl NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unrealized_pl_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  allocation_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  side VARCHAR(16) NOT NULL DEFAULT 'long',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, symbol)
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alpaca_order_id VARCHAR(128) UNIQUE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  symbol VARCHAR(16) NOT NULL,
  side VARCHAR(8) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  shares NUMERIC(12, 4) NOT NULL,
  order_type VARCHAR(16) NOT NULL DEFAULT 'market' CHECK (order_type IN ('market', 'limit')),
  limit_price NUMERIC(12, 2),
  estimated_price NUMERIC(12, 2),
  executed_price NUMERIC(12, 2),
  status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'filled', 'blocked', 'canceled', 'rejected')),
  decision_id VARCHAR(128),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- 4. Trade History Table
CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  symbol VARCHAR(16) NOT NULL,
  side VARCHAR(8) NOT NULL,
  shares NUMERIC(12, 4) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Agent Decisions Table (AI Reasoning Memos & Trade Proposals)
CREATE TABLE IF NOT EXISTS agent_decisions (
  id VARCHAR(128) PRIMARY KEY,
  run_id VARCHAR(128) NOT NULL,
  symbol VARCHAR(16) NOT NULL,
  decision VARCHAR(16) NOT NULL CHECK (decision IN ('BUY', 'SELL', 'HOLD')),
  confidence NUMERIC(5, 2) NOT NULL,
  reasoning TEXT NOT NULL,
  suggested_allocation_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  suggested_shares NUMERIC(12, 4) NOT NULL DEFAULT 0,
  risk_assessment VARCHAR(16) NOT NULL DEFAULT 'LOW',
  market_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  news_sentiment JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'ANALYSIS_ONLY',
  alpaca_order_id VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Risk Evaluations Table (Deterministic Rule Verdicts)
CREATE TABLE IF NOT EXISTS risk_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id VARCHAR(128) REFERENCES agent_decisions(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Agent Logs / Activity Table
CREATE TABLE IF NOT EXISTS agent_logs (
  id VARCHAR(128) PRIMARY KEY,
  run_id VARCHAR(128) NOT NULL,
  stage VARCHAR(32) NOT NULL CHECK (stage IN ('OBSERVE', 'ANALYZE', 'DECIDE', 'RISK_CHECK', 'EXECUTION', 'COMPLETE', 'BLOCKED')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'info' CHECK (status IN ('success', 'warning', 'error', 'info')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Risk Rules Configuration Table
CREATE TABLE IF NOT EXISTS risk_rules (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  limit_value NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(16) NOT NULL DEFAULT '%',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table (Immutable Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(128),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_submitted_at ON orders(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_symbol ON agent_decisions(symbol);
CREATE INDEX IF NOT EXISTS idx_decisions_run_id ON agent_decisions(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_run_id ON agent_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);
