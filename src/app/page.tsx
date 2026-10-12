import Link from 'next/link';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import {
  Zap,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Building2,
  Users,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Next-Generation Civic Transparency Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Report Civic Issues. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Track Verified Official Progress.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Empowering citizens to report electricity outages, damaged roads, water supply cuts, and municipal issues with real-time status tracking and direct municipal accountability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/outages"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                Report Power Cut / Outage
              </Link>

              <Link
                href="/complaints/new"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5" />
                Report General Civic Issue
              </Link>

              <Link
                href="/map"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <MapPin className="w-5 h-5 text-cyan-400" />
                Explore Public Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Safety Alert Banner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <EmergencyBanner />
      </div>

      {/* Live Metrics Counter Bar */}
      <section className="py-10 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-3xl font-extrabold text-cyan-400 font-mono">1,248+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Civic Issues Resolved</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-3xl font-extrabold text-amber-400 font-mono">18.4 hrs</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Avg Outage Restoration</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-3xl font-extrabold text-teal-400 font-mono">94.2%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">SLA Resolution Rate</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-3xl font-extrabold text-purple-400 font-mono">5 Depts</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Connected Officers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Civic Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Select a Complaint Category</h2>
          <p className="text-slate-400 text-sm mt-2">
            Instant routing to the designated municipal department with guaranteed SLA response deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/20 hover:border-amber-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition">Electricity & Power Cuts</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Report power cuts lasting over 1 hour, transformer breakdowns, voltage fluctuations, or storm interruptions.
            </p>
            <Link href="/outages" className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold mt-4 hover:underline">
              Check Outages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition">Roads & Deep Potholes</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Report asphalt craters, dangerous road cracks, unpaved surfaces, and traffic safety hazards.
            </p>
            <Link href="/complaints/new" className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold mt-4 hover:underline">
              Report Pothole <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition">Garbage & Sanitation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Report uncollected trash, overflowing public dumpsters, illegal waste dumps, and biohazards.
            </p>
            <Link href="/complaints/new" className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-4 hover:underline">
              Clean Waste <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition">Water Supply & Drains</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Report clogged storm drains, rainwater street flooding, pipeline leaks, dirty water contamination.
            </p>
            <Link href="/complaints/new" className="inline-flex items-center gap-1 text-xs text-blue-400 font-semibold mt-4 hover:underline">
              Fix Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Public Service Transparency Pledge */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Citizen-Reported Context</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Citizens submit observed symptoms (e.g., "Power snapped during heavy rain"). Preserves citizen ground perspective.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Smart Duplicate Detection</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Prevents clutter by matching reports in the same area & time window, allowing affected neighbors to join single tickets.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Verified Official Explanations</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Official reasons and estimated restoration times are supplied exclusively by authorized officers after inspection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
