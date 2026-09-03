import React, { useMemo, useState } from "react";
import { History, RefreshCw, Send, PlusCircle, AlertCircle, Download, ShieldCheck, Search, ArrowUpDown } from "lucide-react";
import { TradeTable } from "../components/TradeTable";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useTradeHistory } from "../hooks/useTradeHistory";
import { useToast } from "../context/ToastContext";
import { useMarketData } from "../hooks/useMarketData";
import { usePortfolio } from "../hooks/usePortfolio";
import { api } from "../services/api";

export const TradeHistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<string>("ALL");
  const { trades, loading, submitting, error, refetch, submitTrade } = useTradeHistory();
  const { success, error: toastError } = useToast();

  // Manual trade drawer / state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [symbol, setSymbol] = useState("NVDA");
  const [shares, setShares] = useState(5);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState(0);
  const [riskPreview, setRiskPreview] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);
  const [search, setSearch] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { stocks } = useMarketData(symbol, 0);
  const { summary: portfolio } = usePortfolio(0);
  const quote = stocks[0];
  const referencePrice = orderType === "limit" && limitPrice > 0 ? limitPrice : quote?.price || 0;
  const notional = referencePrice * Number(shares || 0);

  const filteredTrades = trades.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "FILLED") return t.status === "filled";
    if (filter === "BLOCKED") return t.status === "blocked";
    return true;
  }).filter((t) => !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.status.toLowerCase().includes(search.toLowerCase()));
  const sortedTrades = useMemo(() => [...filteredTrades].sort((a, b) => sortNewest ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt)), [filteredTrades, sortNewest]);
  const pagedTrades = sortedTrades.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(sortedTrades.length / pageSize));

  const filledCount = trades.filter((t) => t.status === "filled").length;
  const blockedCount = trades.filter((t) => t.status === "blocked").length;

  const handlePreviewRisk = async () => {
    try {
      const evaluation = await api.evaluateRisk({ symbol: symbol.toUpperCase(), decision: side, confidence: 80, shares: Number(shares), price: referencePrice });
      setRiskPreview(evaluation);
      setConfirming(true);
    } catch (err) {
      toastError("Risk Preview Failed", (err as Error).message);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirming) {
      await handlePreviewRisk();
      return;
    }
    try {
      await submitTrade({
        symbol: symbol.toUpperCase(),
        side,
        shares: Number(shares),
        orderType,
        limitPrice: orderType === "limit" ? Number(limitPrice) : undefined,
      });
      success("Order Placed", `Paper order for ${shares} ${symbol.toUpperCase()} submitted.`);
      setShowOrderForm(false);
      setConfirming(false);
      setRiskPreview(null);
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
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Order Type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value as "market" | "limit")} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50">
              <option value="market">Market</option><option value="limit">Limit</option>
            </select>
          </div>
          {orderType === "limit" && <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Limit Price</label>
            <input type="number" min="0.01" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
          </div>}
          <div className="col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-slate-400 sm:col-span-1">
            <div>QUOTE <span className="font-mono text-white">${referencePrice.toFixed(2)}</span></div>
            <div>NOTIONAL <span className="font-mono text-white">${notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            <div>BUYING POWER <span className="font-mono text-emerald-300">${portfolio.buyingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          </div>
          <button
            type="submit"
            disabled={submitting || referencePrice <= 0 || (confirming && !riskPreview?.approved)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "Submitting..." : confirming ? "Confirm Order" : "Preview Risk"}</span>
          </button>
          {confirming && <button type="button" onClick={() => { setConfirming(false); setRiskPreview(null); }} className="px-3 py-2 text-xs text-slate-400 hover:text-white">Cancel</button>}
          {confirming && <div className={`col-span-full flex items-center gap-2 text-xs ${riskPreview?.approved ? "text-emerald-300" : "text-rose-300"}`}><ShieldCheck className="h-4 w-4" />{riskPreview?.approved ? "Risk engine approved. Review and confirm this paper order." : `Risk engine blocked: ${riskPreview?.reasons?.join(", ") || "review required"}`}</div>}
        </form>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-amber-200 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Notice: {error}. Showing recent cached order history.</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search symbol or status" className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none" /></div>
        <div className="flex items-center gap-2"><button onClick={() => setSortNewest((value) => !value)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:text-white"><ArrowUpDown className="h-3.5 w-3.5" />{sortNewest ? "Newest" : "Oldest"}</button><button onClick={() => { const csv = ["id,symbol,side,shares,status,submittedAt", ...trades.map((t) => [t.id, t.symbol, t.side, t.shares, t.status, t.submittedAt].join(","))].join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "sentinel-trades.csv"; link.click(); URL.revokeObjectURL(url); }} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:text-white"><Download className="h-3.5 w-3.5" />Export CSV</button></div>
      </div>

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
        <TradeTable trades={pagedTrades} />
      )}
      <div className="flex items-center justify-between text-xs text-slate-500"><span>Showing {pagedTrades.length} of {sortedTrades.length} orders</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/10 px-2.5 py-1.5 disabled:opacity-30">Prev</button><span className="font-mono text-slate-300">{page}/{pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/10 px-2.5 py-1.5 disabled:opacity-30">Next</button></div></div>
    </div>
  );
};
