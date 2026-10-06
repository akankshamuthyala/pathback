import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PrivacyNoticeProps {
  message?: string;
  className?: string;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  message = 'Finding someone does not automatically mean exposing someone. Personal coordinates and phone numbers remain strictly restricted under PathBack Consent-First protocols.',
  className = '',
}) => {
  return (
    <div
      className={`p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-start gap-3 shadow-xs ${className}`}
    >
      <div className="p-1 rounded-md bg-sky-100 text-sky-700 mt-0.5 flex-shrink-0">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="text-xs text-slate-700 leading-relaxed">
        <span className="font-bold text-sky-900 mr-1.5">PathBack Privacy Guarantee:</span>
        {message}
      </div>
    </div>
  );
};
