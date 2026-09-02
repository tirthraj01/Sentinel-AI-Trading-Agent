import React, { useState } from "react";
import { History } from "lucide-react";
import { TradeTable } from "../components/TradeTable";
import { MOCK_TRADES } from "../data/mockData";

export const TradeHistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredTrades = MOCK_TRADES.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "FILLED") return t.status === "filled";
    if (filter === "BLOCKED") return t.status === "blocked";
    return true;
  });

  const filledCount = MOCK_TRADES.filter((t) => t.status === "filled").length;
  const blockedCount = MOCK_TRADES.filter((t) => t.status === "blocked").length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Order & Execution History
              </h1>
              <p className="text-xs text-slate-400">
                Immutable audit ledger of Alpaca paper orders and risk-intercepted proposals
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#12141A] p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              filter === "ALL"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Orders ({MOCK_TRADES.length})
          </button>
          <button
            onClick={() => setFilter("FILLED")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              filter === "FILLED"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Filled ({filledCount})
          </button>
          <button
            onClick={() => setFilter("BLOCKED")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              filter === "BLOCKED"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Blocked by Risk ({blockedCount})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <TradeTable trades={filteredTrades} />
    </div>
  );
};
