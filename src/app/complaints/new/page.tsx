'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  PlusCircle,
  Zap,
  Construction,
  Trash2,
  Droplets,
  Lightbulb,
  Building2,
  AlertCircle,
  Upload,
  MapPin,
  ShieldAlert,
  Users,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function NewComplaintPage() {
  const router = useRouter();
  const [categoryCode, setCategoryCode] = useState('electricity');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Pappampatti Pirivu');
  const [address, setAddress] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [affectedCount, setAffectedCount] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryCode,
          locationName,
          address,
          isEmergency,
          affectedCount,
          photoUrl,
          isOutage: categoryCode === 'electricity',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit complaint');

      if (data.duplicateWarning) {
        setDuplicateWarning(data.duplicateWarning);
      } else {
        router.push(`/complaints/${data.complaint.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Submit New Civic Complaint</h1>
          <p className="text-slate-400 text-xs mt-1">
            Provide accurate details to ensure rapid routing to the responsible municipal department.
          </p>
        </div>

        {/* Emergency Warning */}
        {isEmergency && <EmergencyBanner compact />}

        {/* Duplicate Warning Dialog */}
        {duplicateWarning && (
          <div className="p-5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Possible Existing Incident Detected in {locationName}!
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              We found an existing active report (<strong>{duplicateWarning.existingRefNumber}</strong> - "{duplicateWarning.title}") with a {duplicateWarning.matchScore}% similarity match.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/complaints/${duplicateWarning.existingComplaintId}`}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                View Existing Ticket & Mark Affected
              </Link>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs border border-slate-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Category Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Select Complaint Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { code: 'electricity', label: 'Electricity', icon: Zap, color: 'text-amber-400 border-amber-500/30' },
                { code: 'roads', label: 'Roads/Potholes', icon: Construction, color: 'text-cyan-400 border-cyan-500/30' },
                { code: 'garbage', label: 'Garbage', icon: Trash2, color: 'text-emerald-400 border-emerald-500/30' },
                { code: 'drainage', label: 'Drainage', icon: Droplets, color: 'text-blue-400 border-blue-500/30' },
                { code: 'streetlights', label: 'Streetlights', icon: Lightbulb, color: 'text-yellow-400 border-yellow-500/30' },
                { code: 'water', label: 'Water Supply', icon: Droplets, color: 'text-teal-400 border-teal-500/30' },
                { code: 'infrastructure', label: 'Public Infra', icon: Building2, color: 'text-purple-400 border-purple-500/30' },
                { code: 'other', label: 'Other Issue', icon: AlertCircle, color: 'text-slate-400 border-slate-500/30' },
              ].map(cat => {
                const Icon = cat.icon;
                const selected = categoryCode === cat.code;
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setCategoryCode(cat.code)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                      selected
                        ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                    <span className="text-xs font-semibold text-white truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Complaint Title / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2-hour power cut on 3rd Main Road or Deep pothole near junction"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, start time, landmarks, and observed conditions..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Location & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Area / Locality</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Pappampatti Pirivu"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specific Address / Landmark (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House #42, 3rd Cross Street"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Affected Count & Emergency Hazard Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Affected Households / People (Estimate)</label>
              <input
                type="number"
                min={1}
                value={affectedCount}
                onChange={(e) => setAffectedCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
              <div className="text-xs">
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Immediate Safety Hazard?
                </span>
                <span className="text-slate-500 text-[10px]">Loose wires, sparking, severe flooding</span>
              </div>
            </div>
          </div>

          {/* Photo Upload Box */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">Upload Evidence Photo (Optional, Max 5MB)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-white cursor-pointer transition text-xs">
                <Upload className="w-4 h-4 text-cyan-400" /> Choose Photograph
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoUrl && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Photo Attached
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? 'Registering Complaint...' : 'Submit Complaint to Department'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
