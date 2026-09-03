import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { RiskStatus } from "../types";
import { MOCK_RISK_STATUS } from "../data/mockData";

export function useRiskStatus(pollIntervalMs = 15000) {
  const [riskStatus, setRiskStatus] = useState<RiskStatus>(MOCK_RISK_STATUS);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskStatus = useCallback(async () => {
    try {
      const data = await api.getRiskStatus();
      setRiskStatus(data);
      if (data.killSwitchActive !== undefined) {
        setKillSwitchActive(data.killSwitchActive);
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleKillSwitch = useCallback(async (active: boolean) => {
    try {
      const res = await api.toggleKillSwitch(active);
      setKillSwitchActive(res.killSwitchActive);
      return res;
    } catch (err) {
      console.error("Failed to toggle kill switch:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRiskStatus();
    if (pollIntervalMs > 0) {
      const timer = setInterval(fetchRiskStatus, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchRiskStatus, pollIntervalMs]);

  return {
    riskStatus,
    killSwitchActive,
    loading,
    error,
    refetch: fetchRiskStatus,
    toggleKillSwitch,
  };
}
