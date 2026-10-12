'use client';

import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import {
  ShieldAlert,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Building,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  PlusCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User editing modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('OFFICER');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdminData = async () => {
    try {
      const analyticsRes = await fetch('/api/admin/analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      const deptsRes = await fetch('/api/admin/departments');
      const deptsData = await deptsRes.json();
      setDepartments(deptsData.departments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUserRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: selectedRole,
          departmentId: selectedDeptId || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update user role');
      fetchAdminData();
      setEditingUser(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading admin control portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-7 h-7 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">System Admin & Analytics Portal</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Municipal performance analytics, user role administration, SLA escalation rules, and audit logs.
            </p>
          </div>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-mono">
            ROLE: SYSTEM ADMINISTRATOR
          </span>
        </div>

        {/* System Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Registered Users</span>
            <p className="text-3xl font-extrabold text-white font-mono mt-1">{analytics?.totalUsers || 0}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Complaints</span>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{analytics?.totalComplaints || 0}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Resolution Rate</span>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{analytics?.resolutionRate || 0}%</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Avg Resolution Time</span>
            <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{analytics?.avgResolutionHours || 0}h</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">SLA Overdue Queue</span>
            <p className="text-3xl font-extrabold text-rose-500 font-mono mt-1">{analytics?.overdueCount || 0}</p>
          </div>
        </div>

        {/* Complaints Breakdown Graphs / Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complaints by Category */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Complaints by Category
            </h3>
            <div className="space-y-2 text-xs">
              {analytics?.complaintsByCategory?.map((c: any) => (
                <div key={c.code} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{c.name}</span>
                    <span className="font-bold font-mono">{c.count} tickets</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (c.count / (analytics.totalComplaints || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints by Locality */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" /> Complaints by Top Localities
            </h3>
            <div className="space-y-3 text-xs">
              {analytics?.complaintsByLocation?.map((l: any) => (
                <div key={l.location} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-white">{l.location}</span>
                  <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-mono font-bold">
                    {l.count} Issues
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Role Management Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Manage Users & Department Officer Accounts
            </h2>
            <span className="text-xs text-slate-400">{users.length} Registered Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/50">
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        u.role === 'OFFICER' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{u.department?.name || 'Unassigned'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setSelectedRole(u.role);
                          setSelectedDeptId(u.departmentId || '');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Audit Log Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" /> Administrative Audit Log History
            </h2>
            <span className="text-xs text-slate-400">Security Audit Trail</span>
          </div>

          <div className="space-y-2">
            {analytics?.auditLogs?.map((log: any) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400 font-mono">{log.action}</span>
                  <p className="text-slate-300 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">By {log.user?.name || 'System'} ({log.userRole})</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit User Modal Dialog */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
              <h3 className="font-bold text-lg text-white">Modify User Role for {editingUser.name}</h3>

              <form onSubmit={handleUserRoleUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">User Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="OFFICER">OFFICER (Department Officer)</option>
                    <option value="ADMIN">ADMIN (Full Controller)</option>
                  </select>
                </div>

                {selectedRole === 'OFFICER' && (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Assign Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
