import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Zap, Calendar, CalendarDays, TrendingUp, Activity, ChevronDown, Radio } from 'lucide-react';
import type { DashboardData, Apartment } from '../types';
import { StatCard } from '../components/StatCard';
import { apartmentsApi } from '../api/apartments';
import { dashboardApi } from '../api/dashboard';

const REFRESH_MS = 15_000;

export function DashboardPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveWatts, setLiveWatts] = useState<number>(0);
  const [liveActiveCount, setLiveActiveCount] = useState<number>(0);

  useEffect(() => {
    apartmentsApi
      .list()
      .then((apts) => {
        setApartments(apts);
        if (apts.length > 0) setSelectedId(apts[0].id);
        else setLoading(false);
      })
      .catch(() => {
        setError('Unable to load data. Please try again.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;

    let cancelled = false;

    async function fetchDashboard() {
      try {
        const d = await dashboardApi.getForApartment(selectedId!);
        if (!cancelled) {
          setData(d);
          setLoading(false);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Unable to load data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;

    async function fetchLive() {
      try {
        const live = await dashboardApi.getLive(selectedId!);
        if (!cancelled) {
          setLiveWatts(live.totalWatts);
          setLiveActiveCount(live.activeCount);
        }
      } catch {
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  if (error && !data) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-5 text-sm flex items-center gap-3">
        <Activity size={18} className="shrink-0" />
        {error}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const roomChartData = data.rooms.map((r) => ({
    name: r.name,
    kwh: Number(r.weekKwh.toFixed(2)),
  }));

  const totalDevices = data.rooms.flatMap((r) => r.devices).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Apartment <span className="font-medium text-slate-700">{data.apartment.number}</span>
            &nbsp;&middot;&nbsp;{data.apartment.area} m²
          </p>
        </div>
        {apartments.length > 1 && (
          <div className="relative">
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="appearance-none rounded-lg border border-slate-300 pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  Apartment {a.number}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className={`rounded-xl border p-4 flex flex-wrap items-center gap-4 transition-all ${
        liveWatts > 0
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Radio
            size={18}
            className={liveWatts > 0 ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}
          />
          <span className={`text-sm font-semibold ${liveWatts > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
            {liveWatts > 0 ? 'Live — consuming now' : 'Standby — no active devices'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 ml-auto">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-0.5">Current draw</p>
            <p className={`text-2xl font-bold tabular-nums ${liveWatts > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
              {liveWatts.toLocaleString()} <span className="text-sm font-normal">W</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-0.5">Active devices</p>
            <p className={`text-2xl font-bold tabular-nums ${liveWatts > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
              {liveActiveCount}
              <span className="text-sm font-normal text-slate-400"> / {totalDevices}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today"
          value={data.totals.day.toFixed(3)}
          unit="kWh"
          hint="from 00:00 today"
          icon={Zap}
          color="orange"
        />
        <StatCard
          label="This week"
          value={data.totals.week.toFixed(3)}
          unit="kWh"
          hint="since Monday"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="This month"
          value={data.totals.month.toFixed(3)}
          unit="kWh"
          hint="month to date"
          icon={CalendarDays}
          color="purple"
        />
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-brand-600" />
          <h3 className="text-base font-semibold text-slate-900">Daily consumption — last 7 days</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} unit=" kWh" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(v: number) => [`${v.toFixed(3)} kWh`, 'Consumption']}
              />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke="#dc6803"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#dc6803', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-brand-600" />
          <h3 className="text-base font-semibold text-slate-900">Weekly consumption per room</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} unit=" kWh" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(v: number) => [`${v.toFixed(3)} kWh`, 'This week']}
              />
              <Legend />
              <Bar dataKey="kwh" name="kWh (week)" fill="#fdb022" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Zap size={18} className="text-brand-600" />
          <h3 className="text-base font-semibold text-slate-900">Per-device — this week</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Device</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">kWh (week)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rooms.flatMap((room) =>
                room.devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-6 font-medium text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 text-slate-500">{room.name}</td>
                    <td className="py-3 px-4 text-slate-500">{d.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        d.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {d.status ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-900 font-mono text-right">
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
