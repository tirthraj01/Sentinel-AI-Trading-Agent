import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { Position } from "../types";
import { MOCK_POSITIONS } from "../data/mockData";

export function usePositions(pollIntervalMs = 15000) {
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchPositions, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchPositions, pollIntervalMs]);

  return { positions, loading, error, refetch: fetchPositions };
}
