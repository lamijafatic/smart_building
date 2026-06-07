import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Trash2, X, Check, ChevronRight } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminBuilding, CreateBuildingPayload } from '../../api/admin';

interface CreateFormState {
  name: string;
  location: string;
}

const EMPTY_CREATE: CreateFormState = { name: '', location: '' };

const inputClass =
  'w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5';

export function AdminOverviewPage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<AdminBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    try {
      const data = await adminApi.buildings.list();
      setBuildings(data);
    } catch {
      setError('Failed to load buildings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setCreateForm(EMPTY_CREATE);
    setFormError(null);
    setShowCreate(true);
  }

  function closeCreate() {
    setShowCreate(false);
    setFormError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.location.trim()) {
      setFormError('Name and location are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateBuildingPayload = {
        name: createForm.name.trim(),
        location: createForm.location.trim(),
      };
      const created = await adminApi.buildings.create(payload);
      setBuildings((prev) => [...prev, created]);
      closeCreate();
    } catch {
      setFormError('Failed to create building.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.buildings.remove(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError('Failed to delete building.');
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-white/[0.06] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Buildings
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            {buildings.length} building{buildings.length !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition"
        >
          <Plus size={16} />
          New Building
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">New Building</h2>
            <button
              onClick={closeCreate}
              className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Tower A"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. 123 Main St"
                className={inputClass}
              />
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
                {saving ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={closeCreate}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buildings list */}
      {buildings.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-white/30">
          <Building2 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No buildings yet.</p>
          <p className="text-sm mt-1">Create your first building to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                  <th className="py-3 px-6 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">
                    Location
                  </th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">
                    Apartments
                  </th>
                  <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {buildings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">
                      {b.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{b.location}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">
                      {b.apartments?.length ?? 0}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {deleteId === b.id ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className="text-xs text-red-500 dark:text-red-400 font-semibold">
                              Are you sure? This deletes all apartments, rooms and devices.
                            </span>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/admin/buildings/${b.id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold hover:bg-yellow-400/20 transition"
                            >
                              Manage
                              <ChevronRight size={12} />
                            </button>
                            <button
                              onClick={() => setDeleteId(b.id)}
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
  );
}
