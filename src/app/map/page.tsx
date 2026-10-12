'use client';

import React, { useEffect, useState } from 'react';
import { ComplaintsMap } from '@/components/map/ComplaintsMap';
import { MapPin, Filter, Search, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function PublicMapPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (category !== 'ALL') params.append('category', category);
      if (status !== 'ALL') params.append('status', status);
      if (priority !== 'ALL') params.append('priority', priority);
      if (search) params.append('search', search);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, priority, search]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400 animate-bounce" />
              <h1 className="text-2xl font-bold text-white">Public Civic Issue Map</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Explore live civic complaints and electricity outages across local zones. Private contact details are hidden for citizen safety.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="electricity">Electricity & Outages</option>
              <option value="roads">Roads & Potholes</option>
              <option value="garbage">Garbage & Sanitation</option>
              <option value="drainage">Drainage & Waterlogging</option>
              <option value="streetlights">Streetlights</option>
              <option value="water">Water Supply</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent / Safety Hazard</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Search Area / Keyword</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Pappampatti"
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Map Visualization */}
        {loading ? (
          <div className="w-full h-96 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
            Loading public issue map markers...
          </div>
        ) : (
          <ComplaintsMap complaints={complaints} />
        )}
      </div>
    </div>
  );
}
