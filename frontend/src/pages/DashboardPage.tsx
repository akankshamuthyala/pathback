import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Eye,
  GitMerge,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MissingCase, Sighting, PatternCluster } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { CaseStatusBadge } from '../components/common/CaseStatusBadge';
import { ConsentStatusBadge } from '../components/common/ConsentStatusBadge';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [clusters, setClusters] = useState<PatternCluster[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, sightingsRes, clustersRes] = await Promise.all([
          apiClient.get('/cases'),
          apiClient.get('/sightings'),
          apiClient.get('/patterns'),
        ]);

        if (casesRes.data.success) setCases(casesRes.data.cases);
        if (sightingsRes.data.success) setSightings(sightingsRes.data.sightings);
        if (clustersRes.data.success) setClusters(clustersRes.data.clusters);

        if (user?.role === 'admin' || user?.role === 'investigator') {
          const analyticsRes = await apiClient.get('/admin/analytics').catch(() => null);
          if (analyticsRes?.data?.success) {
            setAnalytics(analyticsRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  const highRiskCases = cases.filter((c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH');
  const pendingReviews = sightings.filter(
    (s) => s.reviewStatus === 'Pending Review' || s.reviewStatus === 'Potential Lead'
  );
  const locatedCases = cases.filter((c) => c.status === 'Located' || c.consentStatus !== 'Not Yet Located');

  // Chart Colors
  const RISK_COLORS = {
    NORMAL: '#10B981',
    HIGH: '#F59E0B',
    CRITICAL: '#EF4444',
  };

  const chartRiskData = [
    {
      name: 'Normal Priority',
      value: cases.filter((c) => c.riskLevel === 'NORMAL').length,
      color: RISK_COLORS.NORMAL,
      desc: 'Adult case (30 yrs) under standard investigation protocol',
    },
    {
      name: 'High Risk',
      value: cases.filter((c) => c.riskLevel === 'HIGH').length,
      color: RISK_COLORS.HIGH,
      desc: 'Minor child status (9 yrs) & rapid transit corridor cluster',
    },
    {
      name: 'Critical Urgency',
      value: cases.filter((c) => c.riskLevel === 'CRITICAL').length,
      color: RISK_COLORS.CRITICAL,
      desc: 'Young child (5 yrs) rapid protection protocol',
    },
  ];

  const chartStatusData = [
    { status: 'Active Search', count: cases.filter((c) => c.status === 'Active').length },
    { status: 'Under Review', count: cases.filter((c) => c.status === 'Under Review').length },
    { status: 'Potential Lead', count: cases.filter((c) => c.status === 'Potential Lead').length },
    { status: 'Located / Consent', count: locatedCases.length },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.role === 'family_member'
                ? `Family Case Monitor — ${user.name}`
                : user?.role === 'admin'
                ? `Operational Command & Governance — ${user.name}`
                : `Investigative Operations Center — ${user?.name}`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SETHU Decision Intelligence Engine — Synthetic records active in evaluation sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cases/create"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span>Open New Case</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/submit-sighting"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-sethu-navy-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Submit Sighting
          </Link>
        </div>
      </div>

      <PrivacyNotice />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cases</span>
            <FolderOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{cases.length}</div>
          <div className="text-[11px] text-slate-400">Under coordinated tracking</div>
        </div>

        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Elevated Risk</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{highRiskCases.length}</div>
          <div className="text-[11px] text-slate-400">Minors / Medical priorities</div>
        </div>

        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Sighting Reports</span>
            <Eye className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{sightings.length}</div>
          <div className="text-[11px] text-teal-600 font-medium">
            {pendingReviews.length} awaiting human review
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pattern Clusters</span>
            <GitMerge className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{clusters.length}</div>
          <div className="text-[11px] text-slate-400">6-Signal transit corridors</div>
        </div>
      </div>

      {/* Analytics Visualizations (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Risk Priority Distribution
            </h3>
            <span className="text-[10px] text-slate-400">Triage Safety Engine</span>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const total = chartRiskData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                      const percent = Math.round((Number(data.value) / total) * 100);
                      const desc = (data.payload as any)?.desc;
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-[#F2E6EC] shadow-2xl rounded-xl p-3.5 text-xs min-w-[230px] z-50 pointer-events-none">
                          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: data.payload?.color || data.color }}
                            />
                            <span className="font-bold text-slate-900 text-xs tracking-wide">
                              {data.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700 font-semibold py-0.5">
                            <span className="text-[11px] text-slate-500">Active Cases:</span>
                            <span className="font-bold text-plum-700 bg-plum-50 px-2 py-0.5 rounded text-[11px] border border-plum-100">
                              {data.value} {Number(data.value) === 1 ? 'case' : 'cases'} ({percent}%)
                            </span>
                          </div>
                          {desc && (
                            <div className="text-[10px] text-slate-600 mt-2 pt-1.5 border-t border-slate-100 leading-relaxed font-normal">
                              <span className="font-medium text-slate-800">Operational Focus:</span> {desc}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs text-slate-600 dark:text-slate-400 pt-1">
            {chartRiskData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Status Distribution Bar Chart */}
        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Case Lifecycle Status Breakdown
            </h3>
            <span className="text-[10px] text-slate-400">Operational Pipeline</span>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-[#F2E6EC] shadow-2xl rounded-xl p-3 text-xs min-w-[190px] z-50 pointer-events-none">
                          <div className="font-bold text-slate-900 mb-1 pb-1 border-b border-slate-100">
                            {label || (data.payload as any)?.status}
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-[11px] text-slate-500">Pipeline Count:</span>
                            <span className="font-bold text-plum-700 bg-plum-50 px-2 py-0.5 rounded text-[11px] border border-plum-100">
                              {data.value} {Number(data.value) === 1 ? 'case' : 'cases'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#844377" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            All located cases are strictly shielded under the Consent Wall protocol before family notification.
          </div>
        </div>
      </div>

      {/* High Priority Active Cases & Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Board */}
        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-teal-600" />
              Active Missing-Person Cases ({cases.length})
            </h3>
            <Link to="/cases" className="text-xs text-teal-600 hover:underline font-semibold">
              View All Cases
            </Link>
          </div>

          <div className="space-y-3">
            {cases.map((c) => (
              <Link
                key={c.caseId}
                to={`/cases/${c.caseId}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-sethu-navy-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all flex items-start gap-3.5 bg-slate-50/50 dark:bg-sethu-navy-850/50 block"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {c.originalPhotographs?.[0] ? (
                    <img src={c.originalPhotographs[0]} alt={c.personName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.personName} ({c.estimatedCurrentAge} yrs)
                    </h4>
                    <RiskBadge level={c.riskLevel} />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Last Area: {c.approximateLocation}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <CaseStatusBadge status={c.status} />
                    <ConsentStatusBadge status={c.consentStatus} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Investigator Review Queue & Pattern Alerts */}
        <div className="p-5 bg-white dark:bg-sethu-navy-900 rounded-2xl border border-slate-200 dark:border-sethu-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Human Review & Sighting Queue ({pendingReviews.length})
            </h3>
            <Link to="/reviews" className="text-xs text-teal-600 hover:underline font-semibold">
              Open Review Terminal
            </Link>
          </div>

          <div className="space-y-3">
            {pendingReviews.length > 0 ? (
              pendingReviews.map((s) => (
                <div
                  key={s.sightingId}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
                        {s.sightingId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        {s.reviewStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(s.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                    {s.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-100 dark:border-amber-900/30">
                    <span className="text-slate-500">Area: {s.approximateLocation}</span>
                    <Link
                      to="/reviews"
                      className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>Audit Lead</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                No sightings currently awaiting human verification.
              </div>
            )}

            {/* Pattern cluster alert */}
            {clusters[0] && (
              <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                    <GitMerge className="w-3.5 h-3.5 text-purple-600" />
                    {clusters[0].title}
                  </span>
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400">
                    Relevance: {clusters[0].relevanceScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {clusters[0].description}
                </p>
                <div className="pt-1 flex justify-end">
                  <Link
                    to="/patterns"
                    className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect 6-Signal Cluster</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
