import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-full border border-slate-200/50 dark:border-slate-800"
          />
        ))}
      </div>
    </div>
  );
};
