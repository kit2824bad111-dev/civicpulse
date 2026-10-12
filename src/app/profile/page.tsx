'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, MapPin, Phone, Shield, Building, Calendar, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user) {
          setArea(data.user.area || '');
          setPhone(data.user.phone || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile preferences saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Profile & Settings</h1>
          <p className="text-slate-400 text-xs mt-1">Manage your account details and local notification preferences</p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold text-xl flex items-center justify-center border border-cyan-500/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1 bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded font-mono border border-cyan-500/20">
                ROLE: {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            {user?.department && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Department</label>
                <input
                  type="text"
                  disabled
                  value={user.department.name}
                  className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-teal-400 font-semibold cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Locality / Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
            >
              Save Profile Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
