import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { AgentDecision } from "../types";
import { MOCK_DECISIONS } from "../data/mockData";

export function useAgentDecisions(symbol?: string, pollIntervalMs = 15000) {
  const [decisions, setDecisions] = useState<AgentDecision[]>(MOCK_DECISIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    try {
      const data = await api.getAgentDecisions({ symbol });
      setDecisions(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const triggerAnalysis = useCallback(
    async (targetSymbol: string, forceScenario?: "APPROVED" | "BLOCKED" | "AUTO") => {
      setAnalyzing(true);
      try {
        const newDecision = await api.analyzeSymbol({
          symbol: targetSymbol,
          forceScenario,
        });
        setDecisions((prev) => [newDecision, ...prev.filter((d) => d.id !== newDecision.id)]);
        return newDecision;
      } finally {
        setAnalyzing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDecisions();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchDecisions, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchDecisions, pollIntervalMs]);

  return {
    decisions,
    loading,
    analyzing,
    error,
    refetch: fetchDecisions,
    triggerAnalysis,
  };
}
