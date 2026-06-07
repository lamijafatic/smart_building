import { useEffect, useState } from 'react';
import { Cpu, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminDevice, AdminRoom, CreateDevicePayload } from '../../api/admin';

const DEVICE_TYPES = [
  'LIGHT',
  'THERMOSTAT',
  'OUTLET',
  'AC',
  'TV',
  'WASHING_MACHINE',
  'OTHER',
] as const;

interface FormState {
  name: string;
  type: string;
  powerWatts: string;
  roomId: string;
}

const EMPTY_FORM: FormState = { name: '', type: 'LIGHT', powerWatts: '', roomId: '' };

export function AdminDevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    try {
      const [devs, rms] = await Promise.all([
        adminApi.devices.list(),
        adminApi.rooms.list(),
      ]);
      setDevices(devs);
      setRooms(rms);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setPanelMode('create');
  }

  function openEdit(d: AdminDevice) {
    setForm({
      name: d.name,
      type: d.type,
      powerWatts: String(d.powerWatts),
      roomId: String(d.roomId),
    });
    setFormError(null);
    setPanelMode(d.id);
  }

  function closePanel() {
    setPanelMode(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.type || !form.powerWatts || !form.roomId) {
      setFormError('All fields are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateDevicePayload = {
        name: form.name.trim(),
        type: form.type,
        powerWatts: parseFloat(form.powerWatts),
        roomId: parseInt(form.roomId, 10),
      };
      if (panelMode === 'create') {
        await adminApi.devices.create(payload);
        await load();
      } else if (typeof panelMode === 'number') {
        await adminApi.devices.update(panelMode, payload);
        await load();
      }
      closePanel();
    } catch {
      setFormError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.devices.remove(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('Failed to delete device.');
    } finally {
      setDeleteId(null);
    }
  }

  function roomOptionLabel(r: AdminRoom): string {
    const aptNum = r.apartment?.number ?? '';
    const bldName = r.apartment?.building?.name ?? '';
    const parts = [r.name];
    if (aptNum) parts.push(`Apt ${aptNum}`);
    if (bldName) parts.push(bldName);
    return parts.join(' — ');
  }

  function deviceBreadcrumb(d: AdminDevice): { room: string; apt: string; bld: string } {
    return {
      room: d.room?.name ?? '—',
      apt: d.room?.apartment ? `Apt ${d.room.apartment.number}` : '—',
      bld: d.room?.apartment?.building?.name ?? '—',
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Devices</h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition"
        >
          <Plus size={16} />
          Add Device
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {panelMode !== null && (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {panelMode === 'create' ? 'New Device' : 'Edit Device'}
            </h2>
            <button onClick={closePanel} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Main Light"
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
              >
                {DEVICE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Power (W)</label>
              <input
                type="number"
                value={form.powerWatts}
                onChange={(e) => setForm((f) => ({ ...f, powerWatts: e.target.value }))}
                placeholder="e.g. 60"
                min="0"
                step="0.1"
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5">Room</label>
              <select
                value={form.roomId}
                onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
              >
                <option value="">Select room…</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{roomOptionLabel(r)}</option>
                ))}
              </select>
            </div>
            {formError && (
              <p className="sm:col-span-2 text-xs text-red-500 dark:text-red-400">{formError}</p>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
              >
                <Check size={14} />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-white/30">
          <Cpu size={36} className="mx-auto mb-3 opacity-40" />
          <p>No devices yet. Add one above.</p>
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
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Room</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Apartment</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Building</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Status</th>
                  <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {devices.map((d) => {
                  const { room, apt, bld } = deviceBreadcrumb(d);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">{d.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{d.type.replace(/_/g, ' ')}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50 tabular-nums">{d.powerWatts} W</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{room}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{apt}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{bld}</td>
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
                          {deleteId === d.id ? (
                            <>
                              <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Confirm?</span>
                              <button
                                onClick={() => handleDelete(d.id)}
                                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openEdit(d)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteId(d.id)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
