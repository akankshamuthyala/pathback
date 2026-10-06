import React, { useState, useEffect } from 'react';
import { GitMerge, MapPin, Calendar, Clock, Shirt, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, User } from 'lucide-react';
import apiClient from '../api/client';
import { PatternCluster } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const PatternInsightsPage: React.FC = () => {
  const [clusters, setClusters] = useState<PatternCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<PatternCluster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Review modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<any>('Confirmed Related by Investigator');

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/patterns');
      if (res.data.success) {
        setClusters(res.data.clusters);
        if (res.data.clusters.length > 0) {
          setSelectedCluster(res.data.clusters[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load pattern clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await apiClient.post('/patterns/run-analysis');
      if (res.data.success) {
        setClusters(res.data.clusters);
        if (res.data.clusters.length > 0) {
          setSelectedCluster(res.data.clusters[0]);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Pattern scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmDecision = async (notes: string) => {
    if (!selectedCluster) return;

    try {
      const res = await apiClient.post(`/patterns/${selectedCluster.clusterId}/review`, {
        status: targetStatus,
        investigatorNotes: notes,
      });

      if (res.data.success) {
        setSelectedCluster(res.data.cluster);
        setIsModalOpen(false);
        fetchClusters();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record pattern decision.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Cross-Case Pattern Insights
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent 6-signal pattern engine detecting spatial transit corridors, temporal proximity, and duplicate reports.
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <GitMerge className="w-4 h-4" />
          )}
          <span>{isScanning ? 'Scanning Pattern Matrix...' : 'Run Cross-Case Scan'}</span>
        </button>
      </div>

      <PrivacyNotice message="Pattern clusters correlate anonymous spatial buckets and timeline brackets. They NEVER confirm identity or declare a criminal pattern." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cluster Cards List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Active Multi-Signal Clusters ({clusters.length})
          </h3>

          {clusters.map((cluster) => {
            const isSelected = selectedCluster?.clusterId === cluster.clusterId;
            return (
              <div
                key={cluster.clusterId}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-500 ring-2 ring-purple-400/20 shadow-md'
                    : 'bg-white dark:bg-sethu-navy-900 border-slate-200 dark:border-sethu-navy-800 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                    {cluster.clusterId}
                  </span>
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                    Relevance: {cluster.relevanceScore}/100
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {cluster.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-sethu-navy-800">
                  <span>{cluster.sightingIds?.length || 0} sightings connected</span>
                  <span className={`font-semibold ${cluster.status === 'Confirmed Related by Investigator' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {cluster.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Cluster Inspector */}
        {selectedCluster && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-sethu-navy-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-600">{selectedCluster.clusterId}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {selectedCluster.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedCluster.title}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-purple-600">
                    {selectedCluster.relevanceScore}<span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Pattern Index</span>
                </div>
              </div>

              {/* 6-Signal Score Breakdown Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Transparent 6-Signal Mathematical Weighting
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Geographic (30%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.geographicSimilarity || 85}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.geographicSimilarity || 85}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Timeline (20%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.timelineSimilarity || 80}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.timelineSimilarity || 80}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Description (20%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.descriptionSimilarity || 85}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.descriptionSimilarity || 85}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Coarse Visual (15%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.coarseVisualSimilarity || 75}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.coarseVisualSimilarity || 75}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Clothing (10%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.clothingSimilarity || 90}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.clothingSimilarity || 90}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Duplicate Check (5%)</span>
                      <strong className="text-slate-900 dark:text-white">{selectedCluster.scoreBreakdown?.duplicateReportEvidence || 95}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedCluster.scoreBreakdown?.duplicateReportEvidence || 95}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Corridor Visual Map Simulator */}
              <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-purple-400">
                    <MapPin className="w-4 h-4" />
                    Spatial Transit Corridor Visualization (Investigator Only)
                  </span>
                  <span className="text-[10px] text-slate-400">Sector: {selectedCluster.sharedArea}</span>
                </div>

                <div className="relative h-44 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Simulated Transit Corridor Path */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 50 110 Q 180 50, 320 80 T 520 120"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {/* Pin 1: Platform 4 */}
                  <div className="absolute left-1/4 top-1/3 flex flex-col items-center group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-purple-500/20 animate-bounce">
                      S1
                    </div>
                    <span className="text-[9px] bg-slate-800/90 px-1.5 py-0.5 rounded mt-1 border border-slate-700 whitespace-nowrap">
                      S-101 (Platform 4)
                    </span>
                  </div>

                  {/* Pin 2: West Bus Terminal */}
                  <div className="absolute left-1/2 top-1/2 flex flex-col items-center group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-teal-500/20">
                      S2
                    </div>
                    <span className="text-[9px] bg-slate-800/90 px-1.5 py-0.5 rounded mt-1 border border-slate-700 whitespace-nowrap">
                      S-102 (West Bus Bay)
                    </span>
                  </div>

                  {/* Pin 3: Social repost duplicate */}
                  <div className="absolute right-1/4 top-1/3 flex flex-col items-center group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-amber-500/20">
                      S3
                    </div>
                    <span className="text-[9px] bg-slate-800/90 px-1.5 py-0.5 rounded mt-1 border border-slate-700 whitespace-nowrap">
                      S-103 (Duplicate Hash)
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Corridor Radius: ~2.1 km transit perimeter</span>
                  <span>Observation Window: 48 active hours</span>
                </div>
              </div>

              {/* Supporting Factors & Conflicting Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Supporting Evidence Factors
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {selectedCluster.supportingFactors?.map((fac, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Conflicting Factors & Limitations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {selectedCluster.conflictingFactors?.map((fac, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{fac}</span>
                      </li>
                    ))}
                    {selectedCluster.limitations?.map((lim, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-500 italic">
                        <span>•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Investigator Action Panel */}
              <div className="p-4 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Investigator Action Terminal
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Record human determination on whether these reports represent a confirmed investigative correlation.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetStatus('Confirmed Related by Investigator');
                        setIsModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Confirm Related
                    </button>
                    <button
                      onClick={() => {
                        setTargetStatus('Needs More Information');
                        setIsModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                    >
                      Request Info
                    </button>
                    <button
                      onClick={() => {
                        setTargetStatus('Dismissed');
                        setIsModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-sethu-navy-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {selectedCluster.investigatorNotes && (
                  <div className="p-3 bg-white dark:bg-sethu-navy-900 border rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Investigator Rationale on File:</span>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{selectedCluster.investigatorNotes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDecision}
        title={`Set Cluster Status: ${targetStatus}`}
        description="Every cluster determination requires a logged rationale for tamper-evident audit trails."
        confirmText="Submit Determination"
        requireReason={true}
        reasonPlaceholder="Document field verification details, CCTV checks, or witness reconciliations..."
      />
    </div>
  );
};
