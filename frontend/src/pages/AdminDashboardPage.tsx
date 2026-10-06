import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, AlertTriangle, Activity, Check, X, ShieldAlert, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import apiClient from '../api/client';
import { User, FraudFlag, UserRole } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'fraud' | 'analytics'>('users');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, flagsRes, analyticsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/fraud-flags'),
        apiClient.get('/admin/analytics'),
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (flagsRes.data.success) setFlags(flagsRes.data.flags);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId || (u as any)._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleResolveFlag = async (flagId: string, status: 'reviewed' | 'dismissed' | 'action_taken') => {
    try {
      const res = await apiClient.patch(`/admin/fraud-flags/${flagId}`, {
        status,
        resolutionReason: `Admin marked flag as ${status}`,
      });
      if (res.data.success) {
        setFlags((prev) =>
          prev.map((f) => (f._id === flagId ? { ...f, status } : f))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve flag.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  const COLORS = ['#0D9488', '#F59E0B', '#EF4444', '#6366F1'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Platform Governance & Administration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional access control, anti-fraud oversight, and multi-tenant telemetry.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-sethu-navy-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-sethu-navy-900 text-teal-600 border-t-2 border-teal-500 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Role Governance ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`py-3 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'fraud'
              ? 'bg-white dark:bg-sethu-navy-900 text-teal-600 border-t-2 border-teal-500 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Integrity & Anti-Fraud Queue ({flags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-sethu-navy-900 text-teal-600 border-t-2 border-teal-500 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Analytics</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-sethu-navy-850 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Role Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-sethu-navy-800">
                {users.map((u) => (
                  <tr key={u.id || (u as any)._id} className="hover:bg-slate-50/50 dark:hover:bg-sethu-navy-850/50">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <span className="text-[10px] text-slate-400">{u.organizationName || 'Individual Account'}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {u.phoneNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id || (u as any)._id, e.target.value as UserRole)}
                        className="text-[11px] p-1.5 rounded-lg border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 font-medium"
                      >
                        <option value="public_reporter">Public Reporter</option>
                        <option value="family_member">Family Member</option>
                        <option value="investigator">Investigator</option>
                        <option value="verified_org">Verified Organization</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Fraud Flags */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Automated anti-fraud guards detecting perceptual image collisions, flood submissions, and suspicious report velocities.
          </p>

          <div className="space-y-3">
            {flags.map((flag) => (
              <div
                key={flag._id}
                className="p-5 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      {flag.type}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Severity: {flag.severity}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${flag.status === 'pending' ? 'text-amber-600' : 'text-slate-400'}`}>
                    {flag.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {flag.reason}
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-sethu-navy-800 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Logged: {new Date(flag.createdAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveFlag(flag._id, 'reviewed')}
                      className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleResolveFlag(flag._id, 'dismissed')}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cases by Operational Status
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts?.casesByStatus || []}>
                    <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Risk Classification Ratio
              </h4>
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.charts?.casesByRisk || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analytics.charts?.casesByRisk?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
