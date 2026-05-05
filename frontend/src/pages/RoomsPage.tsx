import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sofa, UtensilsCrossed, Moon, Droplets, Home,
  ChevronRight, ChevronDown, DoorOpen,
} from 'lucide-react';
import { apartmentsApi } from '../api/apartments';
import { roomsApi } from '../api/rooms';
import type { Apartment, Room } from '../types';

function roomIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    LIVING_ROOM: <Sofa size={21} />,
    KITCHEN: <UtensilsCrossed size={21} />,
    BEDROOM: <Moon size={21} />,
    BATHROOM: <Droplets size={21} />,
    HALLWAY: <Home size={21} />,
    OFFICE: <Home size={21} />,
  };
  return icons[type] ?? <DoorOpen size={21} />;
}

function roomColor(type: string): string {
  const colors: Record<string, string> = {
    LIVING_ROOM: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10',
    KITCHEN: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10',
    BEDROOM: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10',
    BATHROOM: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/10',
    HALLWAY: 'text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-white/[0.06]',
    OFFICE: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10',
  };
  return colors[type] ?? 'text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-white/[0.06]';
}

export function RoomsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    roomsApi
      .listForApartment(selectedId)
      .then(setRooms)
      .catch(() => setError('Unable to load data. Please try again.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

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
        <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded-xl w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-white/25">
        <DoorOpen size={36} className="mb-3 opacity-40" />
        <p className="text-base font-semibold">No rooms found</p>
        <p className="text-sm mt-1">This apartment has no rooms registered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Rooms</h2>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} in this apartment
          </p>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => {
          const activeDevices = r.devices?.filter((d) => d.status).length ?? 0;
          const totalDevices = r.devices?.length ?? 0;
          return (
            <Link
              key={r.id}
              to={`/rooms/${r.id}`}
              className="group bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 hover:border-yellow-300 dark:hover:border-yellow-400/25 hover:shadow-md dark:hover:bg-yellow-400/[0.02] transition-all duration-200 block shadow-sm dark:shadow-none"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${roomColor(r.type)}`}>
                  {roomIcon(r.type)}
                </div>
                <ChevronRight
                  size={15}
                  className="text-slate-300 dark:text-white/20 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition mt-1"
                />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white transition">
                {r.name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{r.type.replace(/_/g, ' ')}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-400 dark:text-white/30">
                <span>{totalDevices} device{totalDevices !== 1 ? 's' : ''}</span>
                {activeDevices > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse" />
                    {activeDevices} active
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
