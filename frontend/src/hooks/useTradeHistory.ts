import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { TradeRecord } from "../types";
import { MOCK_TRADES } from "../data/mockData";

export function useTradeHistory(symbol?: string, status?: string, pollIntervalMs = 15000) {
  const [trades, setTrades] = useState<TradeRecord[]>(MOCK_TRADES);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      const data = await api.getTrades({ symbol, status });
      setTrades(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [symbol, status]);

  const submitTrade = useCallback(
    async (params: {
      symbol: string;
      side: "BUY" | "SELL";
      shares: number;
      orderType: "market" | "limit";
      limitPrice?: number;
    }) => {
      setSubmitting(true);
      try {
        const newTrade = await api.submitTrade(params);
        setTrades((prev) => [newTrade, ...prev]);
        return newTrade;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTrades();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchTrades, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchTrades, pollIntervalMs]);

  return {
    trades,
    loading,
    submitting,
    error,
    refetch: fetchTrades,
    submitTrade,
  };
}
