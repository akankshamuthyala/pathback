import React from 'react';
import { ShieldCheck, Lock, EyeOff, HeartHandshake, AlertCircle, FileCheck } from 'lucide-react';
import { ConsentStatusBadge } from '../components/common/ConsentStatusBadge';
import { ConsentStatus } from '../types';

export const PrivacyConsentPage: React.FC = () => {
  const consentStages: Array<{ status: ConsentStatus; desc: string }> = [
    { status: 'Not Yet Located', desc: 'Active search in progress; exact locations of family and initial reports are restricted.' },
    { status: 'Located, Identity Pending', desc: 'Subject located in field or shelter; statutory identity confirmation in progress.' },
    { status: 'Identity Verified, Consent Pending', desc: 'Identity confirmed by investigator. The Consent Wall is raised. All address and contact data is withheld.' },
    { status: 'Limited Disclosure Approved', desc: 'Located person approves sharing safe welfare confirmation without physical address.' },
    { status: 'Family Contact Approved', desc: 'Subject consents to mediated platform communication with verified family members.' },
    { status: 'Restricted Disclosure', desc: 'Subject requests partial communication; specific individuals or locations excluded.' },
    { status: 'Do Not Disclose', desc: 'Subject explicitly declines family reunification. Law enforcement confirms safety; location withheld permanently.' },
    { status: 'Consent Withdrawn', desc: 'Previously granted consent revoked by subject at any stage.' },
    { status: 'Reunification Supported', desc: 'Mutual consent verified; safe mediated meeting facilitated by authorized agency.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200">
          <Lock className="w-3.5 h-3.5 text-sky-600" /> Core Product Doctrine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          The PathBack Consent Wall Philosophy
        </h1>
        <p className="text-sm font-semibold text-sky-600">
          Finding a safer path back home.
        </p>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          "Finding someone does not automatically mean exposing someone." Why human rights, personal autonomy, and safeguarding govern our platform.
        </p>
      </div>

      {/* The Core Rationale */}
      <div className="p-6 bg-sky-50/70 rounded-2xl border border-sky-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-sky-600" />
          Why Consent Must Precede Disclosure
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Not all missing persons are lost. In many circumstances, individuals may have fled abusive domestic environments, exploitative relationships, or harmful situations. Traditional tracking networks risk becoming involuntary surveillance tools for abusers.
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          PathBack introduces an algorithmic and institutional barrier: <span className="font-bold text-sky-700">The Consent Wall</span>. When an investigator locates an adult, the system strictly forbids automatic disclosure of coordinates, room numbers, or direct phone numbers to anyone — including the reporting family — until the individual’s free consent is recorded.
        </p>
      </div>

      {/* 9-Stage Consent Lifecycle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          The 9-Stage Consent Lifecycle Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {consentStages.map((stage, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
            >
              <ConsentStatusBadge status={stage.status} />
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
