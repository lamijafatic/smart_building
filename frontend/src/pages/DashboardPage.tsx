import { useEffect, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import {
  Zap, Calendar, CalendarDays, TrendingUp, Activity, ChevronDown,
  Home, BellOff, SlidersHorizontal, Bell, X,
} from 'lucide-react';
import type { DashboardData, Apartment } from '../types';
import { StatCard } from '../components/StatCard';
import { apartmentsApi } from '../api/apartments';
import { dashboardApi } from '../api/dashboard';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../api/notifications';
import { useTheme } from '../contexts/ThemeContext';

const REFRESH_MS = 15_000;
type Mode = 'HOME' | 'AWAY' | 'NONE';

const MODES: { key: Mode; label: string; Icon: React.ElementType }[] = [
  { key: 'HOME', label: 'Home', Icon: Home },
  { key: 'AWAY', label: 'Away', Icon: BellOff },
  { key: 'NONE', label: 'Normal', Icon: SlidersHorizontal },
];

export function DashboardPage() {
  const { isDark } = useTheme();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveWatts, setLiveWatts] = useState<number>(0);
  const [liveActiveCount, setLiveActiveCount] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<Mode>('NONE');
  const [modeLoading, setModeLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const chartStyle = {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    axis: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)',
    tooltip: isDark
      ? { background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#fff' }
      : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, fontSize: 12, color: '#0f172a' },
  };

  useEffect(() => {
    apartmentsApi
      .list()
      .then((apts) => {
        setApartments(apts);
        if (apts.length > 0) {
          setSelectedId(apts[0].id);
          setActiveMode((apts[0].activeMode as Mode) ?? 'NONE');
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Unable to load data. Please try again.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    const apt = apartments.find((a) => a.id === selectedId);
    if (apt) setActiveMode((apt.activeMode as Mode) ?? 'NONE');
  }, [selectedId, apartments]);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const d = await dashboardApi.getForApartment(selectedId!);
        if (!cancelled) { setData(d); setLoading(false); setError(null); }
      } catch {
        if (!cancelled) setError('Unable to load data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;

    async function fetchLive() {
      try {
        const live = await dashboardApi.getLive(selectedId!);
        if (!cancelled) { setLiveWatts(live.totalWatts); setLiveActiveCount(live.activeCount); }
      } catch { }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 5_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const result = await notificationsApi.list(selectedId!);
        if (!cancelled) {
          setNotifications(result.notifications);
          setUnreadCount(result.unreadCount);
        }
      } catch { }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSetMode(mode: Mode) {
    if (selectedId == null || modeLoading) return;
    setModeLoading(true);
    try {
      await apartmentsApi.setMode(selectedId, mode);
      setActiveMode(mode);
      setApartments((prev) =>
        prev.map((a) => (a.id === selectedId ? { ...a, activeMode: mode } : a)),
      );
    } catch {
      setError('Failed to change mode.');
    } finally {
      setModeLoading(false);
    }
  }

  async function handleMarkRead(notifId: number) {
    try {
      await notificationsApi.markRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { }
  }

  async function handleMarkAllRead() {
    if (selectedId == null) return;
    try {
      await notificationsApi.markAllRead(selectedId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { }
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm flex items-center gap-3">
        <Activity size={18} className="shrink-0" />
        {error}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => <div key={i} className="h-28 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  const roomChartData = data.rooms.map((r) => ({
    name: r.name,
    kwh: Number(r.weekKwh.toFixed(2)),
  }));

  const totalDevices = data.rooms.flatMap((r) => r.devices).length;
  const isConsuming = liveWatts > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">
            Apartment <span className="font-semibold text-slate-600 dark:text-white/70">{data.apartment.number}</span>
            &nbsp;&middot;&nbsp;{data.apartment.area} m²
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-80 bg-white dark:bg-[#0d0d1a] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-white/30 text-center py-8">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.read && handleMarkRead(n.id)}
                        className={`px-4 py-3 transition ${!n.read ? 'bg-yellow-50/60 dark:bg-yellow-400/5 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-400/8' : 'cursor-default'}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                          )}
                          <div>
                            <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 dark:text-white/90 font-semibold' : 'text-slate-500 dark:text-white/50'}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-300 dark:text-white/20 mt-1">
                              {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Apartment selector */}
          {apartments.length > 1 && (
            <div className="relative">
              <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="appearance-none rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/50 transition"
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>Apartment {a.number}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Mode control */}
      <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-none">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-3">Apartment Mode</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map(({ key, label, Icon }) => {
            const isActive = activeMode === key;
            const activeClass =
              key === 'HOME'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : key === 'AWAY'
                  ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/20';
            return (
              <button
                key={key}
                onClick={() => handleSetMode(key)}
                disabled={modeLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  isActive
                    ? activeClass
                    : 'bg-transparent text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
          {activeMode !== 'NONE' && (
            <span className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold ${
              activeMode === 'HOME'
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
            }`}>
              {activeMode === 'HOME' ? 'Lights & thermostats on, others off' : 'All devices turned off'}
            </span>
          )}
        </div>
      </div>

      {/* Live Power Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-white dark:bg-white/[0.03] border rounded-2xl p-5 shadow-sm dark:shadow-none transition-all ${
          isConsuming
            ? 'border-yellow-300 dark:border-yellow-400/20'
            : 'border-slate-200 dark:border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Current Draw</span>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isConsuming
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConsuming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-white/20'}`} />
              {isConsuming ? 'Live' : 'Idle'}
            </span>
          </div>
          <p className={`text-3xl font-black tabular-nums leading-none ${isConsuming ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>
            {liveWatts.toLocaleString()}
            <span className="text-base font-normal text-slate-400 dark:text-white/30 ml-1.5">W</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-white/25 mt-2">
            {isConsuming ? `${(liveWatts / 1000).toFixed(2)} kW active` : 'No devices consuming'}
          </p>
        </div>

        <div className={`bg-white dark:bg-white/[0.03] border rounded-2xl p-5 shadow-sm dark:shadow-none transition-all ${
          isConsuming
            ? 'border-yellow-300 dark:border-yellow-400/20'
            : 'border-slate-200 dark:border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Active Devices</span>
            <Zap size={14} className={isConsuming ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-300 dark:text-white/20'} />
          </div>
          <p className={`text-3xl font-black tabular-nums leading-none ${isConsuming ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>
            {liveActiveCount}
            <span className="text-base font-normal text-slate-400 dark:text-white/30 ml-1.5">/ {totalDevices}</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-700"
              style={{ width: totalDevices > 0 ? `${(liveActiveCount / totalDevices) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Today" value={data.totals.day.toFixed(3)} unit="kWh" hint="from 00:00 today" icon={Zap} color="yellow" />
        <StatCard label="This week" value={data.totals.week.toFixed(3)} unit="kWh" hint="since Monday" icon={Calendar} color="blue" />
        <StatCard label="This month" value={data.totals.month.toFixed(3)} unit="kWh" hint="month to date" icon={CalendarDays} color="purple" />
      </div>

      {/* Daily chart */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={17} className="text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily consumption — last 7 days</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
              <XAxis dataKey="date" stroke={chartStyle.axis} fontSize={11} tickLine={false} />
              <YAxis stroke={chartStyle.axis} fontSize={11} unit=" kWh" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartStyle.tooltip} formatter={(v: number) => [`${v.toFixed(3)} kWh`, 'Consumption']} />
              <Line type="monotone" dataKey="kwh" stroke="#facc15" strokeWidth={2.5} dot={{ r: 4, fill: '#facc15', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Room bar chart */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={17} className="text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly consumption per room</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
              <XAxis dataKey="name" stroke={chartStyle.axis} fontSize={11} tickLine={false} />
              <YAxis stroke={chartStyle.axis} fontSize={11} unit=" kWh" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartStyle.tooltip} formatter={(v: number) => [`${v.toFixed(3)} kWh`, 'This week']} />
              <Legend wrapperStyle={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }} />
              <Bar dataKey="kwh" name="kWh (week)" fill="#facc15" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per-device table */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
          <Zap size={17} className="text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Per-device — this week</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02]">
                <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Device</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Room</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Type</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Status</th>
                <th className="py-3 px-6 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">kWh (week)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {data.rooms.flatMap((room) =>
                room.devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">{d.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 dark:text-white/45">{room.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 dark:text-white/45">{d.type.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        d.status
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/30 border border-slate-200 dark:border-white/[0.06]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-white/20'}`} />
                        {d.status ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-white/70 font-mono text-right text-xs">
                      {d.weekKwh.toFixed(4)}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
