import React from "react";
import { ArrowDownLeft, ArrowUpRight, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { TradeRecord } from "../types";
import { Badge } from "./Badge";

interface TradeTableProps {
  trades: TradeRecord[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Order & Execution History
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of paper orders submitted to Alpaca and trades blocked by Risk
          </p>
        </div>
        <span className="text-xs font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
          {trades.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 bg-white/[0.01]">
              <th className="py-3 px-5 font-semibold">Side & Asset</th>
              <th className="py-3 px-4 font-semibold text-right">Shares</th>
              <th className="py-3 px-4 font-semibold text-right">Order Price</th>
              <th className="py-3 px-4 font-semibold text-right">Execution Price</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold">Alpaca ID / Risk Veto</th>
              <th className="py-3 px-5 font-semibold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trades.map((trade) => {
              const isBuy = trade.side === "BUY";
              const isBlocked = trade.status === "blocked";
              return (
                <tr
                  key={trade.id}
                  className={`hover:bg-white/[0.03] transition-colors ${
                    isBlocked ? "bg-rose-950/[0.05]" : ""
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold ${
                          isBuy
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono text-sm">
                            {trade.symbol}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1 rounded ${
                              isBuy ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {trade.side}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {trade.orderType} order
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular text-slate-200">
                    {trade.shares}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular text-slate-300">
                    ${trade.estimatedPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-tabular font-semibold text-white">
                    {trade.executedPrice ? `$${trade.executedPrice.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isBlocked ? (
                      <Badge variant="blocked" size="sm">
                        <ShieldAlert className="h-3 w-3" />
                        <span>BLOCKED</span>
                      </Badge>
                    ) : trade.status === "filled" ? (
                      <Badge variant="approved" size="sm">
                        <ShieldCheck className="h-3 w-3" />
                        <span>FILLED</span>
                      </Badge>
                    ) : (
                      <Badge variant="pending" size="sm">
                        <span>{trade.status}</span>
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {isBlocked ? (
                      <div className="max-w-xs">
                        <span className="text-rose-400 font-medium text-[11px] block truncate">
                          Vetoed by Risk Engine
                        </span>
                        {trade.riskReasons && trade.riskReasons[0] && (
                          <span className="text-slate-400 text-[10px] truncate block" title={trade.riskReasons[0]}>
                            {trade.riskReasons[0]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {trade.alpacaOrderId || "alpaca-paper"}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right font-tabular text-slate-400 text-[11px]">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{new Date(trade.submittedAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
