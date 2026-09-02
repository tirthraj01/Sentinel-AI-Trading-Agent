import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Service Feed Error",
  message = "Failed to fetch market data from the broker stream. Your capital remains protected and no orders were placed.",
  onRetry,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-rose-500/20 bg-rose-950/10">
      <div className="h-12 w-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-rose-200/80 max-w-md mb-5 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 text-xs font-semibold transition-all active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
