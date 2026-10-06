import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Copy, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import apiClient from '../api/client';
import { Sighting, MissingCase } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ReviewQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<Sighting[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [targetDecision, setTargetDecision] = useState<'approved' | 'rejected' | 'duplicate' | 'needs_more_info'>('approved');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priorityOverride, setPriorityOverride] = useState<'NORMAL' | 'HIGH' | 'CRITICAL' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/reviews/queue');
      if (res.data.success) {
        setQueue(res.data.pendingSightings);
        setRecentReviews(res.data.recentReviews);
        if (res.data.pendingSightings.length > 0) {
          setSelectedSighting(res.data.pendingSightings[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDecisionModal = (decision: 'approved' | 'rejected' | 'duplicate' | 'needs_more_info') => {
    setTargetDecision(decision);
    setIsModalOpen(true);
  };

  const handleConfirmDecision = async (reason: string) => {
    if (!selectedSighting) return;

    try {
      const res = await apiClient.post('/reviews/submit', {
        caseId: selectedSighting.caseId?._id || selectedSighting.caseId?.caseId || selectedSighting.caseId,
        sightingId: selectedSighting.sightingId,
        decision: targetDecision,
        priorityOverride,
        notes: reason,
        reason,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review determination.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-teal-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Human-in-the-Loop Lead Review Queue
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Mandatory investigator verification terminal. AI suggests; authorized human personnel decide.
        </p>
      </div>

      <PrivacyNotice message="No sighting lead is promoted or acted upon until verified by an assigned human investigator." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Sighting Leads */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pending Leads Awaiting Review ({queue.length})
          </h3>

          {queue.length > 0 ? (
            queue.map((s) => {
              const isSelected = selectedSighting?.sightingId === s.sightingId;
              return (
                <div
                  key={s.sightingId}
                  onClick={() => setSelectedSighting(s)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 ring-2 ring-teal-400/20 shadow-md'
                      : 'bg-white dark:bg-sethu-navy-900 border-slate-200 dark:border-sethu-navy-800 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">
                      {s.sightingId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {s.reviewStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                    {s.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-sethu-navy-800">
                    <span>{s.approximateLocation}</span>
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl bg-white dark:bg-sethu-navy-900">
              Queue clear! All leads have been processed.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Sighting Audit & Decision Deck */}
        {selectedSighting ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-sethu-navy-800">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-600 block">
                    {selectedSighting.sightingId} — Lead Audit Terminal
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Associated Case: {selectedSighting.caseId?.personName || 'Unlinked Lead'}
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                  Status: {selectedSighting.reviewStatus}
                </span>
              </div>

              {/* Sighting Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Witness Observation Statement
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-sethu-navy-850 p-4 rounded-xl">
                    {selectedSighting.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Area</span>
                    <strong className="block text-slate-900 dark:text-white">{selectedSighting.approximateLocation}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Attire</span>
                    <strong className="block text-slate-900 dark:text-white">{selectedSighting.clothing || 'Not noted'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Observed Age</span>
                    <strong className="block text-slate-900 dark:text-white">{selectedSighting.estimatedAge ? `${selectedSighting.estimatedAge} yrs` : 'Unknown'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Source Type</span>
                    <strong className="block text-slate-900 dark:text-white">{selectedSighting.sourceType}</strong>
                  </div>
                </div>

                {selectedSighting.photographs?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Uploaded Witness Imagery ({selectedSighting.photographs.length})
                    </h4>
                    <div className="flex gap-3">
                      {selectedSighting.photographs.map((src, i) => (
                        <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border">
                          <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Investigator Determination Actions */}
              <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                    Investigator Verification Decision
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select a determination. Every decision is cryptographically logged with your inspector ID.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleOpenDecisionModal('approved')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve for Field Verification</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal('needs_more_info')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Request More Information</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal('duplicate')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Mark as Duplicate</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal('rejected')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Lead (Unrelated)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDecision}
        title={`Confirm Lead Decision: ${targetDecision.toUpperCase()}`}
        description="Please record the formal investigative rationale for the audit trail before committing this determination."
        confirmText="Confirm Determination"
        requireReason={true}
        reasonPlaceholder="e.g. Verified with Platform 4 CCTV; subject attire matches; witness contact completed..."
      />
    </div>
  );
};
