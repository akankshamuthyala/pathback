import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, HeartHandshake } from 'lucide-react';
import { ConsentStatus } from '../../types';

interface ConsentStatusBadgeProps {
  status: ConsentStatus;
  className?: string;
  showIcon?: boolean;
}

export const ConsentStatusBadge: React.FC<ConsentStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const configs: Record<
    ConsentStatus,
    { bg: string; text: string; border: string; icon: React.ReactNode; label: string }
  > = {
    'Not Yet Located': {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
      label: 'Not Yet Located',
    },
    'Located, Identity Pending': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
      label: 'Located — Identity Pending',
    },
    'Identity Verified, Consent Pending': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: <Lock className="w-3.5 h-3.5 text-yellow-600" />,
      label: 'Identity Verified — Consent Pending',
    },
    'Limited Disclosure Approved': {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
      label: 'Limited Disclosure Approved',
    },
    'Family Contact Approved': {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />,
      label: 'Family Contact Approved',
    },
    'Restricted Disclosure': {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: <Lock className="w-3.5 h-3.5 text-orange-600" />,
      label: 'Restricted Disclosure',
    },
    'Do Not Disclose': {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
      label: 'Do Not Disclose (Protected)',
    },
    'Consent Withdrawn': {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <Lock className="w-3.5 h-3.5 text-slate-500" />,
      label: 'Consent Withdrawn',
    },
    'Reunification Supported': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Reunification Supported',
    },
  };

  const config = configs[status] || configs['Not Yet Located'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} shadow-sm ${className}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
