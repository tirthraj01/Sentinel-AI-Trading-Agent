import React from "react";
import { X, Command, Sparkles } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "1", desc: "Go to Dashboard Overview" },
    { key: "2", desc: "Go to Markets & Screening" },
    { key: "3", desc: "Go to Portfolio Analytics" },
    { key: "4", desc: "Go to Positions & Holdings" },
    { key: "5", desc: "Go to AI Agent Command Center" },
    { key: "6", desc: "Go to Decision Waterfall & Feed" },
    { key: "7", desc: "Go to Deterministic Risk Engine" },
    { key: "8", desc: "Go to Trade History & Audit" },
    { key: "/", desc: "Focus Global Search" },
    { key: "?", desc: "Toggle this Keyboard Shortcuts Guide" },
    { key: "Esc", desc: "Close Any Active Modal / Drawer" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 p-6 sm:p-8 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Keyboard Navigation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Shortcuts
                </span>
              </h3>
              <p className="text-xs text-slate-400">Quick terminal navigation across SENTINEL</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-xs text-slate-300 font-medium">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-mono font-bold text-cyan-300 shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Power User Navigation Active</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
