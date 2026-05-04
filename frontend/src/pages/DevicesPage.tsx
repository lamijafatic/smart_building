import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Wind,
  Tv,
  Refrigerator,
  WashingMachine,
  Waves,
  Thermometer,
  Plug,
  ChevronRight,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { apartmentsApi } from '../api/apartments';
import { devicesApi } from '../api/devices';
import type { Apartment, Device } from '../types';

function deviceIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    LIGHT: <Lightbulb size={20} />,
    AC: <Wind size={20} />,
    TV: <Tv size={20} />,
    FRIDGE: <Refrigerator size={20} />,
    WASHING_MACHINE: <WashingMachine size={20} />,
    DISHWASHER: <Waves size={20} />,
    HEATER: <Thermometer size={20} />,
    BOILER: <Thermometer size={20} />,
  };
  return icons[type] ?? <Plug size={20} />;
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? 'Turn off' : 'Turn on'}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        on ? 'bg-brand-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function DevicesPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  useEffect(() => {
    apartmentsApi
      .list()
      .then((apts) => {
        setApartments(apts);
        if (apts.length > 0) setSelectedId(apts[0].id);
      })
      .catch(() => setError('Unable to load data. Please try again.'));
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setLoading(true);
    setError(null);
    devicesApi
      .listForApartment(selectedId)
      .then(setDevices)
      .catch(() => setError('Unable to load data. Please try again.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  async function handleToggle(device: Device) {
    if (toggling.has(device.id)) return;
    setToggling((prev) => new Set(prev).add(device.id));
    try {
      const updated = await devicesApi.setStatus(device.id, !device.status);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: updated.status } : d)),
      );
    } catch {
      setError('Failed to update device. Please try again.');
    } finally {
      setToggling((prev) => { const s = new Set(prev); s.delete(device.id); return s; });
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map((i) => <div key={i} className="h-36 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Zap size={40} className="mb-3 opacity-40" />
        <p className="text-lg font-medium">No devices found</p>
        <p className="text-sm mt-1">This apartment has no devices registered.</p>
      </div>
    );
  }

  const grouped = devices.reduce<Record<string, Device[]>>((acc, d) => {
    const key = d.room?.name ?? `Room ${d.roomId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const activeCount = devices.filter((d) => d.status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Devices</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="font-medium text-emerald-600">{activeCount}</span> of{' '}
            <span className="font-medium text-slate-700">{devices.length}</span> devices active
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

      {Object.entries(grouped).map(([roomName, items]) => (
        <section key={roomName}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            {roomName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((d) => (
              <div
                key={d.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition ${
                  d.status ? 'border-brand-200 shadow-brand-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      d.status ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {deviceIcon(d.type)}
                    </div>
                    <div>
                      <Link
                        to={`/devices/${d.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-brand-700 flex items-center gap-1 group"
                      >
                        {d.name}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{d.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    on={d.status}
                    onToggle={() => handleToggle(d)}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Rated power</span>
                  <span className="font-semibold text-slate-700">{d.powerWatts} W</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
