'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  Zap,
  Clock,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Users,
  Calendar,
  Building,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function ElectricityOutageDashboard() {
  const [outages, setOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchOutages = async () => {
    try {
      const res = await fetch('/api/outages');
      const data = await res.json();
      setOutages(data.outages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutages();
  }, []);

  const activeOutages = outages.filter(o => o.isCurrentlyOff);
  const plannedOutages = outages.filter(o => o.outageCategory === 'PLANNED');
  const unexpectedOutages = outages.filter(o => o.outageCategory !== 'PLANNED' && o.isCurrentlyOff);

  const filteredOutages = selectedCategory === 'ALL'
    ? outages
    : outages.filter(o => o.outageCategory === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white">Electricity Outage Command Center</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Real-time monitoring of power cut durations, storm interruptions, planned maintenance, and official restoration updates.
            </p>
          </div>

          <Link
            href="/outages/new"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4 fill-slate-950" /> Report Power Interruption
          </Link>
        </div>

        {/* Immediate Safety Emergency Banner */}
        <EmergencyBanner />

        {/* 1-Hour Outage Prompt Banner */}
        <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Has power been off in your locality for over 1 hour?</p>
              <p className="text-slate-400">
                If your power cut is not yet listed, report it now to trigger automated duplicate matching and notify the Electricity Board.
              </p>
            </div>
          </div>
          <Link
            href="/outages/new"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shrink-0"
          >
            Report 1-Hour Outage
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Active Power Cuts</span>
            <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{activeOutages.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Currently unpowered areas</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Planned Maintenance</span>
            <p className="text-3xl font-extrabold text-blue-400 font-mono mt-1">{plannedOutages.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Official scheduled shutdowns</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Unexpected Cuts</span>
            <p className="text-3xl font-extrabold text-rose-400 font-mono mt-1">{unexpectedOutages.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Citizen reported outages</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Total Households</span>
            <p className="text-3xl font-extrabold text-teal-400 font-mono mt-1">
              {outages.reduce((acc, o) => acc + (o.affectedHouseholds || 1), 0)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Affected across localities</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono mr-2">Filter Category:</span>
          {[
            { code: 'ALL', label: 'All Incidents' },
            { code: 'UNEXPECTED', label: 'Unexpected Outages' },
            { code: 'PLANNED', label: 'Planned Shutdowns' },
            { code: 'RAIN_STORM', label: 'Rain / Storm Related' },
            { code: 'TRANSFORMER', label: 'Transformer Faults' },
          ].map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedCategory === cat.code
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Outage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-xs text-slate-500 py-12 text-center md:col-span-2">Loading outage records...</p>
          ) : filteredOutages.length === 0 ? (
            <div className="py-12 text-center md:col-span-2 text-slate-500 text-sm">
              No outages found for selected filter category.
            </div>
          ) : (
            filteredOutages.map((o) => (
              <div
                key={o.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden"
              >
                {/* Outage Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.outageCategory === 'PLANNED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : o.outageCategory === 'RAIN_STORM'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {o.outageCategory.replace('_', ' ')}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <h3 className="font-bold text-white text-base mt-2">{o.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400" /> Locality: <strong className="text-slate-200">{o.locality}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Power Cut Duration</span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      {o.durationInfo?.formattedDuration}
                    </span>
                  </div>
                </div>

                {/* Weather Context & Affected Count */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Weather Context:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                      <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> {o.weatherCondition || 'Normal Weather'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Affected Households:</span>
                    <span className="font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> {o.affectedHouseholds} Homes
                    </span>
                  </div>
                </div>

                {/* VERIFIED OFFICIAL RESPONSE PANEL (Strictly distinguishes official reason vs ground report) */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-950/30 to-slate-950 border border-teal-500/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Official Electricity Board Reason
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {o.durationInfo?.officialReasonDisplay}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Expected Restoration:</span>
                    <strong className="text-teal-300">{o.durationInfo?.restorationTimeDisplay}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500 text-[10px]">
                    Reported at: {new Date(o.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {o.complaints?.[0] && (
                    <Link
                      href={`/complaints/${o.complaints[0].id}`}
                      className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      View Live Tracking <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
