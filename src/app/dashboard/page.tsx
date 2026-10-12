'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  LayoutDashboard,
  Zap,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  Bell,
  MapPin,
} from 'lucide-react';

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [outages, setOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      const compRes = await fetch('/api/complaints?myComplaints=true');
      const compData = await compRes.json();
      setComplaints(compData.complaints || []);

      const outRes = await fetch('/api/outages?isCurrentlyOff=true');
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

  const totalSubmitted = complaints.length;
  const openCount = complaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'AWAITING_INFO'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                Welcome, {user?.name || 'Citizen'} 👋
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {user?.area || 'Pappampatti Pirivu'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Track your reported civic issues, monitor power cut duration, and view verified municipal updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/outages/new"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" /> Report Power Cut
            </Link>
            <Link
              href="/complaints/new"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" /> New Complaint
            </Link>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <EmergencyBanner compact />

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Reported</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{totalSubmitted}</p>
            <p className="text-[10px] text-slate-500 mt-1">All submitted issues</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Under Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{openCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting verification</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">In Progress</span>
              <AlertCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">{inProgressCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Work squad assigned</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{resolvedCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Completed & closed</p>
          </div>
        </div>

        {/* Active Power Outages in Area Section */}
        {outages.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-bold text-white text-sm">Active Electricity Outages in Your Locality ({outages.length})</h3>
              </div>
              <Link href="/outages" className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1">
                Outage Command Center <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outages.map((o) => (
                <div key={o.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{o.title}</span>
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-mono">
                      Off for {o.durationInfo.formattedDuration}
                    </span>
                  </div>
                  <div className="text-slate-400 space-y-1 text-[11px]">
                    <p><strong className="text-slate-300">Locality:</strong> {o.locality}</p>
                    <p><strong className="text-slate-300">Official Reason:</strong> {o.durationInfo.officialReasonDisplay}</p>
                    <p><strong className="text-slate-300">Restoration:</strong> {o.durationInfo.restorationTimeDisplay}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Complaints List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">My Reported Complaints</h2>
              <p className="text-xs text-slate-400">Track real-time status and officer updates for your tickets</p>
            </div>
            <Link
              href="/complaints/new"
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              Submit New Complaint <PlusCircle className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No complaints submitted yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have an issue with power cut, potholes, garbage, or streetlights? Report it now for prompt resolution.
              </p>
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Submit First Complaint
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition space-y-2 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-xs">{c.refNumber}</span>
                      <span className="text-xs text-slate-400 font-medium">({c.category.name})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={c.calculatedPriority || c.priority} isEmergency={c.isEmergency} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {c.locationName}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> SLA: {c.slaFormatted}
                    </span>
                    <Link
                      href={`/complaints/${c.id}`}
                      className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Track & View Updates <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
