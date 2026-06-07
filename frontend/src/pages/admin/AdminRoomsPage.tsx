import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, X, Check, Pencil, Cpu } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminRoom, AdminDevice, CreateDevicePayload } from '../../api/admin';

const DEVICE_TYPES = [
  { value: 'LIGHT', label: 'Light', defaultPower: 60 },
  { value: 'THERMOSTAT', label: 'Thermostat', defaultPower: 1500 },
  { value: 'OUTLET', label: 'Outlet', defaultPower: 100 },
  { value: 'AC', label: 'AC', defaultPower: 2000 },
  { value: 'TV', label: 'TV', defaultPower: 90 },
  { value: 'WASHING_MACHINE', label: 'Washing Machine', defaultPower: 1800 },
  { value: 'OTHER', label: 'Other', defaultPower: 50 },
] as const;

type DeviceTypeValue = typeof DEVICE_TYPES[number]['value'];

function deviceTypeLabel(type: string): string {
  return DEVICE_TYPES.find((t) => t.value === type)?.label ?? type.replace(/_/g, ' ');
}

function defaultPower(type: string): number {
  return DEVICE_TYPES.find((t) => t.value === type)?.defaultPower ?? 50;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  LIVING_ROOM: 'Living Room',
  BEDROOM: 'Bedroom',
  KITCHEN: 'Kitchen',
  BATHROOM: 'Bathroom',
  OFFICE: 'Office',
  OTHER: 'Other',
};

const inputClass =
  'w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5';

interface CreateDeviceForm {
  name: string;
  type: DeviceTypeValue;
  powerWatts: string;
}

interface EditDeviceForm {
  name: string;
  type: string;
  powerWatts: string;
}

const EMPTY_DEVICE_FORM: CreateDeviceForm = { name: '', type: 'LIGHT', powerWatts: '60' };

