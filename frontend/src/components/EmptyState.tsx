import React from "react";
import { Inbox, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/10">
      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
        {icon || <Inbox className="h-6 w-6" />}
      </div>

      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
