'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  FileText,
  MapPin,
  Clock,
  Zap,
  Users,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Send,
  Star,
  ChevronLeft,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

export default function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [affectedCount, setAffectedCount] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchComplaint = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch(`/api/complaints/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load complaint');

      setComplaint(data.complaint);
      setAffectedCount(data.complaint.affectedCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleMarkAffected = async () => {
    try {
      const res = await fetch(`/api/complaints/${id}/affected`, { method: 'POST' });
      const data = await res.json();
      if (data.affectedCount) {
        setAffectedCount(data.affectedCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedbackComment }),
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        fetchComplaint();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading complaint tracking data...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Complaint Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'The requested ticket could not be retrieved.'}</p>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:underline">
            <ChevronLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const latestOfficialUpdate = complaint.updates?.find((u: any) => u.isOfficial);

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        {/* Emergency Hazard Banner */}
        {complaint.isEmergency && <EmergencyBanner />}

        {/* Main Header Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-extrabold text-cyan-400 tracking-wider">
                  {complaint.refNumber}
                </span>
                <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {complaint.category?.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{complaint.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.calculatedPriority} isEmergency={complaint.isEmergency} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Location: <strong className="text-slate-200">{complaint.locationName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Reported: <strong className="text-slate-200">{new Date(complaint.createdAt).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SLA Status: <strong className="text-slate-200">{complaint.slaFormatted}</strong></span>
            </div>
          </div>

          {/* Affected Persons Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-4 h-4 text-cyan-400" />
              <strong>{affectedCount || 1}</strong> Households / Citizens Affected by this issue
            </span>
            <button
              onClick={handleMarkAffected}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold transition"
            >
              ✋ I Am Also Affected
            </button>
          </div>
        </div>

        {/* THREE-PANEL TRANSPARENCY SYSTEM (Ground Report vs AI Suggestion vs Official Verified Response) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel 1: Citizen Ground Report */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              <Users className="w-4 h-4" /> Citizen Ground Report
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed">{complaint.description}</p>
              {complaint.address && (
                <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Address:</strong> {complaint.address}</p>
              )}
              {complaint.photoUrl && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-500 mb-1 font-mono">Submitted Photograph:</p>
                  <img src={complaint.photoUrl} alt="Complaint Evidence" className="w-full h-36 object-cover rounded-xl border border-slate-800" />
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: System Classification */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" /> System Classification
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-slate-400">Category Tag:</strong> {complaint.category?.name}</p>
              <p><strong className="text-slate-400">Assigned SLA:</strong> {complaint.category?.SLAHours} Hours</p>
              <p><strong className="text-slate-400">Emergency Flag:</strong> {complaint.isEmergency ? 'YES (Immediate Safety Priority)' : 'No'}</p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Rule-based categorization active. Scanned locality and text key terms.
              </div>
            </div>
          </div>

          {/* Panel 3: Verified Official Explanation */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-950/40 to-slate-900 border border-teal-500/30 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider border-b border-teal-900/50 pb-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Verified Official Explanation
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Confirmed Reason:</span>
                <p className="font-semibold text-white mt-0.5">
                  {latestOfficialUpdate?.officialRemark || complaint.outageInfo?.officialReasonDisplay || 'Official reason has not yet been provided.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Restoration:</span>
                <p className="font-semibold text-teal-300 mt-0.5">
                  {latestOfficialUpdate?.estimatedRestoration
                    ? new Date(latestOfficialUpdate.estimatedRestoration).toLocaleString()
                    : complaint.outageInfo?.restorationTimeDisplay || 'Restoration time is not yet available.'}
                </p>
              </div>

              {latestOfficialUpdate?.author && (
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Updated by: <strong className="text-teal-300">{latestOfficialUpdate.author.name}</strong> ({latestOfficialUpdate.authorRole})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Update History Timeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-white">Status & Investigation History</h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {complaint.updates?.map((u: any, idx: number) => (
              <div key={u.id} className="relative group">
                <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                  u.isOfficial ? 'bg-teal-400 border-teal-500' : 'bg-slate-700 border-slate-600'
                }`} />

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {u.author?.name} ({u.authorRole})
                      {u.isOfficial && <ShieldCheck className="w-3.5 h-3.5 text-teal-400 inline" />}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(u.createdAt).toLocaleString()}</span>
                  </div>

                  {u.statusChange && (
                    <div className="pt-1">
                      <StatusBadge status={u.statusChange} />
                    </div>
                  )}

                  {u.officialRemark && (
                    <p className="text-slate-300 mt-1 leading-relaxed">{u.officialRemark}</p>
                  )}

                  {u.evidenceUrl && (
                    <div className="pt-2">
                      <img src={u.evidenceUrl} alt="Resolution Evidence" className="w-48 h-32 object-cover rounded-lg border border-slate-800" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Feedback Form (When Resolved) */}
        {['RESOLVED', 'CLOSED'].includes(complaint.status) && user?.id === complaint.userId && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-lg text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Resolution Feedback
            </h3>
            <p className="text-xs text-slate-300">Rate the municipal team's response and resolution quality for this issue.</p>

            {feedbackSuccess ? (
              <p className="text-xs text-emerald-400 font-bold">Thank you! Your resolution feedback has been submitted.</p>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-300 ml-2">{rating} / 5 Stars</span>
                </div>

                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Optional feedback comment on response speed and service..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
