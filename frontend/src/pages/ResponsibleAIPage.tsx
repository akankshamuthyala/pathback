import React from 'react';
import { Check, X, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export const ResponsibleAIPage: React.FC = () => {
  const terminology = [
    { approved: 'Potential Lead', prohibited: 'Confirmed Identity by AI' },
    { approved: 'Potentially Related Reports', prohibited: 'Guaranteed Match' },
    { approved: 'AI-Assisted Analysis', prohibited: 'Same Person Detected' },
    { approved: 'Human Verification Required', prohibited: 'Automatic Reunification' },
    { approved: 'Consent Pending', prohibited: 'Autonomous Contact Disclosure' },
    { approved: 'Restricted Information', prohibited: 'Public Coordinate Exposure' },
    { approved: 'Requires Further Review', prohibited: 'Statutory Identity Finding' },
  ];

  const rules = [
    'AI results are mathematical correlation recommendations, never statutory facts.',
    'AI must NEVER automatically confirm someone’s identity.',
    'Similar appearance must never be treated as proof of identity.',
    'Pattern clustering must never automatically declare two cases belong to the same person.',
    'Every operational escalation requires authorized human investigator verification.',
    'The located person’s consent and safety must be verified before private details are shared with families or public.',
    'Every AI output must include explicit uncertainty statements and observational limitations.',
    'AI must not make legal, medical, or law-enforcement rulings.',
    'AI must not infer criminal behavior or motive from appearance, demographic attributes, or locations.',
    'No unrestricted public facial recognition searching.',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Hackathon Theme: PS-13 AI Security, Privacy & Trust
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          PathBack Responsible AI Governance Framework
        </h1>
        <p className="text-sm font-semibold text-sky-600">
          Finding a safer path back home.
        </p>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          AI systems handling missing-person investigations must uphold civil liberties, protect vulnerable individuals from unwanted disclosure, and prevent automated misidentification.
        </p>
      </div>

      {/* Ten Commandments of PathBack Responsible AI */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-sky-600" />
          Mandatory Ethical AI Directives
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-700">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-sky-100">
                {idx + 1}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Language & Terminology Standards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Statutory Terminology & Language Standards
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            PathBack interfaces strictly adhere to calibrated terminology preventing false certainty.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3 text-emerald-700">Approved Language</th>
                <th className="px-6 py-3 text-rose-700">Prohibited Certainty Language</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {terminology.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {item.approved}
                  </td>
                  <td className="px-6 py-3 text-rose-600 font-medium">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500" />
                      {item.prohibited}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
