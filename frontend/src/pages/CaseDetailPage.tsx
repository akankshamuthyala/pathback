import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderOpen,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  Eye,
  GitMerge,
  ShieldAlert,
  MessageSquare,
  History,
  Upload,
  Lock,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  Send,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MissingCase, Sighting, Evidence, AIAnalysis, PatternCluster, SecureMessage, ConsentStatus } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { CaseStatusBadge } from '../components/common/CaseStatusBadge';
import { ConsentStatusBadge } from '../components/common/ConsentStatusBadge';
import { LeadScoreCard } from '../components/common/LeadScoreCard';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();

  const [caseData, setCaseData] = useState<MissingCase | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [clusters, setClusters] = useState<PatternCluster[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'sightings' | 'ai' | 'timeline' | 'patterns' | 'messages' | 'consent'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // Consent modal state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [targetConsentStatus, setTargetConsentStatus] = useState<ConsentStatus>('Identity Verified, Consent Pending');

  // Evidence upload modal state
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const isInvestigatorOrAdmin = hasRole('investigator', 'admin');

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/cases/${id}`);
      if (res.data.success) {
        setCaseData(res.data.case);
        setEvidence(res.data.evidence || []);
        setSightings(res.data.sightings || []);
        setAnalyses(res.data.recentAnalyses || []);
        setClusters(res.data.relatedClusters || []);
      }

      // Fetch timeline and messages
      const [tlRes, msgRes] = await Promise.all([
        apiClient.get(`/cases/${id}/timeline`).catch(() => ({ data: { timeline: [] } })),
        apiClient.get(`/cases/${id}/messages`).catch(() => ({ data: { messages: [] } })),
      ]);

      if (tlRes.data?.timeline) setTimeline(tlRes.data.timeline);
      if (msgRes.data?.messages) setMessages(msgRes.data.messages);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run AI Summary
  const handleRunAiSummary = async () => {
    if (!caseData) return;
    setIsAiLoading(true);
    setAiMessage('Synthesizing multimodal case summary...');
    try {
      const res = await apiClient.post(`/ai/cases/${caseData.caseId}/summary`);
      if (res.data.success) {
        setAnalyses((prev) => [res.data.analysis, ...prev]);
        setActiveTab('ai');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'AI engine failed.');
    } finally {
      setIsAiLoading(false);
      setAiMessage('');
    }
  };

  // Run Age-Aware Appearance Analysis
  const handleRunAppearanceAnalysis = async () => {
    if (!caseData) return;
    setIsAiLoading(true);
    setAiMessage('Generating Age-Aware Appearance biological maturation profile...');
    try {
      const res = await apiClient.post(`/ai/cases/${caseData.caseId}/appearance-analysis`);
      if (res.data.success) {
        setAnalyses((prev) => [res.data.analysis, ...prev]);
        setActiveTab('ai');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Age progression engine failed.');
    } finally {
      setIsAiLoading(false);
      setAiMessage('');
    }
  };

  // Run Risk Assessment
  const handleRunRiskAssessment = async () => {
    if (!caseData) return;
    setIsAiLoading(true);
    setAiMessage('Evaluating deterministic risk rules and contributing factors...');
    try {
      const res = await apiClient.post(`/ai/cases/${caseData.caseId}/risk-assessment`);
      if (res.data.success) {
        setAnalyses((prev) => [res.data.analysis, ...prev]);
        if (res.data.updatedRiskLevel) {
          setCaseData((prev) => (prev ? { ...prev, riskLevel: res.data.updatedRiskLevel } : null));
        }
        setActiveTab('ai');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Risk assessment failed.');
    } finally {
      setIsAiLoading(false);
      setAiMessage('');
    }
  };

  // Run Multimodal Connection
  const handleRunMultimodalConnection = async () => {
    if (!caseData) return;
    setIsAiLoading(true);
    setAiMessage('Correlating cross-evidence corridors and potential contradictions...');
    try {
      const res = await apiClient.post(`/ai/cases/${caseData.caseId}/multimodal-connection`);
      if (res.data.success) {
        setAnalyses((prev) => [res.data.analysis, ...prev]);
        setActiveTab('ai');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Multimodal engine failed.');
    } finally {
      setIsAiLoading(false);
      setAiMessage('');
    }
  };

  // Update Consent Status
  const handleConfirmConsentUpdate = async (reason: string) => {
    if (!caseData) return;
    try {
      const res = await apiClient.patch(`/cases/${caseData.caseId}/consent`, {
        status: targetConsentStatus,
        scope: 'INVESTIGATOR_MANAGED',
        reason,
      });
      if (res.data.success) {
        setCaseData((prev) => (prev ? { ...prev, consentStatus: targetConsentStatus } : null));
        setIsConsentModalOpen(false);
        fetchCaseDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update consent protocol.');
    }
  };

  // Upload Evidence File
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile || !caseData) return;

    const formData = new FormData();
    formData.append('file', evidenceFile);

    try {
      const res = await apiClient.post(`/cases/${caseData.caseId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setEvidence((prev) => [res.data.evidence, ...prev]);
        setIsEvidenceModalOpen(false);
        setEvidenceFile(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Evidence upload failed.');
    }
  };

  // Send Secure Mediated Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !caseData) return;

    try {
      const res = await apiClient.post('/messages', {
        caseId: caseData.caseId,
        message: newMessage,
        visibility: 'family_and_investigator',
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.messageDoc]);
        setNewMessage('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to transmit message.');
    }
  };

  if (isLoading || !caseData) {
    return <LoadingSkeleton rows={6} className="py-8" />;
  }

  const yearsMissing = Math.max(0, caseData.estimatedCurrentAge - caseData.ageWhenMissing);

  return (
    <div className="space-y-6">
      {/* Top Banner & Case Header */}
      <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          {/* Photograph */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-sethu-navy-800 border border-slate-200 dark:border-sethu-navy-750 flex-shrink-0 shadow-md">
            {caseData.originalPhotographs?.[0] ? (
              <img
                src={caseData.originalPhotographs[0]}
                alt={caseData.personName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
            <div className="absolute top-2 left-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">
                {caseData.caseId}
              </span>
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {caseData.personName}
              </h1>
              <span className="text-sm font-semibold text-slate-500">
                (Age when missing: {caseData.ageWhenMissing} · Estimated current: {caseData.estimatedCurrentAge})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge level={caseData.riskLevel} />
              <CaseStatusBadge status={caseData.status} />
              <ConsentStatusBadge status={caseData.consentStatus} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-medium">Area: {caseData.approximateLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Date: {new Date(caseData.dateMissing).toLocaleDateString()} ({yearsMissing > 0 ? `${yearsMissing} yrs elapsed` : 'Recent'})</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Assigned: {caseData.assignedInvestigator?.name || 'Inspector Maya Sen'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Exact Location: <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{caseData.lastKnownLocation}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Command Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-sethu-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAiSummary}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Case Summary</span>
            </button>

            <button
              onClick={handleRunAppearanceAnalysis}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Age-Aware Appearance</span>
            </button>

            {isInvestigatorOrAdmin && (
              <>
                <button
                  onClick={handleRunRiskAssessment}
                  disabled={isAiLoading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Risk Triage Evaluation</span>
                </button>

                <button
                  onClick={handleRunMultimodalConnection}
                  disabled={isAiLoading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Multimodal Corridors</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/submit-sighting"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-sethu-navy-850 text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sighting</span>
            </Link>

            {isInvestigatorOrAdmin && (
              <button
                onClick={() => {
                  setTargetConsentStatus('Identity Verified, Consent Pending');
                  setIsConsentModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Consent Protocol</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Progress Notification */}
        {isAiLoading && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 rounded-xl text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2.5 animate-pulse">
            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="font-semibold">{aiMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-sethu-navy-800 flex overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Case Profile', count: undefined },
          { id: 'evidence', label: 'Multimodal Evidence', count: evidence.length },
          { id: 'sightings', label: 'Sightings', count: sightings.length },
          { id: 'ai', label: 'AI Intelligence Center', count: analyses.length },
          { id: 'timeline', label: 'Timeline Milestones', count: timeline.length },
          { id: 'patterns', label: 'Pattern Clusters', count: clusters.length },
          { id: 'messages', label: 'Secure Comms', count: messages.length },
          { id: 'consent', label: 'Consent Wall Protocol', count: undefined },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-sethu-navy-900 text-teal-600 dark:text-teal-400 border-t-2 border-teal-500 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-sethu-navy-800 text-slate-600 dark:text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Physical Traits & Identifying Marks
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {caseData.physicalDescription}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pt-2">
              Recorded Attire at Disappearance
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium">
              {caseData.clothingDescription}
            </div>

            {caseData.vulnerabilityInformation && (
              <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 pt-2">
                  Protected Health / Vulnerability Flags
                </h4>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                  {caseData.vulnerabilityInformation}
                </div>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Circumstances of Disappearance
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {caseData.circumstances}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pt-2">
              Investigative Governance
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div><strong className="text-slate-900 dark:text-white">Registered By:</strong> {caseData.createdBy?.name || 'Verified Family Intake'} ({caseData.createdBy?.role || 'family_member'})</div>
              <div><strong className="text-slate-900 dark:text-white">Lead Investigator:</strong> {caseData.assignedInvestigator?.name || 'Inspector Maya Sen'} (Badge #INV-4402)</div>
              <div><strong className="text-slate-900 dark:text-white">Location Precision:</strong> Neighborhood Level (Coordinate masking active)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multimodal Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Registered photographs, intake police reports, and voice statements for {caseData.personName}.
            </p>
            <button
              onClick={() => setIsEvidenceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Evidence Artifact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-xl space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {Math.round(item.fileSize / 1024)} KB
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.originalFileName}
                </h4>
                {item.extractedText && (
                  <p className="text-[11px] text-slate-500 line-clamp-3 bg-slate-50 dark:bg-sethu-navy-850 p-2 rounded">
                    {item.extractedText}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 pt-1">
                  Access: <strong className="text-teal-600">{item.accessLevel}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Sightings */}
      {activeTab === 'sightings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Linked Sighting Reports ({sightings.length})
            </h3>
            <Link
              to="/submit-sighting"
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              + Submit Sighting
            </Link>
          </div>

          <div className="space-y-3">
            {sightings.map((s) => (
              <div
                key={s.sightingId}
                className="p-5 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      {s.sightingId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {s.reviewStatus}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(s.date).toLocaleDateString()} {s.time}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {s.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-sethu-navy-800">
                  <div><strong>Area:</strong> {s.approximateLocation}</div>
                  <div><strong>Clothing:</strong> {s.clothing || 'Not noted'}</div>
                  <div><strong>Observed Age:</strong> {s.estimatedAge ? `${s.estimatedAge} yrs` : 'Unknown'}</div>
                </div>

                {s.photographs?.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {s.photographs.map((src, i) => (
                      <img key={i} src={src} alt="Sighting" className="w-16 h-16 rounded-lg object-cover border" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Analysis Center */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <PrivacyNotice message="All AI outputs are probabilistic investigative recommendations. They never constitute proof of identity." />

          {analyses.map((analysis) => {
            if (analysis.type === 'SIGHTING_ANALYSIS') {
              return (
                <LeadScoreCard
                  key={analysis._id}
                  score={analysis.result.leadScore}
                  status={analysis.result.potentialLeadStatus}
                  confidenceLabel={analysis.result.confidenceLabel}
                  breakdown={analysis.result.scoreBreakdown}
                  matchingFactors={analysis.result.matchingFactors}
                  conflictingFactors={analysis.result.conflictingFactors}
                  recommendation={analysis.result.investigatorRecommendation}
                  uncertaintyStatement={analysis.result.uncertaintyStatement}
                />
              );
            }

            if (analysis.type === 'AGE_PROGRESSION_APPEARANCE') {
              const res = analysis.result;
              return (
                <div key={analysis._id} className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                    <div>
                      <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
                        PS-16 Multimodal Model
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {res.analysisTitle} (Time Elapsed: {res.timeElapsedYears} years)
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      Biological Maturation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stable Attributes */}
                    <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 space-y-2">
                      <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                        Stable Cranial Landmarks (Reliable)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {res.stableAttributes?.map((attr: any, i: number) => (
                          <li key={i} className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">• {attr.attribute}</span>
                            <span className="text-[11px] text-slate-500 pl-3">{attr.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Changeable Attributes */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-sethu-navy-850 border border-slate-200 dark:border-sethu-navy-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Changeable Physical Traits (Caution)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {res.changeableAttributes?.map((attr: any, i: number) => (
                          <li key={i} className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">• {attr.attribute}</span>
                            <span className="text-[11px] text-slate-500 pl-3">{attr.expectedVariations}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <strong>Investigator Review Considerations: </strong>
                    {res.investigatorReviewConsiderations?.join(' ')}
                  </div>

                  <div className="text-[11px] text-slate-400 italic pt-1">
                    {res.uncertaintyStatement}
                  </div>
                </div>
              );
            }

            if (analysis.type === 'CASE_SUMMARY') {
              const res = analysis.result;
              return (
                <div key={analysis._id} className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Executive Investigative Case Summary
                    </h3>
                    <span className="text-xs text-slate-400">{analysis.engineModel}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {res.executiveSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Key Known Facts
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {res.keyFacts?.map((fact: string, i: number) => (
                          <li key={i}>• {fact}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Critical Information Gaps
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {res.missingInformationGaps?.map((gap: string, i: number) => (
                          <li key={i}>• {gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 italic">
                    {res.uncertaintyStatement}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Tab 5: Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Unified Chronological Investigation Milestones
          </h3>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-sethu-navy-800">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-sethu-navy-900 shadow-sm" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{event.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Patterns */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Correlated Multi-Signal Pattern Clusters ({clusters.length})
            </h3>
            <Link to="/patterns" className="text-xs text-teal-600 font-bold hover:underline">
              Inspect Cross-Case Map →
            </Link>
          </div>

          {clusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="p-6 bg-white dark:bg-sethu-navy-900 border border-purple-200 dark:border-purple-900/40 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cluster.title}</h4>
                </div>
                <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200">
                  Relevance: {cluster.relevanceScore}/100
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {cluster.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-sethu-navy-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Shared Sector: {cluster.sharedArea}</span>
                <Link to="/patterns" className="font-bold text-purple-600 hover:underline">
                  Review Supporting Factors →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: Secure Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Mediated Case Channel
              </h3>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
              Automated Contact Redaction Active
            </span>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 p-2">
            {messages.map((m) => (
              <div
                key={m._id}
                className={`p-3 rounded-xl max-w-lg text-xs space-y-1 ${
                  m.senderId?._id === user?.id
                    ? 'ml-auto bg-teal-600 text-white'
                    : 'mr-auto bg-slate-100 dark:bg-sethu-navy-850 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                  <span className="font-bold">{m.senderId?.name || 'Authorized Party'}</span>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-relaxed">{m.message}</p>
                {m.hasRedactedContactInfo && (
                  <span className="text-[10px] italic block opacity-75">
                    [Direct contact details withheld by SETHU privacy protocol]
                  </span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-sethu-navy-800">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type mediated message (phone numbers and emails will be automatically withheld)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 8: Consent Wall */}
      {activeTab === 'consent' && (
        <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-sethu-navy-800">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Ethical Safeguard Terminal
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Case Consent & Disclosure Wall
              </h3>
            </div>
            <ConsentStatusBadge status={caseData.consentStatus} />
          </div>

          <PrivacyNotice message="Finding someone does not automatically mean exposing someone. When identity is verified, private coordinates remain restricted until authorized consent review completes." />

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-sethu-navy-850 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Active Privacy State:</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Current protocol requires that exact whereabouts and private contact numbers remain inaccessible to family members until an authorized investigator logs verified consent.
            </p>
          </div>

          <Link
            to="/consent-wall"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            Open Dedicated Consent Wall Terminal →
          </Link>
        </div>
      )}

      {/* Consent State Transition Modal */}
      <ConfirmationModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConfirmConsentUpdate}
        title="Update Consent Wall Protocol"
        description="Transitioning this case's consent state will alter the visibility of contact and location fields across all portal accounts."
        confirmText="Record Consent Decision"
        requireReason={true}
        reasonPlaceholder="Document statutory justification (e.g. subject verified at shelter, consent interview conducted)..."
      />

      {/* Evidence Upload Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-sethu-navy-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Attach Evidence Artifact</h3>
            <form onSubmit={handleUploadEvidence} className="space-y-4 text-xs">
              <input
                type="file"
                required
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                className="w-full text-xs p-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
