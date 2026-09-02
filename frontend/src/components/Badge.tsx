import React from "react";

export type BadgeVariant =
  | "buy"
  | "sell"
  | "hold"
  | "approved"
  | "blocked"
  | "pending"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  buy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  sell: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  blocked: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  critical: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  hold: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  low: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  size = "md",
  className = "",
  pulse = false,
}) => {
  const sizeStyle = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${variantStyles[variant]} ${sizeStyle} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
