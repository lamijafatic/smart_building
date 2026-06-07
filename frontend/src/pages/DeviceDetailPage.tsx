import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, Lightbulb, Wind, Tv, Refrigerator,
  WashingMachine, Waves, Thermometer, Plug, Zap, Clock, BarChart3,
  CalendarDays, Plus, Trash2, Pencil, Check, X,
} from 'lucide-react';
import { devicesApi } from '../api/devices';
import { schedulesApi } from '../api/schedules';
import type { Schedule } from '../api/schedules';
import { useTheme } from '../contexts/ThemeContext';
import type { Device, EnergyDataPoint } from '../types';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function deviceIcon(type: string, size = 24) {
  const icons: Record<string, React.ReactNode> = {
    LIGHT: <Lightbulb size={size} />,
    AC: <Wind size={size} />,
    TV: <Tv size={size} />,
    FRIDGE: <Refrigerator size={size} />,
    WASHING_MACHINE: <WashingMachine size={size} />,
    DISHWASHER: <Waves size={size} />,
    HEATER: <Thermometer size={size} />,
    BOILER: <Thermometer size={size} />,
  };
  return icons[type] ?? <Plug size={size} />;
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? 'Turn off' : 'Turn on'}
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none ${
        on ? 'bg-yellow-400 shadow-lg shadow-yellow-400/25' : 'bg-slate-200 dark:bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          on ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface ScheduleFormData {
  days: string[];
  startTime: string;
  endTime: string;
}

function ScheduleForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: ScheduleFormData;
  onSave: (data: ScheduleFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [days, setDays] = useState<string[]>(initial?.days ?? ['MON', 'WED', 'FRI']);
  const [startTime, setStartTime] = useState(initial?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '22:00');

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">Days</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                days.includes(d)
                  ? 'bg-yellow-400 text-[#080810]'
                  : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-300 dark:hover:bg-white/[0.12]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-1.5">
            Start
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/50 transition"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 block mb-1.5">
            End
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/50 transition"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ days, startTime, endTime })}
          disabled={saving || days.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-[#080810] text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/[0.1] transition"
        >
          <X size={13} />
          Cancel
        </button>
      </div>
    </div>
  );
}

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isDark } = useTheme();
  const [device, setDevice] = useState<Device | null>(null);
  const [history, setHistory] = useState<EnergyDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const chartStyle = {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    axis: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)',
    tooltip: isDark
      ? { background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#fff' }
      : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, fontSize: 12, color: '#0f172a' },
  };

  async function load() {
    if (!id) return;
    setError(null);
    try {
      const [d, h, s] = await Promise.all([
        devicesApi.get(Number(id)),
        devicesApi.history(Number(id), 7),
        schedulesApi.listForDevice(Number(id)),
      ]);
      setDevice(d);
      setHistory(h);
      setSchedules(s);
    } catch {
      setError('Unable to load device data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [id]);

  async function toggle() {
    if (!device) return;
    try {
      const updated = await devicesApi.setStatus(device.id, !device.status);
      setDevice({ ...device, status: updated.status });
    } catch {
      setError('Failed to update device.');
    }
  }

  async function handleCreateSchedule(data: ScheduleFormData) {
    if (!id) return;
    setSavingSchedule(true);
    try {
      const created = await schedulesApi.create({ deviceId: Number(id), ...data });
      setSchedules((prev) => [...prev, created]);
      setShowCreateForm(false);
    } catch {
      setError('Failed to create schedule.');
    } finally {
      setSavingSchedule(false);
    }
  }

  async function handleUpdateSchedule(scheduleId: number, data: ScheduleFormData) {
    setSavingSchedule(true);
    try {
      const updated = await schedulesApi.update(scheduleId, data);
      setSchedules((prev) => prev.map((s) => (s.id === scheduleId ? updated : s)));
      setEditId(null);
    } catch {
      setError('Failed to update schedule.');
    } finally {
      setSavingSchedule(false);
    }
  }

  async function handleDeleteSchedule(scheduleId: number) {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await schedulesApi.remove(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch {
      setError('Failed to delete schedule.');
    }
  }

  async function handleToggleActive(s: Schedule) {
    try {
      const updated = await schedulesApi.update(s.id, { active: !s.active });
      setSchedules((prev) => prev.map((sc) => (sc.id === s.id ? updated : sc)));
    } catch {
      setError('Failed to update schedule.');
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading || !device) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-white/[0.06] rounded w-24" />
        <div className="h-40 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
        <div className="h-80 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  const chartData = history.map((p) => ({
    time: new Date(p.timestamp).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit',
    }),
    kwh: Number(p.valueKwh.toFixed(4)),
  }));

  const totalKwh = history.reduce((s, p) => s + p.valueKwh, 0);

  return (
    <div className="space-y-6">
      <Link
        to="/devices"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft size={15} />
        Back to Devices
      </Link>

      <div className={`bg-white dark:bg-white/[0.03] rounded-2xl border p-6 shadow-sm dark:shadow-none transition-all ${
        device.status ? 'border-yellow-300 dark:border-yellow-400/25' : 'border-slate-200 dark:border-white/[0.08]'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              device.status
                ? 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/35'
            }`}>
              {deviceIcon(device.type, 26)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{device.name}</h2>
              <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">
                {device.room?.name}
                &nbsp;&middot;&nbsp;
                {device.type.replace(/_/g, ' ')}
                &nbsp;&middot;&nbsp;
                {device.powerWatts} W
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-black ${device.status ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-300 dark:text-white/30'}`}>
              {device.status ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch on={device.status} onToggle={toggle} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Status', value: device.status ? 'Active' : 'Inactive', active: device.status },
            { label: 'Rated Power', value: `${device.powerWatts} W`, active: false },
            { label: 'Type', value: device.type.replace(/_/g, ' '), active: false },
            { label: 'Room', value: device.room?.name ?? '—', active: false },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3">
              <p className="text-xs text-slate-400 dark:text-white/30 mb-1.5">{item.label}</p>
              <p className={`text-sm font-bold ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white/80'}`}>
                {item.active !== undefined && item.label === 'Status' && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-white/20'}`} />
                    {item.value}
                  </span>
                )}
                {item.label !== 'Status' && item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-400/8 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">7-day total</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {totalKwh.toFixed(3)} <span className="text-sm font-normal text-slate-400 dark:text-white/35">kWh</span>
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-400/8 flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Readings</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">{history.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-400/8 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Last reading</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {history.length > 0
                ? new Date(history[history.length - 1].timestamp).toLocaleString([], {
                    hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Energy usage — last 7 days</h3>
        <div className="h-64">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-white/20">
              <BarChart3 size={30} className="mb-2 opacity-40" />
              <p className="text-sm">No data recorded yet.</p>
              <p className="text-xs mt-1">Turn this device on to start tracking.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="time" stroke={chartStyle.axis} fontSize={11} tickLine={false} />
                <YAxis stroke={chartStyle.axis} fontSize={11} unit=" kWh" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartStyle.tooltip} formatter={(v: number) => [`${v.toFixed(4)} kWh`, 'Reading']} />
                <Line type="monotone" dataKey="kwh" stroke="#facc15" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Schedules */}
      <section className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-yellow-500 dark:text-yellow-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedules</h3>
          </div>
          {!showCreateForm && editId == null && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-[#080810] text-xs font-bold transition"
            >
              <Plus size={13} />
              Add schedule
            </button>
          )}
        </div>

        <div className="space-y-3">
          {schedules.map((s) => (
            <div key={s.id}>
              {editId === s.id ? (
                <ScheduleForm
                  initial={{ days: s.days, startTime: s.startTime, endTime: s.endTime }}
                  onSave={(data) => handleUpdateSchedule(s.id, data)}
                  onCancel={() => setEditId(null)}
                  saving={savingSchedule}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1">
                      {DAYS.map((d) => (
                        <span
                          key={d}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.days.includes(d)
                              ? 'bg-yellow-100 dark:bg-yellow-400/15 text-yellow-700 dark:text-yellow-400'
                              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-300 dark:text-white/20'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-white/50 font-mono">
                      {s.startTime} – {s.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        s.active
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/30'
                      }`}
                    >
                      {s.active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => setEditId(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-700 dark:hover:text-white transition"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {schedules.length === 0 && !showCreateForm && (
            <div className="text-center py-8 text-slate-300 dark:text-white/20">
              <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No schedules set.</p>
              <p className="text-xs mt-1">Add a schedule to automate this device.</p>
            </div>
          )}

          {showCreateForm && (
            <ScheduleForm
              onSave={handleCreateSchedule}
              onCancel={() => setShowCreateForm(false)}
              saving={savingSchedule}
            />
          )}
        </div>
      </section>
    </div>
  );
}
