'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, AlertCircle, Zap, ShieldAlert } from 'lucide-react';

interface ComplaintItem {
  id: string;
  refNumber: string;
  title: string;
  category: { name: string; code: string };
  locationName: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  priority: string;
  isEmergency: boolean;
  createdAt: string;
}

interface ComplaintsMapProps {
  complaints: ComplaintItem[];
}

export const ComplaintsMap: React.FC<ComplaintsMapProps> = ({ complaints }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-5 h-5 text-cyan-400 animate-bounce" />
          Loading OpenStreetMap Interactive View...
        </div>
      </div>
    );
  }

  // Filter complaints that have coordinates
  const mappedComplaints = complaints.filter(c => c.latitude && c.longitude);
  const unmappedComplaints = complaints.filter(c => !c.latitude || !c.longitude);

  return (
    <div className="space-y-4">
      {/* Map Container View */}
      <div className="relative w-full h-[500px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          title="OpenStreetMap Civic View"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://www.openstreetmap.org/export/embed.html?bbox=76.90%2C11.00%2C77.05%2C11.08&amp;layer=mapnik"
          className="filter contrast-125 saturate-150 opacity-80"
        />

        {/* Overlay Overlay Marker Badges Card */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-300 shadow-xl max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-semibold text-white">
            <span>Map Summary</span>
            <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px]">
              {mappedComplaints.length} Local Markers
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {mappedComplaints.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">No mapped markers for current filters.</p>
            ) : (
              mappedComplaints.map(c => (
                <Link
                  key={c.id}
                  href={`/complaints/${c.id}`}
                  className="block p-2 rounded bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 font-mono text-[10px]">{c.refNumber}</span>
                    {c.isEmergency && (
                      <span className="bg-red-500/20 text-red-400 text-[9px] px-1 rounded flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> Hazard
                      </span>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium truncate group-hover:text-cyan-400 transition">{c.title}</p>
                  <p className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {c.locationName}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-300 shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span>Electricity Outage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Emergency Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Civic Issue</span>
          </div>
        </div>
      </div>

      {/* Unmapped Complaints List (Location-Based List Fallback as required in prompt) */}
      {unmappedComplaints.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Additional Complaints without Precise GPS Coordinates ({unmappedComplaints.length})
          </h4>
          <p className="text-slate-400 mb-3 text-[11px]">
            Displayed as a locality list in accordance with privacy guidelines (sensitive private address coordinates hidden).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {unmappedComplaints.map(c => (
              <Link
                key={c.id}
                href={`/complaints/${c.id}`}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition block"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono text-cyan-400 font-bold">{c.refNumber}</span>
                  <span className="uppercase text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{c.category.name}</span>
                </div>
                <p className="font-semibold text-white text-xs truncate">{c.title}</p>
                <p className="text-slate-400 text-[10px] mt-1">Area: {c.locationName}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
