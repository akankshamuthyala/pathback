import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

interface ScoreBreakdown {
  appearanceRelevance?: number;
  ageCompatibility?: number;
  locationRelevance?: number;
  timelineRelevance?: number;
  clothingConsistency?: number;
  descriptionConsistency?: number;
  sourceReliabilityScore?: number;
  [key: string]: number | undefined;
}

interface LeadScoreCardProps {
  score: number;
  status: string;
  confidenceLabel?: string;
  breakdown?: ScoreBreakdown;
  matchingFactors?: string[];
  conflictingFactors?: string[];
  recommendation?: string;
  uncertaintyStatement?: string;
  className?: string;
}

export const LeadScoreCard: React.FC<LeadScoreCardProps> = ({
  score,
  status,
  confidenceLabel,
  breakdown,
  matchingFactors = [],
  conflictingFactors = [],
  recommendation,
  uncertaintyStatement,
  className = '',
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 75) return 'text-amber-600 bg-amber-500';
    if (val >= 50) return 'text-teal-600 bg-teal-500';
    return 'text-slate-600 bg-slate-400';
  };

  const factorLabels: Record<string, string> = {
    appearanceRelevance: 'Coarse Appearance',
    ageCompatibility: 'Age Compatibility',
    locationRelevance: 'Spatial Proximity',
    timelineRelevance: 'Timeline Alignment',
    clothingConsistency: 'Attire Consistency',
    descriptionConsistency: 'Witness Consistency',
    sourceReliabilityScore: 'Source Reliability',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}>
      {/* Header with Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Multi-Factor AI Lead Score
            </span>
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {confidenceLabel || 'Probabilistic Model'}
            </span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {status}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
              {score}<span className="text-base font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[11px] text-slate-500">Correlation Index</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getScoreColor(score).split(' ')[1]}`}
            >
              {score}%
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      {breakdown && (
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Multi-Signal Factor Breakdown
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {Object.entries(breakdown).map(([key, val]) => {
              if (val === undefined) return null;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{factorLabels[key] || key}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreColor(val).split(' ')[1]}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supporting vs Conflicting Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {/* Supporting Factors */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Supporting Factors ({matchingFactors.length})
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {matchingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conflicting Factors */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-2 uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            Conflicting Factors / Gaps ({conflictingFactors.length})
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {conflictingFactors.length > 0 ? (
              conflictingFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No acute contradictions recorded in dataset.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Investigator Recommendation */}
      {recommendation && (
        <div className="mt-2 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 dark:text-teal-200">
            <span className="font-semibold">Investigator Action Recommendation: </span>
            {recommendation}
          </div>
        </div>
      )}

      {/* Uncertainty Disclaimer */}
      {uncertaintyStatement && (
        <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 italic border-t border-slate-100 dark:border-slate-800 pt-3">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{uncertaintyStatement}</span>
        </div>
      )}
    </div>
  );
};
