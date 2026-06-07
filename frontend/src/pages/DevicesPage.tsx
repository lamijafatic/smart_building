import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb, Wind, Tv, Refrigerator, WashingMachine,
  Waves, Thermometer, Plug, ChevronRight, ChevronDown, Zap, Plus, X, CheckCircle2, Wifi,
} from 'lucide-react';
import { apartmentsApi } from '../api/apartments';
import { devicesApi } from '../api/devices';
import { roomsApi } from '../api/rooms';
import type { Apartment, Device, Room } from '../types';

function deviceIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    LIGHT: <Lightbulb size={19} />,
    AC: <Wind size={19} />,
    TV: <Tv size={19} />,
    FRIDGE: <Refrigerator size={19} />,
    WASHING_MACHINE: <WashingMachine size={19} />,
    DISHWASHER: <Waves size={19} />,
    HEATER: <Thermometer size={19} />,
    BOILER: <Thermometer size={19} />,
  };
  return icons[type] ?? <Plug size={19} />;
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? 'Turn off' : 'Turn on'}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none ${
        on ? 'bg-yellow-400 shadow-lg shadow-yellow-400/20' : 'bg-slate-200 dark:bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const DEVICE_TYPES = ['LIGHT', 'THERMOSTAT', 'OUTLET', 'AC', 'TV', 'WASHING_MACHINE', 'OTHER'];
const DEFAULT_WATTS: Record<string, number> = {
  LIGHT: 60, THERMOSTAT: 5, OUTLET: 100, AC: 1500, TV: 120, WASHING_MACHINE: 900, OTHER: 50,
};

function AddDeviceModal({
  rooms,
  onClose,
  onAdded,
}: {
  rooms: Room[];
  onClose: () => void;
  onAdded: (d: Device) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('LIGHT');
  const [powerWatts, setPowerWatts] = useState(60);
  const [roomId, setRoomId] = useState<number>(rooms[0]?.id ?? 0);
  const [phase, setPhase] = useState<'form' | 'connecting' | 'done'>('form');
  const [saving, setSaving] = useState(false);
  const [newDevice, setNewDevice] = useState<Device | null>(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (phase !== 'connecting') return;
    const t = setTimeout(() => {
      setPhase('done');
    }, 2500);
    const d = setInterval(() => setDots((n) => (n + 1) % 4), 400);
    return () => { clearTimeout(t); clearInterval(d); };
  }, [phase]);

  async function handleSave() {
    if (!name.trim() || !roomId) return;
    setSaving(true);
    try {
      const device = await devicesApi.create({ name: name.trim(), type, powerWatts, roomId });
      setNewDevice(device);
      setPhase('connecting');
    } catch {
      setSaving(false);
    }
  }

  function handleTypeChange(t: string) {
    setType(t);
    setPowerWatts(DEFAULT_WATTS[t] ?? 50);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0d0d1c] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08]">
        <div className="p-6 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Plus size={18} className="text-yellow-400" />
            </div>
            <h2 className="font-black text-slate-900 dark:text-white">Add New Device</h2>
          </div>
          {phase === 'form' && (
            <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/70 transition">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">
          {phase === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1.5">Device name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bedroom Lamp"
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-400 transition"
                >
                  {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1.5">Power (Watts)</label>
                <input
                  type="number"
                  min={1}
                  value={powerWatts}
                  onChange={(e) => setPowerWatts(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1.5">Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-400 transition"
                >
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.1] py-2.5 text-sm font-semibold text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !roomId}
                  className="flex-1 bg-yellow-400 text-[#080810] rounded-xl py-2.5 text-sm font-black hover:bg-yellow-300 transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Connect'}
                </button>
              </div>
            </div>
          )}

          {phase === 'connecting' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center mx-auto">
                <Wifi size={28} className="text-yellow-400 animate-pulse" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">Connecting{'.'.repeat(dots)}</p>
                <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
                  Pairing <strong className="text-slate-700 dark:text-white/70">{name}</strong> with your apartment
                </p>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={30} className="text-green-500" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-lg">Device connected!</p>
                <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
                  <strong className="text-slate-700 dark:text-white/70">{newDevice?.name}</strong> has been added to your apartment.
                </p>
              </div>
              <button
                onClick={() => { if (newDevice) onAdded(newDevice); onClose(); }}
                className="w-full bg-yellow-400 text-[#080810] rounded-xl py-3 font-black text-sm hover:bg-yellow-300 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DevicesPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());
  const [showAddDevice, setShowAddDevice] = useState(false);

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
    Promise.all([
      devicesApi.listForApartment(selectedId),
      roomsApi.listForApartment(selectedId),
    ])
      .then(([devs, rms]) => { setDevices(devs); setRooms(rms); })
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
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded-xl w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-36 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-white/25">
        <Zap size={36} className="mb-3 opacity-40" />
        <p className="text-base font-semibold">No devices found</p>
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
    <div className="space-y-8">
      {showAddDevice && rooms.length > 0 && (
        <AddDeviceModal
          rooms={rooms}
          onClose={() => setShowAddDevice(false)}
          onAdded={(d) => setDevices((prev) => [...prev, d])}
        />
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Devices</h2>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">
            <span className="font-bold text-yellow-500 dark:text-yellow-400">{activeCount}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-600 dark:text-white/70">{devices.length}</span> devices active
          </p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAddDevice(true)}
          className="flex items-center gap-1.5 bg-yellow-400 text-[#080810] rounded-xl px-4 py-2 text-sm font-black hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
        >
          <Plus size={15} />
          Add Device
        </button>
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

      {Object.entries(grouped).map(([roomName, items]) => (
        <section key={roomName}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-3">
            {roomName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((d) => (
              <div
                key={d.id}
                className={`bg-white dark:bg-white/[0.03] rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 shadow-sm dark:shadow-none ${
                  d.status
                    ? 'border-yellow-300 dark:border-yellow-400/25 bg-yellow-50/50 dark:bg-yellow-400/[0.03]'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      d.status
                        ? 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/35'
                    }`}>
                      {deviceIcon(d.type)}
                    </div>
                    <div>
                      <Link
                        to={`/devices/${d.id}`}
                        className="text-sm font-bold text-slate-800 dark:text-white/90 hover:text-yellow-600 dark:hover:text-yellow-400 flex items-center gap-1 group transition"
                      >
                        {d.name}
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                      <p className="text-xs text-slate-400 dark:text-white/35 mt-0.5">{d.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <ToggleSwitch on={d.status} onToggle={() => handleToggle(d)} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/30 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                  <span>Rated power</span>
                  <span className="font-bold text-slate-600 dark:text-white/55">{d.powerWatts} W</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
