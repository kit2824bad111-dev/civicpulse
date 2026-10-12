'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import {
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Send,
  FileText,
  MapPin,
  ChevronRight,
  Filter,
  UserCheck,
} from 'lucide-react';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [outages, setOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Active selected complaint for status editing
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [officialRemark, setOfficialRemark] = useState('');
  const [estimatedRestoration, setEstimatedRestoration] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Active outage verification modal state
  const [selectedOutage, setSelectedOutage] = useState<any | null>(null);
  const [confirmedReason, setConfirmedReason] = useState('');
  const [outageStatus, setOutageStatus] = useState('REPAIRING');

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      const compRes = await fetch('/api/complaints?all=true');
      const compData = await compRes.json();
      setComplaints(compData.complaints || []);

      const outRes = await fetch('/api/outages');
      const outData = await outRes.json();
      setOutages(outData.outages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplaintUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    setUpdateSuccess('');

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          officialRemark,
          estimatedRestoration: estimatedRestoration || null,
          evidenceUrl: evidenceUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update complaint');

      setUpdateSuccess('Official remark and status updated successfully!');
      fetchData();
      setTimeout(() => setSelectedComplaint(null), 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleOutageVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutage) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/outages/${selectedOutage.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedReason,
          expectedRestoration: estimatedRestoration || null,
          status: outageStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to verify outage');
      fetchData();
      setSelectedOutage(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const totalAssigned = complaints.length;
  const pendingCount = complaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(c.status)).length;
  const highPriorityCount = complaints.filter(c => ['HIGH', 'URGENT'].includes(c.calculatedPriority || c.priority)).length;

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-teal-400" />
              <h1 className="text-2xl font-bold text-white">Department Officer Portal</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Officer: <strong className="text-teal-300">{user?.name || 'Officer Rajesh Kumar'}</strong> ({user?.department?.name || 'Electricity Distribution Board'})
            </p>
          </div>
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1 rounded-full font-mono">
            AUTHORIZATION: DEPARTMENT OFFICER
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Department Tickets</span>
            <p className="text-3xl font-extrabold text-white font-mono mt-1">{totalAssigned}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Pending Review</span>
            <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{pendingCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Urgent & High Priority</span>
            <p className="text-3xl font-extrabold text-rose-400 font-mono mt-1">{highPriorityCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Active Outages</span>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
              {outages.filter(o => o.isCurrentlyOff).length}
            </p>
          </div>
        </div>

        {/* Electricity Outages Verification Table for Officers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Active Electricity Outage Incidents
            </h2>
            <span className="text-xs text-slate-400">Provide official confirmed reason & restoration estimates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outages.map((o) => (
              <div key={o.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{o.title}</span>
                  <StatusBadge status={o.status} />
                </div>

                <div className="text-slate-400 space-y-1">
                  <p><strong>Locality:</strong> {o.locality}</p>
                  <p><strong>Weather:</strong> {o.weatherCondition || 'Normal'}</p>
                  <p className="text-teal-300"><strong>Official Reason:</strong> {o.confirmedReason || 'Pending officer input'}</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedOutage(o);
                    setConfirmedReason(o.confirmedReason || '');
                    setOutageStatus(o.status);
                  }}
                  className="w-full py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 font-semibold transition"
                >
                  Edit Official Outage Reason & Restoration Time
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Outage Reason Modal Dialog */}
        {selectedOutage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
              <h3 className="font-bold text-lg text-white">Provide Official Outage Explanation</h3>
              <p className="text-xs text-slate-400">This explanation will be published to all affected citizen dashboards.</p>

              <form onSubmit={handleOutageVerifySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Confirmed Official Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={confirmedReason}
                    onChange={(e) => setConfirmedReason(e.target.value)}
                    placeholder="e.g. Substation 11kV Feeder Trip due to storm line snapping at Pappampatti junction"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Estimated Restoration Time</label>
                  <input
                    type="datetime-local"
                    value={estimatedRestoration}
                    onChange={(e) => setEstimatedRestoration(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Outage Incident Status</label>
                  <select
                    value={outageStatus}
                    onChange={(e) => setOutageStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="REPAIRING">REPAIRING</option>
                    <option value="RESTORED">RESTORED (Power Supply Back)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOutage(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold"
                  >
                    Save & Broadcast Official Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assigned Complaints Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Assigned Civic Complaints Workspace
            </h2>
            <span className="text-xs text-slate-400">{complaints.length} Total Complaints</span>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{c.refNumber}</span>
                    <span className="text-xs text-slate-400">({c.category?.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={c.calculatedPriority || c.priority} isEmergency={c.isEmergency} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <h3 className="font-bold text-white text-sm">{c.title}</h3>
                <p className="text-xs text-slate-400">{c.description}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Area: <strong className="text-slate-200">{c.locationName}</strong></span>

                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setNewStatus(c.status);
                      setOfficialRemark('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 font-semibold transition"
                  >
                    Update Official Remarks & Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Complaint Modal Dialog */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
              <h3 className="font-bold text-lg text-white">Update Complaint #{selectedComplaint.refNumber}</h3>
              {updateSuccess && <div className="p-3 bg-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold">{updateSuccess}</div>}

              <form onSubmit={handleComplaintUpdateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">New Complaint Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS (Squad Dispatched)</option>
                    <option value="AWAITING_INFO">AWAITING INFO</option>
                    <option value="RESOLVED">RESOLVED (Issue Fixed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Official Remarks / Department Response</label>
                  <textarea
                    required
                    rows={3}
                    value={officialRemark}
                    onChange={(e) => setOfficialRemark(e.target.value)}
                    placeholder="Enter official status findings, squad updates, or completion notes..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Estimated Restoration / Completion Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={estimatedRestoration}
                    onChange={(e) => setEstimatedRestoration(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Resolution Evidence Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Photo URL proving issue resolution"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold"
                  >
                    Save & Update Ticket
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
