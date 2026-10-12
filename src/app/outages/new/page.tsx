'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  Zap,
  Clock,
  CloudRain,
  ShieldAlert,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

export default function ElectricityComplaintForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('Pappampatti Pirivu');
  const [outageStartTime, setOutageStartTime] = useState(
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [weatherCondition, setWeatherCondition] = useState('Heavy Rainfall & Strong Winds');
  const [outageCategory, setOutageCategory] = useState('RAIN_STORM');
  const [affectedHouseholds, setAffectedHouseholds] = useState(45);
  const [isEmergencyHazard, setIsEmergencyHazard] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/outages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `Power Cut reported in ${locality}`,
          locality,
          startTime: outageStartTime,
          weatherCondition,
          outageCategory,
          affectedHouseholds,
          isEmergencyHazard,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit outage report');

      router.push('/outages');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link href="/outages" className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Outages Command Center
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white">Report Electricity Power Cut</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Report power interruptions for rapid verification by the Electricity Board line engineers.
          </p>
        </div>

        {/* Immediate Safety Banner */}
        <EmergencyBanner compact />

        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Outage Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Outage Title / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unannounced Power Shutdown After Heavy Rainfall"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Locality & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Locality / Area Name</label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Pappampatti Pirivu"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Power Outage Start Time</label>
              <input
                type="datetime-local"
                required
                value={outageStartTime}
                onChange={(e) => setOutageStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category Classification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Outage Circumstance / Category</label>
            <select
              value={outageCategory}
              onChange={(e) => setOutageCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="UNEXPECTED">1. Unexpected Power Outage</option>
              <option value="PLANNED">2. Scheduled / Planned Shutdown</option>
              <option value="RAIN_STORM">3. Rain or Storm Related Interruption</option>
              <option value="TRANSFORMER">4. Transformer or Equipment Problem</option>
              <option value="MAINTENANCE">5. Electrical Maintenance Work</option>
              <option value="DISTRIBUTION_FAULT">6. Local Distribution Grid Fault</option>
              <option value="UNKNOWN">7. Unknown Reason Awaiting Verification</option>
            </select>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weather Conditions Observed</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Heavy Rainfall & Strong Winds">Heavy Rainfall & Strong Winds</option>
              <option value="Thunderstorm & Lightning">Thunderstorm & Lightning</option>
              <option value="High Winds / Cyclone Gusts">High Winds / Cyclone Gusts</option>
              <option value="Clear Weather">Clear Weather</option>
            </select>
          </div>

          {/* Affected Households & Wire Hazard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Affected Households</label>
              <input
                type="number"
                min={1}
                value={affectedHouseholds}
                onChange={(e) => setAffectedHouseholds(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergencyHazard}
                  onChange={(e) => setIsEmergencyHazard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
              <div className="text-xs">
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Fallen Cable / Sparking Wire?
                </span>
                <span className="text-slate-500 text-[10px]">Triggers emergency linesman dispatch</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Description / Landmarks</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention street name, nearby substation or feeder landmark..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting Outage Report...' : 'Submit Outage Report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
