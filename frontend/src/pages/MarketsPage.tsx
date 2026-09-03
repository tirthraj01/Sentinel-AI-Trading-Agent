import React, { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, Sparkles, BarChart3, ArrowUpDown, RefreshCw, AlertCircle } from "lucide-react";
import { StockCard } from "../components/StockCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useMarketData } from "../hooks/useMarketData";

type SortOption = "CHANGE_DESC" | "CHANGE_ASC" | "PRICE_DESC" | "PRICE_ASC" | "VOLUME";

export const MarketsPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("CHANGE_DESC");

  const { stocks, loading, error, refetch } = useMarketData();

  const sectors = ["All", "Technology", "Semiconductors", "Software", "Automotive / EV"];

  const filteredStocks = stocks
    .filter((stock) => {
      const matchesQuery =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector =
        selectedSector === "All" || stock.sector === selectedSector;
      return matchesQuery && matchesSector;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "CHANGE_DESC":
          return b.changePercent - a.changePercent;
        case "CHANGE_ASC":
          return a.changePercent - b.changePercent;
        case "PRICE_DESC":
          return b.price - a.price;
        case "PRICE_ASC":
          return a.price - b.price;
        case "VOLUME":
          return parseFloat(b.volume) - parseFloat(a.volume);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Market Intelligence & Discovery
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore real-time asset pricing, technical momentum, and trigger agent analysis
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh market data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span>Connection note: {error}. Displaying cached market telemetry.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter, Search & Sort Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ticker or name..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="CHANGE_DESC">Highest Gainers</option>
            <option value="CHANGE_ASC">Biggest Decliners</option>
            <option value="PRICE_DESC">Highest Price</option>
            <option value="PRICE_ASC">Lowest Price</option>
            <option value="VOLUME">Highest Volume</option>
          </select>
        </div>
      </div>

      {loading && stocks.length === 0 ? (
        <LoadingSkeleton type="card" />
      ) : (
        /* Top 3 Featured Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStocks.slice(0, 3).map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onAnalyze={() => onOpenAnalysis(stock.symbol)}
            />
          ))}
        </div>
      )}

      {/* All Monitored Assets Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">All Exchange Watchlist Quotes</h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredStocks.length} of {stocks.length} assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5 text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 text-right">Day Range</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-right">P/E Ratio</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-center">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStocks.map((stock) => {
                const isPos = stock.change >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold">{stock.symbol}</div>
                          <div className="text-[10px] text-slate-400">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{stock.sector}</td>
                    <td className="py-3.5 px-4 text-right font-tabular font-bold text-white">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-tabular font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPos ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                      ${stock.low.toFixed(2)} — ${stock.high.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                      {stock.volume}
                    </td>
                    <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                      {stock.peRatio ? `${stock.peRatio}x` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                      {stock.marketCap}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenAnalysis(stock.symbol)}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 text-xs font-semibold transition-all hover:scale-105"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Screen</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
