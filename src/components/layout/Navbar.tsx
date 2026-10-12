'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Zap,
  MapPin,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  area?: string;
}

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const handleDemoLogin = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' }),
      });
      if (res.ok) {
        await fetchUser();
        const data = await res.json();
        if (data.user.role === 'ADMIN') router.push('/admin');
        else if (data.user.role === 'OFFICER') router.push('/officer');
        else router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Civic<span className="text-cyan-400">Pulse</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded">GovTech</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Public Transparency Platform</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/outages"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                isActive('/outages') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Electricity Outages
            </Link>

            <Link
              href="/map"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                isActive('/map') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              Public Issue Map
            </Link>

            {user?.role === 'CITIZEN' && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/dashboard') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
                <Link
                  href="/complaints/new"
                  className="ml-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Issue
                </Link>
              </>
            )}

            {user?.role === 'OFFICER' && (
              <Link
                href="/officer"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  isActive('/officer') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-teal-400" />
                Officer Dashboard
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  isActive('/admin') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* Quick Demo Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Login Pill Bar */}
            {!user && (
              <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
                <span className="text-slate-400 px-2 font-mono text-[10px]">Demo Login:</span>
                <button
                  onClick={() => handleDemoLogin('citizen@civicpulse.org')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-cyan-400 font-medium transition"
                >
                  Citizen
                </button>
                <button
                  onClick={() => handleDemoLogin('officer@civicpulse.org')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-teal-400 font-medium transition"
                >
                  Officer
                </button>
                <button
                  onClick={() => handleDemoLogin('admin@civicpulse.org')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-purple-400 font-medium transition"
                >
                  Admin
                </button>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2 relative">
                {/* Notifications Bell */}
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-12 top-12 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <h4 className="font-semibold text-sm text-white">Notifications</h4>
                      <span className="text-xs text-slate-400">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-lg text-xs border ${
                              n.isRead ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-cyan-950/20 border-cyan-800/40 text-slate-200 font-medium'
                            }`}
                          >
                            <p className="font-semibold text-cyan-300">{n.title}</p>
                            <p className="mt-0.5 text-slate-300">{n.message}</p>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-1.5 transition text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs border border-cyan-500/30">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="font-semibold text-white leading-tight">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-cyan-400 uppercase font-mono">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-xs text-slate-300">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-slate-200 transition"
                      >
                        <User className="w-4 h-4 text-cyan-400" /> My Profile & Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-rose-400 transition text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 text-sm">
          <Link
            href="/outages"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-amber-400 bg-amber-950/20 border border-amber-900/30"
          >
            <Zap className="w-4 h-4" /> Electricity Outages
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-cyan-400 bg-cyan-950/20 border border-cyan-900/30"
          >
            <MapPin className="w-4 h-4" /> Public Issue Map
          </Link>

          {user?.role === 'CITIZEN' && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-slate-200 bg-slate-900"
              >
                <LayoutDashboard className="w-4 h-4" /> My Dashboard
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-cyan-500 text-slate-950 font-bold"
              >
                <PlusCircle className="w-4 h-4" /> Submit Complaint
              </Link>
            </>
          )}

          {user?.role === 'OFFICER' && (
            <Link
              href="/officer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-teal-400 bg-teal-950/20"
            >
              <Shield className="w-4 h-4" /> Officer Dashboard
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-purple-400 bg-purple-950/20"
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          )}

          {!user && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-500 font-mono">Quick Demo Sign-in:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => { handleDemoLogin('citizen@civicpulse.org'); setMobileMenuOpen(false); }}
                  className="py-1.5 bg-slate-900 border border-slate-800 text-cyan-400 rounded font-semibold text-center"
                >
                  Citizen
                </button>
                <button
                  onClick={() => { handleDemoLogin('officer@civicpulse.org'); setMobileMenuOpen(false); }}
                  className="py-1.5 bg-slate-900 border border-slate-800 text-teal-400 rounded font-semibold text-center"
                >
                  Officer
                </button>
                <button
                  onClick={() => { handleDemoLogin('admin@civicpulse.org'); setMobileMenuOpen(false); }}
                  className="py-1.5 bg-slate-900 border border-slate-800 text-purple-400 rounded font-semibold text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
