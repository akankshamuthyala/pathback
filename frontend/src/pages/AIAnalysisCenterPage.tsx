import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Eye, AlertTriangle, GitMerge, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import { MissingCase, AIAnalysis } from '../types';
import { LeadScoreCard } from '../components/common/LeadScoreCard';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AIAnalysisCenterPage: React.FC = () => {
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [activeEngine, setActiveEngine] = useState<'summary' | 'appearance' | 'risk' | 'connection'>('summary');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    apiClient.get('/cases').then((res) => {
      if (res.data.success && res.data.cases.length > 0) {
        setCases(res.data.cases);
        setSelectedCaseId(res.data.cases[0].caseId);
      }
    });
  }, []);

  const handleRunAnalysis = async (engine: 'summary' | 'appearance' | 'risk' | 'connection') => {
    if (!selectedCaseId) return;
    setIsRunning(true);
    setActiveEngine(engine);
    setAnalysisResult(null);

    const endpoints = {
      summary: `/ai/cases/${selectedCaseId}/summary`,
      appearance: `/ai/cases/${selectedCaseId}/appearance-analysis`,
      risk: `/ai/cases/${selectedCaseId}/risk-assessment`,
      connection: `/ai/cases/${selectedCaseId}/multimodal-connection`,
    };

    const messages = {
      summary: 'Synthesizing objective case summary across intake files and timeline...',
      appearance: 'Executing Age-Aware Appearance biological maturation modeling...',
      risk: 'Evaluating deterministic risk rules & situational factors...',
      connection: 'Correlating cross-modal transit corridors and potential contradictions...',
    };

    setStatusMessage(messages[engine]);

    try {
      const res = await apiClient.post(endpoints[engine]);
      if (res.data.success) {
        setAnalysisResult(res.data.analysis);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'AI engine execution failed.');
    } finally {
      setIsRunning(false);
      setStatusMessage('');
    }
  };

  const selectedCase = cases.find((c) => c.caseId === selectedCaseId);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Multimodal AI Analysis Center
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Anthropic Claude 3.7 Sonnet decision intelligence suite. Objective, explainable investigative recommendations.
        </p>
      </div>

      <PrivacyNotice message="All AI outputs are probabilistic decision-support aids. Automated identity confirmation is strictly prohibited by SETHU Responsible AI policy." />

      {/* Target Case Selector */}
      <div className="p-5 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Missing-Person Case
          </label>
          <select
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value);
              setAnalysisResult(null);
            }}
            className="w-full sm:w-96 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 font-semibold"
          >
            {cases.map((c) => (
              <option key={c._id} value={c.caseId}>
                [{c.caseId}] {c.personName} ({c.estimatedCurrentAge} yrs) — {c.approximateLocation}
              </option>
            ))}
          </select>
        </div>

        {selectedCase && (
          <div className="text-right text-xs text-slate-500 hidden sm:block">
            <div>Baseline: <strong>Age {selectedCase.ageWhenMissing}</strong> · Missing since {new Date(selectedCase.dateMissing).toLocaleDateString()}</div>
            <div className="text-[11px] text-teal-600 font-semibold">Priority: {selectedCase.riskLevel}</div>
          </div>
        )}
      </div>

      {/* 4 Engine Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'summary',
            title: 'Case Summary Engine',
            desc: 'Synthesizes known facts, information gaps, and timeline milestones.',
            icon: FileText,
            color: 'teal',
          },
          {
            id: 'appearance',
            title: 'Age-Aware Appearance',
            desc: 'Separates stable cranial landmarks from changeable grooming traits.',
            icon: Eye,
            color: 'blue',
          },
          {
            id: 'risk',
            title: 'Risk Assessment Engine',
            desc: 'Calculates rule-based vulnerability priority (NORMAL, HIGH, CRITICAL).',
            icon: AlertTriangle,
            color: 'purple',
          },
          {
            id: 'connection',
            title: 'Multimodal Connections',
            desc: 'Discovers shared transit corridors, contradictions, and duplicates.',
            icon: GitMerge,
            color: 'emerald',
          },
        ].map((engine) => {
          const Icon = engine.icon;
          const isCurrent = activeEngine === engine.id;
          return (
            <button
              key={engine.id}
              onClick={() => handleRunAnalysis(engine.id as any)}
              disabled={isRunning}
              className={`p-5 rounded-2xl border text-left transition-all space-y-3 ${
                isCurrent
                  ? 'bg-white dark:bg-sethu-navy-900 border-teal-500 shadow-md ring-2 ring-teal-400/20'
                  : 'bg-white/60 dark:bg-sethu-navy-900/60 border-slate-200 dark:border-sethu-navy-800 hover:border-teal-400'
              } disabled:opacity-50`}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{engine.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{engine.desc}</p>
              </div>
              <div className="pt-1 flex items-center text-[11px] font-bold text-teal-600">
                <span>Run Engine</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Spinner */}
      {isRunning && (
        <div className="p-8 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{statusMessage}</p>
          <p className="text-[11px] text-slate-400">Validating output with strict Zod schema contracts...</p>
        </div>
      )}

      {/* Results Viewport */}
      {analysisResult && !isRunning && (
        <div className="space-y-6">
          {/* Summary Engine Result */}
          {analysisResult.type === 'CASE_SUMMARY' && (
            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Synthesized Case Summary
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                  {analysisResult.engineModel}
                </span>
              </div>

              <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {analysisResult.result.executiveSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-sethu-navy-850 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Known Factual Records
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {analysisResult.result.keyFacts?.map((fact: string, i: number) => (
                      <li key={i}>• {fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Missing Information Gaps
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {analysisResult.result.missingInformationGaps?.map((gap: string, i: number) => (
                      <li key={i}>• {gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-sethu-navy-800">
                {analysisResult.result.uncertaintyStatement}
              </div>
            </div>
          )}

          {/* Age-Aware Appearance Result */}
          {analysisResult.type === 'AGE_PROGRESSION_APPEARANCE' && (
            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Age-Aware Appearance Analysis Profile
                </h3>
                <span className="text-[11px] font-semibold text-blue-600">
                  Time Elapsed: {analysisResult.result.timeElapsedYears} years
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    Stable Anatomical Landmarks
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.result.stableAttributes?.map((attr: any, i: number) => (
                      <li key={i}>
                        <strong className="block text-slate-900 dark:text-white">{attr.attribute}</strong>
                        <span className="text-slate-500 text-[11px]">{attr.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-sethu-navy-850 border border-slate-200 dark:border-sethu-navy-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Changeable & Grooming Traits
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.result.changeableAttributes?.map((attr: any, i: number) => (
                      <li key={i}>
                        <strong className="block text-slate-900 dark:text-white">{attr.attribute}</strong>
                        <span className="text-slate-500 text-[11px]">{attr.expectedVariations}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs space-y-1 text-blue-900 dark:text-blue-200">
                <span className="font-bold">Investigator Considerations:</span>
                <p>{analysisResult.result.investigatorReviewConsiderations?.join(' ')}</p>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                {analysisResult.result.uncertaintyStatement}
              </div>
            </div>
          )}

          {/* Risk Assessment Result */}
          {analysisResult.type === 'RISK_ASSESSMENT' && (
            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                  Deterministic Risk Assessment Triage
                </h3>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  {analysisResult.result.riskLevel} (Priority Score: {analysisResult.result.priorityScore}/100)
                </span>
              </div>

              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                {analysisResult.result.investigativeExplanation}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Primary Contributing Vulnerability Factors
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {analysisResult.result.primaryContributingFactors?.map((factor: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-sethu-navy-850 p-2.5 rounded-lg">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                {analysisResult.result.uncertaintyStatement}
              </div>
            </div>
          )}

          {/* Multimodal Connection Result */}
          {analysisResult.type === 'MULTIMODAL_CONNECTION' && (
            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-emerald-600" />
                  Multimodal Cross-Evidence Synthesizer
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Correlation Confidence: {analysisResult.confidence}%
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {analysisResult.result.connectionSummary}
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Corroborated Corridors
                </h4>
                {analysisResult.result.sharedCorridors?.map((corr: any, i: number) => (
                  <div key={i} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">{corr.theme}</span>
                    <p className="text-slate-600 dark:text-slate-400">{corr.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Evidence References: {corr.evidenceReferences?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 italic">
                {analysisResult.result.uncertaintyStatement}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
