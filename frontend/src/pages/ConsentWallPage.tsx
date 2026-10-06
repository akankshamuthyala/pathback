import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ShieldCheck, HeartHandshake, EyeOff, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import apiClient from '../api/client';
import { MissingCase, ConsentStatus } from '../types';
import { ConsentStatusBadge } from '../components/common/ConsentStatusBadge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ConsentWallPage: React.FC = () => {
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<MissingCase | null>(null);
  const [consentHistory, setConsentHistory] = useState<any[]>([]);
  const [targetStatus, setTargetStatus] = useState<ConsentStatus>('Limited Disclosure Approved');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const consentOptions: Array<{ status: ConsentStatus; label: string; desc: string }> = [
    { status: 'Not Yet Located', label: 'Not Yet Located', desc: 'Case actively open; standard coordinate masking applies.' },
    { status: 'Located, Identity Pending', label: 'Located — Identity Pending', desc: 'Subject located in field; statutory identification verification underway.' },
    { status: 'Identity Verified, Consent Pending', label: 'Identity Verified — Consent Pending', desc: 'Identity confirmed. Consent Wall raised. All personal coordinates, addresses, and medical notes are locked.' },
    { status: 'Limited Disclosure Approved', label: 'Limited Disclosure Approved', desc: 'Located person approves safe welfare confirmation to family without physical address disclosure.' },
    { status: 'Family Contact Approved', label: 'Family Contact Approved', desc: 'Subject consents to mediated platform messaging with verified family.' },
    { status: 'Restricted Disclosure', label: 'Restricted Disclosure', desc: 'Subject consents to partial disclosure; specific parties excluded.' },
    { status: 'Do Not Disclose', label: 'Do Not Disclose (Protected)', desc: 'Subject explicitly declines family contact. Safety confirmed by authorities; location withheld permanently.' },
    { status: 'Consent Withdrawn', label: 'Consent Withdrawn', desc: 'Consent previously granted is revoked by subject.' },
    { status: 'Reunification Supported', label: 'Reunification Supported', desc: 'Mutual verified consent established; controlled reunification supported.' },
  ];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/cases');
      if (res.data.success && res.data.cases.length > 0) {
        setCases(res.data.cases);
        // Default to Case 3 (Meera Das - located consent pending) if available
        const meeraCase = res.data.cases.find((c: any) => c.caseId === 'SET-2026-003') || res.data.cases[0];
        setSelectedCase(meeraCase);
        loadCaseConsent(meeraCase.caseId);
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaseConsent = async (caseId: string) => {
    try {
      const res = await apiClient.get(`/cases/${caseId}/consent`);
      if (res.data.success) {
        setConsentHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load consent history:', err);
    }
  };

  const handleSelectCase = (caseItem: MissingCase) => {
    setSelectedCase(caseItem);
    loadCaseConsent(caseItem.caseId);
  };

  const handleConfirmConsentUpdate = async (reason: string) => {
    if (!selectedCase) return;

    try {
      const res = await apiClient.patch(`/cases/${selectedCase.caseId}/consent`, {
        status: targetStatus,
        scope: 'INVESTIGATOR_MANAGED',
        reason,
      });

      if (res.data.success) {
        setSelectedCase((prev) => (prev ? { ...prev, consentStatus: targetStatus } : null));
        setIsModalOpen(false);
        loadCaseConsent(selectedCase.caseId);
        fetchCases();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update consent status.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            The PathBack Consent Wall Terminal
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          "Finding someone does not automatically mean exposing someone." Protecting autonomy, safety, and civil liberties.
        </p>
      </div>

      <PrivacyNotice message="Statutory Doctrine: An individual's current physical address and contact details can NEVER be released without an explicit, recorded consent protocol decision." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Case Files ({cases.length})
          </h3>

          {cases.map((c) => {
            const isSelected = selectedCase?.caseId === c.caseId;
            return (
              <div
                key={c.caseId}
                onClick={() => handleSelectCase(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-400/20 shadow-md'
                    : 'bg-white dark:bg-sethu-navy-900 border-slate-200 dark:border-sethu-navy-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {c.caseId}
                  </span>
                  <ConsentStatusBadge status={c.consentStatus} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {c.personName}
                </h4>
                <div className="text-[11px] text-slate-500">
                  Current Status: <strong className="text-slate-700 dark:text-slate-300">{c.status}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consent Wall Management Console */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-sethu-navy-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 block">
                    {selectedCase.caseId} — Consent Record Console
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCase.personName} ({selectedCase.estimatedCurrentAge} yrs)
                  </h2>
                </div>
                <ConsentStatusBadge status={selectedCase.consentStatus} />
              </div>

              {/* Active Protection State Callout */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Active Information Protection State</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.consentStatus === 'Identity Verified, Consent Pending' || selectedCase.consentStatus === 'Located, Identity Pending' ? (
                    <>
                      <strong>The Consent Wall is actively raised.</strong> The subject is safely located. Physical residential coordinates, personal phone numbers, and direct photographs remain completely withheld across all family and public account tiers.
                    </>
                  ) : selectedCase.consentStatus === 'Do Not Disclose' ? (
                    <>
                      <strong>Permanent Non-Disclosure Enforced.</strong> The subject has formally exercised statutory rights to decline family reunification. Safety confirmed with law enforcement; whereabouts are permanently restricted.
                    </>
                  ) : (
                    <>
                      Case status is governed under <strong>{selectedCase.consentStatus}</strong>. Controlled mediated communication is permitted per authorized scope.
                    </>
                  )}
                </p>
              </div>

              {/* 9-Stage Consent State Transition Selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Update Consent Protocol Determination
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {consentOptions.map((opt) => {
                    const isCurrent = selectedCase.consentStatus === opt.status;
                    return (
                      <div
                        key={opt.status}
                        onClick={() => {
                          setTargetStatus(opt.status);
                          setIsModalOpen(true);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500 font-bold'
                            : 'bg-slate-50 dark:bg-sethu-navy-850 border-slate-200 dark:border-sethu-navy-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={isCurrent ? 'text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                            {opt.label}
                          </span>
                          {isCurrent && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit History for Consent Events */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-sethu-navy-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Consent Determination Audit Trail ({consentHistory.length})
                </h4>
                <div className="space-y-2">
                  {consentHistory.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-sethu-navy-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Status Transition: {rec.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 italic">
                        "{rec.reason}"
                      </p>
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        Recorded by: {rec.createdBy?.name || 'Authorized Investigator'} · Granted by: {rec.grantedBy || 'Subject'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmConsentUpdate}
        title={`Set Consent Protocol: ${targetStatus}`}
        description="Transitioning this status directly modifies privacy filters across all portals. A documented justification is required for the cryptographic audit log."
        confirmText="Confirm Protocol Transition"
        requireReason={true}
        reasonPlaceholder="e.g. Conducted private welfare interview at sanctuary; subject approved mediated message contact with mother..."
      />
    </div>
  );
};
