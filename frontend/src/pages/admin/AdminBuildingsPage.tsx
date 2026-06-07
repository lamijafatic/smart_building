import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Check,
  Pencil,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type {
  AdminBuilding,
  AdminApartment,
  AdminUser,
  CreateApartmentPayload,
} from '../../api/admin';

const inputClass =
  'w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5';

interface CreateAptForm {
  number: string;
  area: string;
  isShared: boolean;
}

const EMPTY_CREATE_APT: CreateAptForm = { number: '', area: '', isShared: false };

export function AdminBuildingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const buildingId = Number(id);

  const [building, setBuilding] = useState<AdminBuilding | null>(null);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [residents, setResidents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Building edit
  const [editingBuilding, setEditingBuilding] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Add apartment
  const [showAddApt, setShowAddApt] = useState(false);
  const [createAptForm, setCreateAptForm] = useState<CreateAptForm>(EMPTY_CREATE_APT);
  const [aptFormError, setAptFormError] = useState<string | null>(null);
  const [aptSaving, setAptSaving] = useState(false);

  // Delete apartment
  const [deleteAptId, setDeleteAptId] = useState<number | null>(null);

  // Assign owner
  const [assignOwnerId, setAssignOwnerId] = useState<number | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  async function load() {
    try {
      const [allBuildings, allApartments, allUsers] = await Promise.all([
        adminApi.buildings.list(),
        adminApi.apartments.list(),
        adminApi.users.list(),
      ]);
      const found = allBuildings.find((b) => b.id === buildingId);
      if (!found) {
        setError('Building not found.');
        return;
      }
      setBuilding(found);
      setEditName(found.name);
      setEditLocation(found.location);
      setApartments(allApartments.filter((a) => a.buildingId === buildingId));
      setResidents(allUsers.filter((u) => u.role === 'RESIDENT'));
    } catch {
      setError('Failed to load building data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildingId]);

  async function handleSaveBuilding(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !editLocation.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const updated = await adminApi.buildings.update(buildingId, {
        name: editName.trim(),
        location: editLocation.trim(),
      });
      setBuilding(updated);
      setEditingBuilding(false);
    } catch {
      setFormError('Failed to update building.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddApartment(e: React.FormEvent) {
    e.preventDefault();
    if (!createAptForm.number.trim() || !createAptForm.area) {
      setAptFormError('Number and area are required.');
      return;
    }
    setAptSaving(true);
    setAptFormError(null);
    try {
      const payload: CreateApartmentPayload = {
        number: createAptForm.number.trim(),
        area: Number(createAptForm.area),
        buildingId,
        ownerId: null,
        isShared: createAptForm.isShared,
      };
      const created = await adminApi.apartments.create(payload);
      setApartments((prev) => [...prev, created]);
      setCreateAptForm(EMPTY_CREATE_APT);
      setShowAddApt(false);
    } catch {
      setAptFormError('Failed to create apartment.');
    } finally {
      setAptSaving(false);
    }
  }

  async function handleDeleteApartment(aptId: number) {
    try {
      await adminApi.apartments.remove(aptId);
      setApartments((prev) => prev.filter((a) => a.id !== aptId));
    } catch {
      setError('Failed to delete apartment.');
    } finally {
      setDeleteAptId(null);
    }
  }

  async function handleAssignOwner(aptId: number) {
    if (!selectedOwnerId) return;
    try {
      await adminApi.apartments.update(aptId, { ownerId: Number(selectedOwnerId) });
      await load();
    } catch {
      setError('Failed to assign owner.');
    } finally {
      setAssignOwnerId(null);
      setSelectedOwnerId('');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Buildings
        </button>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm">
          {error ?? 'Building not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition"
      >
        <ArrowLeft size={14} />
        Buildings
      </button>

      {/* Building header */}
      <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-yellow-400" />
            </div>
            {editingBuilding ? (
              <form onSubmit={handleSaveBuilding} className="flex items-center gap-3 flex-wrap flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-lg font-bold focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                  placeholder="Building name"
                  autoFocus
                />
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition"
                  placeholder="Location"
                />
                {formError && <span className="text-xs text-red-500">{formError}</span>}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                >
                  <Check size={13} />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBuilding(false);
                    setEditName(building.name);
                    setEditLocation(building.location);
                    setFormError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="min-w-0">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {building.name}
                </h1>
                <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5">{building.location}</p>
              </div>
            )}
          </div>
          {!editingBuilding && (
            <button
              onClick={() => setEditingBuilding(true)}
              className="p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition shrink-0"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Apartments section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
            Apartments
          </h2>
          <button
            onClick={() => {
              setCreateAptForm(EMPTY_CREATE_APT);
              setAptFormError(null);
              setShowAddApt(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-xs transition"
          >
            <Plus size={13} />
            Add Apartment
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Add apartment form */}
        {showAddApt && (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Apartment</h3>
              <button
                onClick={() => setShowAddApt(false)}
                className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleAddApartment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Number</label>
                <input
                  type="text"
                  value={createAptForm.number}
                  onChange={(e) => setCreateAptForm((f) => ({ ...f, number: e.target.value }))}
                  placeholder="e.g. A-101"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Area (m²)</label>
                <input
                  type="number"
                  min="1"
                  value={createAptForm.area}
                  onChange={(e) => setCreateAptForm((f) => ({ ...f, area: e.target.value }))}
                  placeholder="e.g. 65"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={createAptForm.isShared}
                  onChange={(e) => setCreateAptForm((f) => ({ ...f, isShared: e.target.checked }))}
                  className="w-4 h-4 accent-yellow-400"
                />
                <label htmlFor="isShared" className="text-sm text-slate-700 dark:text-white/70 font-medium cursor-pointer">
                  Shared building area (lobby, elevator, corridor…)
                </label>
              </div>
              {aptFormError && (
                <p className="sm:col-span-2 text-xs text-red-500 dark:text-red-400">{aptFormError}</p>
              )}
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={aptSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                >
                  <Check size={14} />
                  {aptSaving ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddApt(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {apartments.length === 0 ? (
          <div className="text-center py-14 text-slate-400 dark:text-white/30 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
            <p className="font-semibold">No apartments yet.</p>
            <p className="text-sm mt-1">Add the first apartment to this building.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                    <th className="py-3 px-6 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Number</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Area</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Owner</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Rooms</th>
                    <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {apartments.map((apt) => {
                    const owner = apt.owner ?? residents.find((r) => r.id === apt.ownerId);
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">
                          <div className="flex items-center gap-2">
                            Apt {apt.number}
                            {apt.isShared && (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 text-xs font-bold">
                                Shared
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{apt.area} m²</td>
                        <td className="py-3.5 px-4">
                          {assignOwnerId === apt.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedOwnerId}
                                onChange={(e) => setSelectedOwnerId(e.target.value)}
                                className="rounded-lg bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-400 transition"
                              >
                                <option value="">Select resident…</option>
                                {residents.map((r) => (
                                  <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignOwner(apt.id)}
                                disabled={!selectedOwnerId}
                                className="p-1.5 rounded-lg bg-yellow-400 text-slate-900 text-xs font-bold hover:bg-yellow-300 transition disabled:opacity-50"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => { setAssignOwnerId(null); setSelectedOwnerId(''); }}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : owner && owner.name ? (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 dark:text-white/80 text-sm">{owner.name}</span>
                              <button
                                onClick={() => { setAssignOwnerId(apt.id); setSelectedOwnerId(''); }}
                                className="text-slate-400 dark:text-white/30 hover:text-yellow-500 dark:hover:text-yellow-400 transition"
                              >
                                <Pencil size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30 text-xs font-semibold">
                                No owner
                              </span>
                              <button
                                onClick={() => { setAssignOwnerId(apt.id); setSelectedOwnerId(''); }}
                                className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline font-semibold"
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">
                          {apt.rooms?.length ?? '—'}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {deleteAptId === apt.id ? (
                              <>
                                <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Confirm delete?</span>
                                <button
                                  onClick={() => handleDeleteApartment(apt.id)}
                                  className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteAptId(null)}
                                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/admin/apartments/${apt.id}`)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold hover:bg-yellow-400/20 transition"
                                >
                                  Manage Rooms
                                  <ChevronRight size={12} />
                                </button>
                                <button
                                  onClick={() => setDeleteAptId(apt.id)}
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
    </div>
  );
}
