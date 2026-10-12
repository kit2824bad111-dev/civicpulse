import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, ExternalLink } from 'lucide-react';

interface EmergencyBannerProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  title = 'IMMEDIATE SAFETY HAZARD WARNING',
  message = 'For fallen electrical lines, sparking transformers, or electrical hazards during flooding: STAY BACK at least 10 meters and contact Emergency Electricity Services immediately. Do not attempt to move loose wires.',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="bg-red-950/80 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
          <span>Electrical Danger? Call Emergency Helpline: <strong className="text-white">1912 / 101</strong></span>
        </div>
        <a
          href="tel:1912"
          className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded text-xs transition flex items-center gap-1 shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call 1912
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-amber-950/90 border-2 border-red-500/60 rounded-xl p-5 shadow-xl text-red-100 mb-6 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <ShieldAlert className="w-48 h-48 text-red-400" />
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
        <div className="p-3 bg-red-600/30 rounded-xl border border-red-500/40 text-red-400 shrink-0">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-red-200 tracking-wide">{title}</h3>
            <span className="bg-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded font-mono border border-red-500/40">
              URGENT SAFETY ALERTS
            </span>
          </div>

          <p className="text-sm text-red-200/90 leading-relaxed">
            {message}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <a
              href="tel:1912"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-red-900/50"
            >
              <PhoneCall className="w-4 h-4" /> Call 24/7 Electricity Helpline (1912)
            </a>
            <a
              href="tel:101"
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              Fire & Rescue (101)
            </a>
            <span className="text-red-300/70 italic">Do not wait for normal online ticket processing for active hazards!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
