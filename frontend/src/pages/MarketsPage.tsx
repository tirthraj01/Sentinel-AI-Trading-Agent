import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Sparkles, Filter, BarChart3, ArrowUpDown } from "lucide-react";
import { StockCard } from "../components/StockCard";
import { MOCK_STOCKS } from "../data/mockData";

type SortOption = "CHANGE_DESC" | "CHANGE_ASC" | "PRICE_DESC" | "PRICE_ASC" | "VOLUME";

export const MarketsPage: React.FC = () => {
  const { onOpenAnalysis } = useOutletContext<{
    onOpenAnalysis: (symbol: string) => void;
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("CHANGE_DESC");

  const sectors = ["All", "Technology", "Semiconductors", "Software", "Automotive / EV"];

  const filteredStocks = MOCK_STOCKS.filter((stock) => {
    const matchesQuery =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector =
      selectedSector === "All" || stock.sector === selectedSector;
    return matchesQuery && matchesSector;
  }).sort((a, b) => {
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Market Intelligence & Discovery
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore real-time asset pricing, technical momentum, and trigger agent analysis
        </p>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol or company..."
            className="w-full bg-[#12141A] border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Sector Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="h-3.5 w-3.5 text-slate-500 mr-1 hidden sm:block shrink-0" />
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                  : "bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#12141A] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="CHANGE_DESC">Highest % Gainers</option>
            <option value="CHANGE_ASC">Largest % Decliners</option>
            <option value="PRICE_DESC">Price: High to Low</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="VOLUME">Highest Volume</option>
          </select>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onAnalyze={(sym) => onOpenAnalysis(sym)}
          />
        ))}
      </div>

      {/* Detailed Valuation & Technical Overview Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Technical Overview & Valuation Metrics
            </h3>
          </div>
          <span className="text-xs text-slate-400">Alpaca Market Data v2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 bg-white/[0.01]">
                <th className="py-3 px-4 font-semibold">Symbol</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Daily Change</th>
                <th className="py-3 px-4 font-semibold text-right">Session Range</th>
                <th className="py-3 px-4 font-semibold text-right">Volume</th>
                <th className="py-3 px-4 font-semibold text-right">P/E Ratio</th>
                <th className="py-3 px-4 font-semibold text-right">Market Cap</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStocks.map((stock) => {
                const isPos = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {stock.symbol}
                    </td>
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
