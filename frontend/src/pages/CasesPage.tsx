import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import { MissingCase, RiskLevel, CaseStatus } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { CaseStatusBadge } from '../components/common/CaseStatusBadge';
import { ConsentStatusBadge } from '../components/common/ConsentStatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [riskFilter, statusFilter]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (riskFilter) params.riskLevel = riskFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/cases', { params });
      if (res.data.success) {
        setCases(res.data.cases);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Missing-Person Case Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized investigative case files with privacy redactions applied for sensitive coordinates.
          </p>
        </div>

        <Link
          to="/cases/create"
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Case</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by person name, Case ID, or location..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 outline-none"
          >
            <option value="">All Risk Priorities</option>
            <option value="CRITICAL">Critical Urgency</option>
            <option value="HIGH">High Risk</option>
            <option value="NORMAL">Normal Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 outline-none"
          >
            <option value="">All Case Statuses</option>
            <option value="Active">Active Search</option>
            <option value="Under Review">Under Review</option>
            <option value="Potential Lead">Potential Lead</option>
            <option value="Located">Located</option>
            <option value="Consent Pending">Consent Pending</option>
            <option value="Reunification Supported">Reunification Supported</option>
          </select>
        </div>
      </div>

      {/* Case Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <Link
              key={c.caseId}
              to={`/cases/${c.caseId}`}
              className="group bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-teal-500 transition-all flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 bg-slate-100 dark:bg-sethu-navy-850 overflow-hidden">
                {c.originalPhotographs?.[0] ? (
                  <img
                    src={c.originalPhotographs[0]}
                    alt={c.personName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Photograph Available
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <RiskBadge level={c.riskLevel} />
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-sethu-navy-950/80 text-white backdrop-blur-sm">
                  {c.caseId}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {c.personName}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Age: {c.estimatedCurrentAge} yrs
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.physicalDescription}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{c.approximateLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Missing since {new Date(c.dateMissing).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-sethu-navy-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <CaseStatusBadge status={c.status} />
                    <ConsentStatusBadge status={c.consentStatus} showIcon={false} />
                  </div>
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Matching Cases Found"
          description="Try clearing your search query or adjusting the risk and status filter selections."
          actionText="Reset All Filters"
          onAction={() => {
            setSearch('');
            setRiskFilter('');
            setStatusFilter('');
          }}
        />
      )}
    </div>
  );
};
