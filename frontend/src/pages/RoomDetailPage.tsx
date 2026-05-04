import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ChevronRight,
  DoorOpen,
} from 'lucide-react';
import { roomsApi } from '../api/rooms';
import { devicesApi } from '../api/devices';
import type { Room, Device } from '../types';

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
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading || !room) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map((i) => <div key={i} className="h-36 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const activeCount = devices.filter((d) => d.status).length;

  return (
    <div className="space-y-6">
      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft size={16} />
        Back to Rooms
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <DoorOpen size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{room.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {room.type.replace(/_/g, ' ')}
              &nbsp;&middot;&nbsp;
              <span className="font-medium text-emerald-600">{activeCount}</span> of{' '}
              <span className="font-medium text-slate-700">{devices.length}</span> devices active
            </p>
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <Plug size={32} className="mb-2 opacity-40" />
          <p className="text-sm font-medium">No devices in this room</p>
        </div>
      ) : (
        <>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Devices</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d) => (
              <div
                key={d.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition ${
                  d.status ? 'border-brand-200' : 'border-slate-200'
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
                  <ToggleSwitch on={d.status} onToggle={() => toggle(d)} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Rated power</span>
                  <span className="font-semibold text-slate-700">{d.powerWatts} W</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
