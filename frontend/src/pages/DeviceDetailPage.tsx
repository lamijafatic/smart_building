import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Lightbulb,
  Wind,
  Tv,
  Refrigerator,
  WashingMachine,
  Waves,
  Thermometer,
  Plug,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react';
import { devicesApi } from '../api/devices';
import type { Device, EnergyDataPoint } from '../types';

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
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        on ? 'bg-brand-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
          on ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [history, setHistory] = useState<EnergyDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setError(null);
    try {
      const [d, h] = await Promise.all([
        devicesApi.get(Number(id)),
        devicesApi.history(Number(id), 7),
      ]);
      setDevice(d);
      setHistory(h);
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

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading || !device) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-40 bg-slate-200 rounded-xl" />
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const chartData = history.map((p) => ({
    time: new Date(p.timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }),
    kwh: Number(p.valueKwh.toFixed(4)),
  }));

  const totalKwh = history.reduce((s, p) => s + p.valueKwh, 0);

  return (
    <div className="space-y-6">
      <Link
        to="/devices"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft size={16} />
        Back to Devices
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              device.status ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {deviceIcon(device.type, 28)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{device.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {device.room?.name}
                &nbsp;&middot;&nbsp;
                {device.type.replace(/_/g, ' ')}
                &nbsp;&middot;&nbsp;
                {device.powerWatts} W rated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-semibold ${device.status ? 'text-emerald-600' : 'text-slate-400'}`}>
              {device.status ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch on={device.status} onToggle={toggle} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
              device.status ? 'text-emerald-600' : 'text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${device.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {device.status ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Rated Power</p>
            <p className="text-sm font-semibold text-slate-800">{device.powerWatts} W</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Type</p>
            <p className="text-sm font-semibold text-slate-800">{device.type.replace(/_/g, ' ')}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Room</p>
            <p className="text-sm font-semibold text-slate-800">{device.room?.name ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">7-day total</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalKwh.toFixed(3)} <span className="text-sm font-normal text-slate-500">kWh</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Readings</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{history.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last reading</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {history.length > 0
                ? new Date(history[history.length - 1].timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Energy usage history — last 7 days</h3>
        <div className="h-64">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <BarChart3 size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No data recorded yet.</p>
              <p className="text-xs mt-1">Turn this device on to start tracking.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kWh" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v: number) => [`${v.toFixed(4)} kWh`, 'Reading']}
                />
                <Line
                  type="monotone"
                  dataKey="kwh"
                  stroke="#dc6803"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {history.length > 0 && (
          <p className="text-xs text-slate-400 mt-2 text-right">Auto-refreshes every 30 seconds</p>
        )}
      </section>
    </div>
  );
}
