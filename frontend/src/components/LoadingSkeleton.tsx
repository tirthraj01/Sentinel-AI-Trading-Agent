import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-white/[0.05] rounded-xl ${className}`}
    />
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-8 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4 pt-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 p-5 space-y-4">
      <div className="flex justify-between items-center pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
};
