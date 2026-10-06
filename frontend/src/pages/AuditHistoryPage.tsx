import React, { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, Calendar, User, Info } from 'lucide-react';
import apiClient from '../api/client';
import { AuditLog } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AuditHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await apiClient.get('/audit-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CONSENT')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (action.includes('AI')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (action.includes('CREATED') || action.includes('APPROVED')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('REJECTED') || action.includes('FLAG')) return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              System Audit & Integrity Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological log of all case access, AI inferences, lead decisions, and consent changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-white dark:bg-sethu-navy-900 font-semibold"
          >
            <option value="">All Audit Actions</option>
            <option value="CONSENT_STATUS_MODIFIED">Consent Modified</option>
            <option value="CASE_CREATED">Case Created</option>
            <option value="SIGHTING_SUBMITTED">Sighting Submitted</option>
            <option value="AI_CASE_SUMMARY_GENERATED">AI Summary Run</option>
            <option value="PATTERN_CLUSTER_REVIEWED">Cluster Reviewed</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-sethu-navy-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor & Role</th>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Documented Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-sethu-navy-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-sethu-navy-850/50">
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.actorName || 'System'}</div>
                      <span className="text-[10px] text-teal-600 font-medium uppercase">{log.role}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.entityType} ({log.entityId || 'Global'})
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 max-w-md truncate">
                      {log.reason || 'Standard operational checkpoint recorded.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