export function AdminRoomsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roomId = Number(id);

  const [room, setRoom] = useState<AdminRoom | null>(null);
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit room name/type inline
  const [editingRoom, setEditingRoom] = useState(false);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomType, setEditRoomType] = useState('');
  const [roomEditError, setRoomEditError] = useState<string | null>(null);
  const [roomEditSaving, setRoomEditSaving] = useState(false);

  // Add device
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceForm, setDeviceForm] = useState<CreateDeviceForm>(EMPTY_DEVICE_FORM);
  const [deviceFormError, setDeviceFormError] = useState<string | null>(null);
  const [deviceSaving, setDeviceSaving] = useState(false);

  // Edit device
  const [editDeviceId, setEditDeviceId] = useState<number | null>(null);
  const [editDeviceForm, setEditDeviceForm] = useState<EditDeviceForm>({ name: '', type: 'LIGHT', powerWatts: '' });
  const [editDeviceError, setEditDeviceError] = useState<string | null>(null);
  const [editDeviceSaving, setEditDeviceSaving] = useState(false);

  // Delete device
  const [deleteDeviceId, setDeleteDeviceId] = useState<number | null>(null);

  async function load() {
    try {
      const [allRooms, allDevices] = await Promise.all([
        adminApi.rooms.list(),
        adminApi.devices.list(),
      ]);
      const found = allRooms.find((r) => r.id === roomId);
      if (!found) {
        setError('Room not found.');
        return;
      }
      setRoom(found);
      setEditRoomName(found.name);
      setEditRoomType(found.type);
      setDevices(allDevices.filter((d) => d.roomId === roomId));
    } catch {
      setError('Failed to load room data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [roomId]);

  async function handleSaveRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!editRoomName.trim()) {
      setRoomEditError('Room name is required.');
      return;
    }
    setRoomEditSaving(true);
    setRoomEditError(null);
    try {
      const updated = await adminApi.rooms.update(roomId, {
        name: editRoomName.trim(),
        type: editRoomType,
      });
      setRoom(updated);
      setEditingRoom(false);
    } catch {
      setRoomEditError('Failed to update room.');
    } finally {
      setRoomEditSaving(false);
    }
  }

  async function handleAddDevice(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceForm.name.trim() || !deviceForm.powerWatts) {
      setDeviceFormError('Name and power are required.');
      return;
    }
    setDeviceSaving(true);
    setDeviceFormError(null);
    try {
      const payload: CreateDevicePayload = {
        name: deviceForm.name.trim(),
        type: deviceForm.type,
        powerWatts: Number(deviceForm.powerWatts),
        roomId,
      };
      const created = await adminApi.devices.create(payload);
      setDevices((prev) => [...prev, created]);
      setDeviceForm(EMPTY_DEVICE_FORM);
      setShowAddDevice(false);
    } catch {
      setDeviceFormError('Failed to create device.');
    } finally {
      setDeviceSaving(false);
    }
  }

  function openEditDevice(d: AdminDevice) {
    setEditDeviceId(d.id);
    setEditDeviceForm({ name: d.name, type: d.type, powerWatts: String(d.powerWatts) });
    setEditDeviceError(null);
  }

  async function handleSaveDevice(e: React.FormEvent) {
    e.preventDefault();
    if (editDeviceId == null) return;
    if (!editDeviceForm.name.trim() || !editDeviceForm.powerWatts) {
      setEditDeviceError('Name and power are required.');
      return;
    }
    setEditDeviceSaving(true);
    setEditDeviceError(null);
    try {
      const updated = await adminApi.devices.update(editDeviceId, {
        name: editDeviceForm.name.trim(),
        type: editDeviceForm.type,
        powerWatts: Number(editDeviceForm.powerWatts),
      });
      setDevices((prev) => prev.map((d) => (d.id === editDeviceId ? updated : d)));
      setEditDeviceId(null);
    } catch {
      setEditDeviceError('Failed to update device.');
    } finally {
      setEditDeviceSaving(false);
    }
  }

  async function handleDeleteDevice(deviceId: number) {
    try {
      await adminApi.devices.remove(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch {
      setError('Failed to delete device.');
    } finally {
      setDeleteDeviceId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-72 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="h-10 w-48 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition"
        >
          ← Back
        </button>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
          {error ?? 'Room not found.'}
        </div>
      </div>
    );
  }

  const apartmentId = room.apartmentId ?? room.apartment?.id;
  const aptNumber = room.apartment?.number ?? 'Apartment';
  const buildingId = room.apartment?.building?.id;
  const buildingName = room.apartment?.building?.name ?? 'Building';

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/30 flex-wrap">
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
        {apartmentId ? (
          <Link
            to={`/admin/apartments/${apartmentId}`}
            className="hover:text-yellow-500 dark:hover:text-yellow-400 transition font-medium"
          >
            Apt {aptNumber}
          </Link>
        ) : (
          <span>Apt {aptNumber}</span>
        )}
        <span>/</span>
        <span className="text-slate-600 dark:text-white/70 font-semibold">{room.name}</span>
      </nav>

      {/* Room header */}
      <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
        {editingRoom ? (
          <form onSubmit={handleSaveRoom} className="flex items-end gap-3 flex-wrap">
            <div>
              <label className={labelClass}>Room Name</label>
              <input
                type="text"
                value={editRoomName}
                onChange={(e) => setEditRoomName(e.target.value)}
                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-lg font-bold focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={editRoomType}
                onChange={(e) => setEditRoomType(e.target.value)}
                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
              >
                {Object.entries(ROOM_TYPE_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            {roomEditError && <span className="text-xs text-red-500 self-end mb-1">{roomEditError}</span>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={roomEditSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
              >
                <Check size={13} />
                {roomEditSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingRoom(false);
                  setEditRoomName(room.name);
                  setEditRoomType(room.type);
                  setRoomEditError(null);
                }}
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
                {room.name}
              </h1>
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60">
                {ROOM_TYPE_LABELS[room.type] ?? room.type}
              </span>
            </div>
            <button
              onClick={() => setEditingRoom(true)}
              className="p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Devices section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
            Devices
          </h2>
          <button
            onClick={() => {
              setDeviceForm(EMPTY_DEVICE_FORM);
              setDeviceFormError(null);
              setShowAddDevice(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-xs transition"
          >
            <Plus size={13} />
            Add Device
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Add device form */}
        {showAddDevice && (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Device</h3>
              <button
                onClick={() => setShowAddDevice(false)}
                className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleAddDevice} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ceiling Light"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={deviceForm.type}
                  onChange={(e) => {
                    const t = e.target.value as DeviceTypeValue;
                    setDeviceForm((f) => ({ ...f, type: t, powerWatts: String(defaultPower(t)) }));
                  }}
                  className={inputClass}
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Power (W)</label>
                <input
                  type="number"
                  min="0"
                  value={deviceForm.powerWatts}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, powerWatts: e.target.value }))}
                  className={inputClass}
                />
              </div>
              {deviceFormError && (
                <p className="sm:col-span-3 text-xs text-red-500 dark:text-red-400">{deviceFormError}</p>
              )}
              <div className="sm:col-span-3 flex gap-3">
                <button
                  type="submit"
                  disabled={deviceSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                >
                  <Check size={14} />
                  {deviceSaving ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDevice(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {devices.length === 0 ? (
          <div className="text-center py-14 text-slate-400 dark:text-white/30 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
            <Cpu size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No devices yet.</p>
            <p className="text-sm mt-1">Add the first device to this room.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                    <th className="py-3 px-6 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Name</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Type</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Power</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Status</th>
                    <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                      {editDeviceId === d.id ? (
                        <td colSpan={5} className="py-3 px-6">
                          <form onSubmit={handleSaveDevice} className="flex items-end gap-3 flex-wrap">
                            <div>
                              <label className={labelClass}>Name</label>
                              <input
                                type="text"
                                value={editDeviceForm.name}
                                onChange={(e) => setEditDeviceForm((f) => ({ ...f, name: e.target.value }))}
                                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Type</label>
                              <select
                                value={editDeviceForm.type}
                                onChange={(e) => setEditDeviceForm((f) => ({ ...f, type: e.target.value }))}
                                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                              >
                                {DEVICE_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Power (W)</label>
                              <input
                                type="number"
                                min="0"
                                value={editDeviceForm.powerWatts}
                                onChange={(e) => setEditDeviceForm((f) => ({ ...f, powerWatts: e.target.value }))}
                                className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 transition w-24"
                              />
                            </div>
                            {editDeviceError && (
                              <span className="text-xs text-red-500 self-end mb-1">{editDeviceError}</span>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={editDeviceSaving}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                              >
                                <Check size={13} />
                                {editDeviceSaving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditDeviceId(null); setEditDeviceError(null); }}
                                className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">{d.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60">
                              {deviceTypeLabel(d.type)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-white/50 tabular-nums">{d.powerWatts} W</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              d.status
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/30 border border-slate-200 dark:border-white/[0.06]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${d.status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`} />
                              {d.status ? 'ON' : 'OFF'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {deleteDeviceId === d.id ? (
                                <>
                                  <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Confirm?</span>
                                  <button
                                    onClick={() => handleDeleteDevice(d.id)}
                                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteDeviceId(null)}
                                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => openEditDevice(d)}
                                    className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteDeviceId(d.id)}
                                    className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      )}
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
