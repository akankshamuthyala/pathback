import React from 'react';
import { AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', showIcon = true }) => {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
    NORMAL: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      label: 'NORMAL PRIORITY',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
    HIGH: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      label: 'HIGH RISK',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    CRITICAL: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800/50',
      label: 'CRITICAL URGENCY',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
    },
  };

  const config = configs[level] || configs.NORMAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm ${className}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
