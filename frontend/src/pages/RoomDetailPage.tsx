import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Lightbulb, Wind, Tv, Refrigerator,
  WashingMachine, Waves, Thermometer, Plug, ChevronRight, DoorOpen,
} from 'lucide-react';
import { roomsApi } from '../api/rooms';
import { devicesApi } from '../api/devices';
import type { Room, Device } from '../types';

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

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    roomsApi
      .get(Number(id))
      .then((r) => {
        setRoom(r);
        setDevices(r.devices ?? []);
      })
      .catch(() => setError('Unable to load room.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggle(device: Device) {
    if (toggling.has(device.id)) return;
    setToggling((prev) => new Set(prev).add(device.id));
    try {
      const updated = await devicesApi.setStatus(device.id, !device.status);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: updated.status } : d)),
      );
    } catch {
      setError('Failed to update device.');
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

  if (loading || !room) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-white/[0.06] rounded w-24" />
        <div className="h-20 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-36 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeCount = devices.filter((d) => d.status).length;

  return (
    <div className="space-y-6">
      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft size={15} />
        Back to Rooms
      </Link>

      <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/50 flex items-center justify-center">
            <DoorOpen size={26} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{room.name}</h2>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">
              {room.type.replace(/_/g, ' ')}
              &nbsp;&middot;&nbsp;
              <span className="font-bold text-yellow-500 dark:text-yellow-400">{activeCount}</span>
              {' '}of{' '}
              <span className="font-semibold text-slate-600 dark:text-white/60">{devices.length}</span> devices active
            </p>
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-white/25 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.05]">
          <Plug size={30} className="mb-2 opacity-40" />
          <p className="text-sm font-semibold">No devices in this room</p>
        </div>
      ) : (
        <>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">Devices</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d) => (
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
                  <ToggleSwitch on={d.status} onToggle={() => toggle(d)} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/30 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                  <span>Rated power</span>
                  <span className="font-bold text-slate-600 dark:text-white/55">{d.powerWatts} W</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
