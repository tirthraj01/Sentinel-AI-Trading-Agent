import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Sentinel is analyzing market conditions...",
  submessage = "Gathering live quotes, scanning news sentiment, and checking risk constraints.",
}) => {
  return (
    <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-white/10">
      <div className="relative mb-5">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="h-8 w-8 animate-pulse text-indigo-400" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </div>

      <h3 className="text-base font-bold text-white mb-1 tracking-tight">
        {message}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
        {submessage}
      </p>

      {/* Shimmer progress bar */}
      <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full animate-pulse-slow w-2/3" />
      </div>
    </div>
  );
};
