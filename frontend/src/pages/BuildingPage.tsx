import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Building2, Zap, CalendarDays, Home, BellOff, SlidersHorizontal, MapPin } from 'lucide-react';
import { buildingsApi } from '../api/buildings';
import type { BuildingOverview } from '../api/buildings';
import { useTheme } from '../contexts/ThemeContext';

function modeLabel(mode: string) {
  if (mode === 'HOME') return { label: 'Home', Icon: Home, cls: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' };
  if (mode === 'AWAY') return { label: 'Away', Icon: BellOff, cls: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' };
  return { label: 'Normal', Icon: SlidersHorizontal, cls: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40' };
}

export function BuildingPage() {
  const { isDark } = useTheme();
  const [overview, setOverview] = useState<BuildingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartStyle = {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    axis: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)',
    tooltip: isDark
      ? { background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#fff' }
      : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, fontSize: 12, color: '#0f172a' },
  };

  useEffect(() => {
    async function load() {
      try {
        const buildings = await buildingsApi.list();
        if (buildings.length === 0) {
          setLoading(false);
          return;
        }
        const data = await buildingsApi.getOverview(buildings[0].id);
        setOverview(data);
      } catch {
        setError('Unable to load building data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => <div key={i} className="h-24 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-white/30">
        <Building2 size={36} className="mx-auto mb-3 opacity-40" />
        <p>No building data available.</p>
      </div>
    );
  }

  const chartData = overview.apartments.map((a) => ({
    name: `Apt ${a.number}`,
    Today: Number(a.todayKwh.toFixed(3)),
    'This month': Number(a.monthKwh.toFixed(3)),
  }));

  const topConsumer = [...overview.apartments].sort((a, b) => b.todayKwh - a.todayKwh)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Building Overview</h2>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5 flex items-center gap-1.5">
            <MapPin size={13} />
            {overview.building.name} &middot; {overview.building.location}
          </p>
        </div>
        <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Apartments</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">{overview.apartments.length}</p>
        </div>
      </div>

      {/* Building-level totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-400/8 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Building today</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {overview.totalTodayKwh.toFixed(3)}{' '}
              <span className="text-sm font-normal text-slate-400 dark:text-white/35">kWh</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-400/8 flex items-center justify-center shrink-0">
            <CalendarDays size={18} className="text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Building this month</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {overview.totalMonthKwh.toFixed(3)}{' '}
              <span className="text-sm font-normal text-slate-400 dark:text-white/35">kWh</span>
            </p>
          </div>
        </div>

        {topConsumer && (
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-400/8 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Top consumer today</p>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Apt {topConsumer.number}
              </p>
              <p className="text-xs text-slate-400 dark:text-white/30">{topConsumer.todayKwh.toFixed(3)} kWh</p>
            </div>
          </div>
        )}
      </div>

      {/* Apartment energy comparison chart */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={17} className="text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Energy per apartment</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
              <XAxis dataKey="name" stroke={chartStyle.axis} fontSize={11} tickLine={false} />
              <YAxis stroke={chartStyle.axis} fontSize={11} unit=" kWh" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartStyle.tooltip} formatter={(v: number) => [`${v.toFixed(3)} kWh`]} />
              <Legend wrapperStyle={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }} />
              <Bar dataKey="Today" fill="#facc15" radius={[5, 5, 0, 0]} />
              <Bar dataKey="This month" fill="#818cf8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Apartments table */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
          <Building2 size={17} className="text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">All apartments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02]">
                <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Apartment</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Area</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Mode</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Today (kWh)</th>
                <th className="py-3 px-6 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Month (kWh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {overview.apartments.map((apt) => {
                const { label, Icon, cls } = modeLabel(apt.activeMode);
                return (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">
                      Apt {apt.number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 dark:text-white/45">{apt.area} m²</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
                        <Icon size={11} />
                        {label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 dark:text-white/70">
                      {apt.todayKwh.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-xs text-slate-600 dark:text-white/70">
                      {apt.monthKwh.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
