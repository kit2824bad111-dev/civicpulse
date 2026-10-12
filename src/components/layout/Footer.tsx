import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, PhoneCall, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">Civic<span className="text-cyan-400">Pulse</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              An intelligent civic complaint management & public service transparency platform bridging citizens and local municipal authorities.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Official Updates
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-400">Emergency Hotlines</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <a href="tel:1912" className="hover:text-amber-400 flex items-center gap-1.5 transition">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Electricity Outage Helpline: <strong>1912</strong>
                </a>
              </li>
              <li>
                <a href="tel:101" className="hover:text-amber-400 flex items-center gap-1.5 transition">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Fire & Electrical Emergency: <strong>101</strong>
                </a>
              </li>
              <li>
                <a href="tel:100" className="hover:text-amber-400 flex items-center gap-1.5 transition">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Police Control Room: <strong>100</strong>
                </a>
              </li>
              <li>
                <a href="tel:1916" className="hover:text-amber-400 flex items-center gap-1.5 transition">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Municipal Water Helpline: <strong>1916</strong>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-cyan-400">Platform Modules</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <Link href="/outages" className="hover:text-cyan-400 transition">Electricity Outages Command Center</Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-cyan-400 transition">Interactive Public Issue Map</Link>
              </li>
              <li>
                <Link href="/complaints/new" className="hover:text-cyan-400 transition">Report Civic Problem</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition">Citizen Progress Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* System Transparency Notice */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-blue-400">Data Transparency</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              CivicPulse explicitly distinguishes between citizen-reported circumstances, automated system duplicate detection, and verified official responses.
            </p>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[11px] text-slate-300">
              Official reasons are populated exclusively by authorized municipal department officers.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 CivicPulse Transparency Network. Built for public empowerment.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Smart Cities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
