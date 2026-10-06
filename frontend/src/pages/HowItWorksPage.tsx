import React from 'react';
import { ArrowDown, Shield, Eye, FileText, CheckCircle2, Lock, MessageSquare } from 'lucide-react';
import { PrivacyNotice } from '../components/common/PrivacyNotice';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      number: 'Phase 1',
      title: 'Multimodal Ingestion & Feature Extraction',
      description: 'Case records, old photographs, witness interviews, audio recordings, and police documents are ingested. Structured features (spatial buckets, time windows, clothing, age baselines) are automatically derived without biometric facial tagging.',
      icon: <FileText className="w-6 h-6 text-teal-600" />,
      color: 'teal',
    },
    {
      number: 'Phase 2',
      title: 'Multimodal AI Analysis & Lead Scoring',
      description: 'Anthropic Claude AI engines generate objective case summaries, Age-Aware Appearance Analysis profiles (separating stable traits from changeable ones), and comparative sighting evaluations with transparent 0-100 correlation scores.',
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      color: 'blue',
    },
    {
      number: 'Phase 3',
      title: 'Cross-Case Pattern Recognition & Clustering',
      description: 'The 6-signal pattern engine scans active reports to group geographic transit clusters, temporal corridors, and perceptual image hash collisions for investigator review.',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: 'purple',
    },
    {
      number: 'Phase 4',
      title: 'Human Investigator Verification (Strict Gate)',
      description: 'AI suggestions remain advisory potential leads until a human investigator audits the supporting evidence, conflicting factors, and observational conditions to approve or dismiss.',
      icon: <CheckCircle2 className="w-6 h-6 text-amber-600" />,
      color: 'amber',
    },
    {
      number: 'Phase 5',
      title: 'The Consent Wall Protocol',
      description: 'When an individual is located, personal contact information, medical records, and photographs remain strictly locked. The 9-stage consent review ensures vulnerable individuals are not exposed without statutory consent.',
      icon: <Lock className="w-6 h-6 text-rose-600" />,
      color: 'rose',
    },
    {
      number: 'Phase 6',
      title: 'Controlled Mediated Communication & Reunification',
      description: 'Authorized family members and investigators interact solely through controlled platform communication with automatic phone/email redaction, safely bridging finding and reunification.',
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      color: 'emerald',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">
          How PathBack Works: The 6-Stage Investigation Protocol
        </h1>
        <p className="text-sm font-semibold text-sky-600">
          Finding a safer path back home.
        </p>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          From fragmented intake reports to ethical, consent-centered reunification — discover how PathBack bridges technology and human judgment.
        </p>
      </div>

      <PrivacyNotice />

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col sm:flex-row gap-5 items-start"
          >
            <div className="p-3.5 rounded-xl bg-sky-50 text-sky-600 flex-shrink-0 border border-sky-100">
              {step.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">{step.number}</span>
              <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
