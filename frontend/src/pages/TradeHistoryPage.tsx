import React, { useState } from "react";
import { History, RefreshCw, Send, PlusCircle, AlertCircle } from "lucide-react";
import { TradeTable } from "../components/TradeTable";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useTradeHistory } from "../hooks/useTradeHistory";
import { useToast } from "../context/ToastContext";

export const TradeHistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<string>("ALL");
  const { trades, loading, submitting, error, refetch, submitTrade } = useTradeHistory();
  const { success, error: toastError } = useToast();

  // Manual trade drawer / state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [symbol, setSymbol] = useState("NVDA");
  const [shares, setShares] = useState(5);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");

  const filteredTrades = trades.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "FILLED") return t.status === "filled";
    if (filter === "BLOCKED") return t.status === "blocked";
    return true;
  });

  const filledCount = trades.filter((t) => t.status === "filled").length;
  const blockedCount = trades.filter((t) => t.status === "blocked").length;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTrade({
        symbol: symbol.toUpperCase(),
        side,
        shares: Number(shares),
        orderType: "market",
      });
      success("Order Placed", `Paper order for ${shares} ${symbol.toUpperCase()} submitted.`);
      setShowOrderForm(false);
      refetch();
    } catch (err) {
      toastError("Order Failed", (err as Error).message);
    }
  };

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

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh trades"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Paper Order</span>
          </button>
        </div>
      </div>

      {/* Manual Paper Order Form */}
      {showOrderForm && (
        <form
          onSubmit={handleSubmitOrder}
          className="glass-panel rounded-3xl p-5 border border-indigo-500/30 bg-indigo-950/20 animate-in slide-in-from-top-3 flex flex-col sm:flex-row items-end gap-3"
        >
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500/50 font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Shares</label>
            <input
              type="number"
              min="1"
              value={shares}
              onChange={(e) => setShares(Number(e.target.value))}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "Submitting..." : "Submit to Alpaca Paper"}</span>
          </button>
        </form>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-amber-200 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Notice: {error}. Showing recent cached order history.</span>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 bg-[#12141A] p-1 rounded-2xl border border-white/10 self-start sm:self-auto w-fit">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
            filter === "ALL"
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Orders ({trades.length})
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
          Risk Vetoed ({blockedCount})
        </button>
      </div>

      {loading && trades.length === 0 ? (
        <LoadingSkeleton type="table" />
      ) : (
        <TradeTable trades={filteredTrades} />
      )}
    </div>
  );
};
