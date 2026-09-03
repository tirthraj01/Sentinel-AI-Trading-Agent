import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { PortfolioSummary } from "../types";
import { MOCK_PORTFOLIO } from "../data/mockData";

export function usePortfolio(pollIntervalMs = 15000) {
  const [summary, setSummary] = useState<PortfolioSummary>(MOCK_PORTFOLIO);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await api.getPortfolio();
      setSummary(data.summary);
      setAccount(data.account);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchPortfolio, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchPortfolio, pollIntervalMs]);

  return { summary, account, loading, error, refetch: fetchPortfolio };
}
