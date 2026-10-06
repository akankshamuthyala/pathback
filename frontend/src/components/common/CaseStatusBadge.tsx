import React from 'react';
import { CaseStatus } from '../../types';

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<CaseStatus, { bg: string; text: string; dot: string }> = {
    Draft: { bg: 'bg-slate-100 text-slate-700 border-slate-300', text: 'Draft', dot: 'bg-slate-400' },
    Active: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Active Search', dot: 'bg-blue-500 animate-pulse' },
    'Under Review': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'Under Review', dot: 'bg-indigo-500' },
    'Potential Lead': { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'Potential Lead', dot: 'bg-amber-500' },
    'Human Verification': { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Human Verification', dot: 'bg-purple-500 animate-ping' },
    Located: { bg: 'bg-teal-50 text-teal-800 border-teal-200', text: 'Located', dot: 'bg-teal-500' },
    'Consent Pending': { bg: 'bg-yellow-50 text-yellow-800 border-yellow-200', text: 'Consent Pending', dot: 'bg-yellow-500' },
    'Reunification Supported': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'Reunification Supported', dot: 'bg-emerald-500' },
    Closed: { bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'Closed', dot: 'bg-slate-400' },
    Archived: { bg: 'bg-slate-50 text-slate-500 border-slate-200', text: 'Archived', dot: 'bg-slate-300' },
  };

  const config = configs[status] || configs.Active;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.text}
    </span>
  );
};
