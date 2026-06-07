import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, X, Check, Pencil, ChevronRight, DoorOpen } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type {
  AdminApartment,
  AdminRoom,
  AdminUser,
  CreateRoomPayload,
} from '../../api/admin';

const ROOM_TYPES = [
  { value: 'LIVING_ROOM', label: 'Living Room' },
  { value: 'BEDROOM', label: 'Bedroom' },
  { value: 'KITCHEN', label: 'Kitchen' },
  { value: 'BATHROOM', label: 'Bathroom' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'OTHER', label: 'Other' },
] as const;

function roomTypeLabel(type: string): string {
  return ROOM_TYPES.find((t) => t.value === type)?.label ?? type.replace(/_/g, ' ');
}

const inputClass =
  'w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5';

interface EditAptForm {
  number: string;
  area: string;
}

interface CreateRoomForm {
  name: string;
  type: string;
}

const EMPTY_ROOM_FORM: CreateRoomForm = { name: '', type: 'LIVING_ROOM' };

export function AdminApartmentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apartmentId = Number(id);

  const [apartment, setApartment] = useState<AdminApartment | null>(null);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [residents, setResidents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit apartment
  const [editingApt, setEditingApt] = useState(false);
  const [editAptForm, setEditAptForm] = useState<EditAptForm>({ number: '', area: '' });
  const [aptEditError, setAptEditError] = useState<string | null>(null);
  const [aptEditSaving, setAptEditSaving] = useState(false);

  // Assign owner
  const [assigningOwner, setAssigningOwner] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [ownerSaving, setOwnerSaving] = useState(false);

  // Add room
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState<CreateRoomForm>(EMPTY_ROOM_FORM);
  const [roomFormError, setRoomFormError] = useState<string | null>(null);
  const [roomSaving, setRoomSaving] = useState(false);

  // Delete room
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);

  async function load() {
    try {
      const [allApartments, allRooms, allUsers] = await Promise.all([
        adminApi.apartments.list(),
        adminApi.rooms.list(),
        adminApi.users.list(),
      ]);
      const found = allApartments.find((a) => a.id === apartmentId);
      if (!found) {
        setError('Apartment not found.');
        return;
      }
      setApartment(found);
      setEditAptForm({ number: found.number, area: String(found.area) });
      setRooms(allRooms.filter((r) => r.apartmentId === apartmentId));
      setResidents(allUsers.filter((u) => u.role === 'RESIDENT'));
    } catch {
      setError('Failed to load apartment data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [apartmentId]);

  async function handleSaveApt(e: React.FormEvent) {
    e.preventDefault();
    if (!editAptForm.number.trim() || !editAptForm.area) {
      setAptEditError('Number and area are required.');
      return;
    }
    setAptEditSaving(true);
    setAptEditError(null);
    try {
      const updated = await adminApi.apartments.update(apartmentId, {
        number: editAptForm.number.trim(),
        area: Number(editAptForm.area),
      });
      setApartment(updated);
      setEditingApt(false);
    } catch {
      setAptEditError('Failed to update apartment.');
    } finally {
      setAptEditSaving(false);
    }
  }

  async function handleAssignOwner() {
    if (!selectedOwnerId) return;
    setOwnerSaving(true);
    try {
      await adminApi.apartments.update(apartmentId, { ownerId: Number(selectedOwnerId) });
      await load();
      setAssigningOwner(false);
      setSelectedOwnerId('');
    } catch {
      setError('Failed to assign owner.');
    } finally {
      setOwnerSaving(false);
    }
  }

  async function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomForm.name.trim()) {
      setRoomFormError('Room name is required.');
      return;
    }
    setRoomSaving(true);
    setRoomFormError(null);
    try {
      const payload: CreateRoomPayload = {
        name: roomForm.name.trim(),
        type: roomForm.type,
        apartmentId,
      };
      const created = await adminApi.rooms.create(payload);
      setRooms((prev) => [...prev, created]);
      setRoomForm(EMPTY_ROOM_FORM);
      setShowAddRoom(false);
    } catch {
      setRoomFormError('Failed to create room.');
    } finally {
      setRoomSaving(false);
    }
  }

  async function handleDeleteRoom(roomId: number) {
    try {
      await adminApi.rooms.remove(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch {
      setError('Failed to delete room.');
    } finally {
      setDeleteRoomId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-64 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="h-10 w-48 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition"
        >
          ← Back
        </button>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
          {error ?? 'Apartment not found.'}
        </div>
      </div>
    );
  }

  const buildingId = apartment.buildingId ?? apartment.building?.id;
  const buildingName = apartment.building?.name ?? 'Building';
  const owner = apartment.owner ?? residents.find((r) => r.id === apartment.ownerId);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/30">
        <Link to="/admin" className="hover:text-yellow-500 dark:hover:text-yellow-400 transition font-medium">
          Buildings
        </Link>
        <span>/</span>
        {buildingId ? (
          <Link
            to={`/admin/buildings/${buildingId}`}
            className="hover:text-yellow-500 dark:hover:text-yellow-400 transition font-medium"
          >
            {buildingName}
          </Link>
        ) : (
          <span>{buildingName}</span>
        )}
        <span>/</span>
        <span className="text-slate-600 dark:text-white/70 font-semibold">Apt {apartment.number}</span>
      </nav>

      {/* Apartment header */}
      <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6 space-y-5">
        {/* Info row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {editingApt ? (
              <form onSubmit={handleSaveApt} className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className={labelClass}>Number</label>
                  <input
                    type="text"
                    value={editAptForm.number}
                    onChange={(e) => setEditAptForm((f) => ({ ...f, number: e.target.value }))}
                    className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelClass}>Area (m²)</label>
                  <input
                    type="number"
                    min="1"
                    value={editAptForm.area}
                    onChange={(e) => setEditAptForm((f) => ({ ...f, area: e.target.value }))}
                    className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition w-24"
                  />
                </div>
                {aptEditError && <span className="text-xs text-red-500">{aptEditError}</span>}
                <div className="flex gap-2 items-end" style={{ paddingTop: '1.3rem' }}>
                  <button
                    type="submit"
                    disabled={aptEditSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                  >
                    <Check size={13} />
                    {aptEditSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingApt(false); setAptEditError(null); }}
                    className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Apartment {apartment.number}
                  </h1>
                  <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">{apartment.area} m²</p>
                </div>
                <button
                  onClick={() => setEditingApt(true)}
                  className="p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Owner section */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
          <p className={labelClass}>Owner</p>
          {assigningOwner ? (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="">Select resident…</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} — {r.email}</option>
                ))}
              </select>
              <button
                onClick={handleAssignOwner}
                disabled={!selectedOwnerId || ownerSaving}
                className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
              >
                <Check size={13} />
                {ownerSaving ? 'Saving…' : 'Assign'}
              </button>
              <button
                onClick={() => { setAssigningOwner(false); setSelectedOwnerId(''); }}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
              >
                Cancel
              </button>
            </div>
          ) : owner && owner.name ? (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white/90">{owner.name}</p>
                <p className="text-xs text-slate-400 dark:text-white/40">{owner.email}</p>
              </div>
              <button
                onClick={() => { setAssigningOwner(true); setSelectedOwnerId(''); }}
                className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline font-semibold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30 text-xs font-semibold">
                No owner assigned
              </span>
              <button
                onClick={() => { setAssigningOwner(true); setSelectedOwnerId(''); }}
                className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline font-semibold"
              >
                Assign owner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rooms section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
            Rooms
          </h2>
          <button
            onClick={() => {
              setRoomForm(EMPTY_ROOM_FORM);
              setRoomFormError(null);
              setShowAddRoom(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-xs transition"
          >
            <Plus size={13} />
            Add Room
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Add room form */}
        {showAddRoom && (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Room</h3>
              <button
                onClick={() => setShowAddRoom(false)}
                className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Master Bedroom"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm((f) => ({ ...f, type: e.target.value }))}
                  className={inputClass}
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {roomFormError && (
                <p className="sm:col-span-2 text-xs text-red-500 dark:text-red-400">{roomFormError}</p>
              )}
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={roomSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                >
                  <Check size={14} />
                  {roomSaving ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-14 text-slate-400 dark:text-white/30 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
            <DoorOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No rooms yet.</p>
            <p className="text-sm mt-1">Add the first room to this apartment.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                    <th className="py-3 px-6 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Name</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Type</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Devices</th>
                    <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">{room.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60">
                          {roomTypeLabel(room.type)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">
                        {room.devices?.length ?? 0}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {deleteRoomId === room.id ? (
                            <>
                              <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Confirm?</span>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteRoomId(null)}
                                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/admin/rooms/${room.id}`)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold hover:bg-yellow-400/20 transition"
                              >
                                Manage Devices
                                <ChevronRight size={12} />
                              </button>
                              <button
                                onClick={() => setDeleteRoomId(room.id)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
