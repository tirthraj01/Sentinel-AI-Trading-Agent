import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { StockQuote } from "../types";
import { MOCK_STOCKS } from "../data/mockData";

export function useMarketData(symbol?: string, pollIntervalMs = 15000) {
  const [stocks, setStocks] = useState<StockQuote[]>(MOCK_STOCKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    try {
      const data = await api.getMarketQuotes(symbol);
      setStocks(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchMarket();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchMarket, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchMarket, pollIntervalMs]);

  return { stocks, loading, error, refetch: fetchMarket };
}
