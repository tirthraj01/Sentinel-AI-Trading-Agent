import React, { useEffect, useState } from "react";
import { Activity, Clock3, Database, Radio, Wifi, WifiOff } from "lucide-react";
import { api } from "../services/api";

const MARKET_TIME_ZONE = "America/New_York";

function getMarketState(now: Date): { label: string; detail: string; open: boolean } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sat";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const minutes = hour * 60 + minute;
  const weekdayOpen = !["Sat", "Sun"].includes(weekday);
  const open = weekdayOpen && minutes >= 570 && minutes < 960;
  return { label: open ? "MARKET OPEN" : "MARKET CLOSED", detail: `NYSE ${weekday} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ET`, open };
}

export const TerminalStatusBar: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [market, setMarket] = useState(() => getMarketState(new Date()));

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await api.getHealth();
        if (mounted) {
          setConnected(true);
          setLastRefresh(new Date());
        }
      } catch {
        if (mounted) setConnected(false);
      }
    };
    check();
    const timer = window.setInterval(() => {
      setMarket(getMarketState(new Date()));
      check();
    }, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="terminal-status-bar" aria-label="System status">
      <span className={connected ? "status-chip status-chip-positive" : "status-chip status-chip-negative"}>
        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {connected ? "BACKEND CONNECTED" : "BACKEND OFFLINE"}
      </span>
      <span className="status-chip status-chip-neutral"><Database className="h-3 w-3" />PAPER SANDBOX</span>
      <span className={market.open ? "status-chip status-chip-positive" : "status-chip status-chip-warning"}>
        <Activity className="h-3 w-3" />{market.label}
        <span className="hidden sm:inline text-slate-500">{market.detail}</span>
      </span>
      <span className="status-chip status-chip-neutral">
        <Radio className="h-3 w-3" />SSE MONITOR
      </span>
      <span className="status-chip status-chip-neutral ml-auto">
        <Clock3 className="h-3 w-3" />{lastRefresh ? `SYNC ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "SYNCING"}
      </span>
    </div>
  );
};
