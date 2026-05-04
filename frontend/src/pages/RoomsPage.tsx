import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sofa,
  UtensilsCrossed,
  Moon,
  Droplets,
  Home,
  ChevronRight,
  ChevronDown,
  DoorOpen,
} from 'lucide-react';
import { apartmentsApi } from '../api/apartments';
import { roomsApi } from '../api/rooms';
import type { Apartment, Room } from '../types';

function roomIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    LIVING_ROOM: <Sofa size={22} />,
    KITCHEN: <UtensilsCrossed size={22} />,
    BEDROOM: <Moon size={22} />,
    BATHROOM: <Droplets size={22} />,
    HALLWAY: <Home size={22} />,
    OFFICE: <Home size={22} />,
  };
  return icons[type] ?? <DoorOpen size={22} />;
}

function roomColor(type: string): string {
  const colors: Record<string, string> = {
    LIVING_ROOM: 'bg-amber-50 text-amber-600',
    KITCHEN: 'bg-orange-50 text-orange-600',
    BEDROOM: 'bg-blue-50 text-blue-600',
    BATHROOM: 'bg-cyan-50 text-cyan-600',
    HALLWAY: 'bg-slate-50 text-slate-600',
    OFFICE: 'bg-purple-50 text-purple-600',
  };
  return colors[type] ?? 'bg-slate-50 text-slate-600';
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
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-5 text-sm">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3].map((i) => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <DoorOpen size={40} className="mb-3 opacity-40" />
        <p className="text-lg font-medium">No rooms found</p>
        <p className="text-sm mt-1">This apartment has no rooms registered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rooms</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} in this apartment
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => {
          const activeDevices = r.devices?.filter((d) => d.status).length ?? 0;
          const totalDevices = r.devices?.length ?? 0;
          return (
            <Link
              key={r.id}
              to={`/rooms/${r.id}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${roomColor(r.type)}`}>
                  {roomIcon(r.type)}
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-brand-600 transition mt-1"
                />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 transition">
                {r.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{r.type.replace(/_/g, ' ')}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{totalDevices} device{totalDevices !== 1 ? 's' : ''}</span>
                {activeDevices > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
