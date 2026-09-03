import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export const BackendHealthBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      await api.getHealth();
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-rose-950/80 border-b border-rose-500/40 text-rose-200 px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center gap-2 max-w-2xl">
        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
        <span>
          <strong>Backend Service Offline:</strong> Terminal running on fallback cache. Start the backend with{" "}
          <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-rose-300">npm run dev</code> in{" "}
          <code className="font-mono text-rose-300">backend/</code> for live Alpaca synchronization.
        </span>
      </div>

      <button
        onClick={checkHealth}
        disabled={isChecking}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-200 font-semibold transition-all shrink-0 ml-3"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
        <span>{isChecking ? "Checking..." : "Retry Connection"}</span>
      </button>
    </div>
  );
};
