import React from "react";
import { SentinelMascot } from "./SentinelMascot";

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
      <div className="relative mb-5 flex justify-center">
        <SentinelMascot size="lg" state="analyzing" />
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
