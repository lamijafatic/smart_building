import { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type {
  AdminUser,
  AdminApartment,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../api/admin';
import { useAuth } from '../../context/AuthContext';

interface CreateFormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface EditFormState {
  name: string;
  email: string;
  role: string;
  password: string;
}

const EMPTY_CREATE: CreateFormState = { name: '', email: '', password: '', role: 'RESIDENT' };
const EMPTY_EDIT: EditFormState = { name: '', email: '', role: 'RESIDENT', password: '' };

const inputClass =
  'w-full rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400/60 transition';

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1.5';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 'create' | number (editing user id) | null
  const [panelMode, setPanelMode] = useState<'create' | number | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // After creating a resident: offer apartment assignment
  const [newResidentId, setNewResidentId] = useState<number | null>(null);
  const [assignAptId, setAssignAptId] = useState<string>('');
  const [assignSaving, setAssignSaving] = useState(false);

  // Apartment assignment within edit panel
  const [editAssignAptId, setEditAssignAptId] = useState<string>('');
  const [editAssignSaving, setEditAssignSaving] = useState(false);

  async function load() {
    try {
      const [usersData, apts] = await Promise.all([
        adminApi.users.list(),
        adminApi.apartments.list(),
      ]);
      setUsers(usersData);
      setApartments(apts);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function getCurrentApartment(userId: number): AdminApartment | undefined {
    return apartments.find((a) => a.ownerId === userId);
  }

  function openCreate() {
    setCreateForm(EMPTY_CREATE);
    setFormError(null);
    setPanelMode('create');
    setNewResidentId(null);
    setAssignAptId('');
  }

  function openEdit(u: AdminUser) {
    setEditForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setFormError(null);
    setPanelMode(u.id);
    // Pre-select current apartment if any
    const currentApt = getCurrentApartment(u.id);
    setEditAssignAptId(currentApt ? String(currentApt.id) : '');
  }

  function closePanel() {
    setPanelMode(null);
    setFormError(null);
    setNewResidentId(null);
    setAssignAptId('');
    setEditAssignAptId('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password || !createForm.role) {
      setFormError('All fields are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateUserPayload = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      };
      const created = await adminApi.users.create(payload);
      setUsers((prev) => [...prev, created]);
      if (createForm.role === 'RESIDENT') {
        setNewResidentId(created.id);
        setAssignAptId('');
      } else {
        closePanel();
      }
    } catch {
      setFormError('Failed to create user. Email may already be in use.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignApartment() {
    if (!assignAptId || !newResidentId) return;
    setAssignSaving(true);
    try {
      const updated = await adminApi.apartments.update(Number(assignAptId), { ownerId: newResidentId });
      setApartments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      closePanel();
    } catch {
      setFormError('Failed to assign apartment. User was created successfully.');
    } finally {
      setAssignSaving(false);
    }
  }

  async function handleEditAssignApartment() {
    if (typeof panelMode !== 'number') return;
    setEditAssignSaving(true);
    setFormError(null);
    try {
      // Clear the old apartment assignment if any
      const previousApt = getCurrentApartment(panelMode);
      if (previousApt && String(previousApt.id) !== editAssignAptId) {
        await adminApi.apartments.update(previousApt.id, { ownerId: null });
      }
      // Assign to new apartment if selected
      if (editAssignAptId) {
        const updated = await adminApi.apartments.update(Number(editAssignAptId), { ownerId: panelMode });
        setApartments((prev) =>
          prev.map((a) => {
            if (a.id === updated.id) return updated;
            if (previousApt && a.id === previousApt.id) return { ...a, ownerId: null };
            return a;
          })
        );
      } else if (previousApt) {
        setApartments((prev) =>
          prev.map((a) => (a.id === previousApt.id ? { ...a, ownerId: null } : a))
        );
      }
      closePanel();
    } catch {
      setFormError('Failed to update apartment assignment.');
    } finally {
      setEditAssignSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (typeof panelMode !== 'number') return;
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.role) {
      setFormError('Name, email, and role are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: UpdateUserPayload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      const updated = await adminApi.users.update(panelMode, payload);
      setUsers((prev) => prev.map((u) => (u.id === panelMode ? updated : u)));

      // Handle apartment assignment change
      const previousApt = getCurrentApartment(panelMode);
      const prevAptId = previousApt ? String(previousApt.id) : '';
      if (editAssignAptId !== prevAptId) {
        await handleEditAssignApartment();
        return; // handleEditAssignApartment calls closePanel
      }

      closePanel();
    } catch {
      setFormError('Failed to update user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (currentUser && currentUser.id === id) {
      setError('You cannot delete your own account.');
      setDeleteId(null);
      return;
    }
    try {
      await adminApi.users.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Failed to delete user.');
    } finally {
      setDeleteId(null);
    }
  }

  function roleBadge(role: string) {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20">
          ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
        RESIDENT
      </span>
    );
  }

  function connectedBadge(hasConnected: boolean) {
    return hasConnected ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        Connected
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30">
        Pending
      </span>
    );
  }

  function aptLabel(userId: number): string {
    const apt = apartments.find((a) => a.ownerId === userId);
    if (!apt) return '';
    const bldName = apt.building?.name ?? '';
    return `Apt ${apt.number}${bldName ? ` — ${bldName}` : ''}`;
  }

  function aptSelectLabel(a: AdminApartment): string {
    const bldName = a.building?.name ?? '';
    const ownerInfo = a.ownerId && a.owner ? ` (owner: ${a.owner.name})` : '';
    return `Apt ${a.number}${bldName ? ` — ${bldName}` : ''}${ownerInfo}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            {users.length} user{users.length !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition"
        >
          <Plus size={16} />
          New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Create panel */}
      {panelMode === 'create' && (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">New User</h2>
            <button onClick={closePanel} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition">
              <X size={16} />
            </button>
          </div>

          {newResidentId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check size={15} />
                User created! Assign them to an apartment (optional).
              </div>
              <div>
                <label className={labelClass}>Apartment</label>
                <select
                  value={assignAptId}
                  onChange={(e) => setAssignAptId(e.target.value)}
                  className={inputClass}
                  autoFocus
                >
                  <option value="">— Skip, assign later —</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {aptSelectLabel(a)}
                    </option>
                  ))}
                </select>
                {apartments.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">
                    No apartments exist yet. Create a building and apartments first.
                  </p>
                )}
              </div>
              {formError && <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleAssignApartment}
                  disabled={!assignAptId || assignSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
                >
                  <Check size={14} />
                  {assignSaving ? 'Assigning…' : 'Assign & Close'}
                </button>
                <button
                  onClick={closePanel}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  Skip & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                >
                  <option value="RESIDENT">Resident</option>
                  <option value="ADMIN">Admin</option>
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
                  {saving ? 'Creating…' : 'Create'}
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
          )}
        </div>
      )}

      {/* Edit panel */}
      {typeof panelMode === 'number' && (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit User</h2>
            <button onClick={closePanel} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleEdit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                >
                  <option value="RESIDENT">Resident</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep current"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Apartment assignment */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              <label className={labelClass}>Assigned Apartment</label>
              <select
                value={editAssignAptId}
                onChange={(e) => setEditAssignAptId(e.target.value)}
                className={inputClass}
              >
                <option value="">— No apartment —</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {aptSelectLabel(a)}
                  </option>
                ))}
              </select>
              {apartments.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">
                  No apartments exist yet. Create a building and apartments first.
                </p>
              )}
            </div>

            {formError && (
              <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || editAssignSaving}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl text-sm transition disabled:opacity-60"
              >
                <Check size={14} />
                {saving || editAssignSaving ? 'Saving…' : 'Save'}
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
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-white/30">
          <Users size={36} className="mx-auto mb-3 opacity-40" />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                  <th className="py-3 px-6 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Name</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Email</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Role</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Apartment</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Status</th>
                  <th className="py-3 px-6 text-right text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const label = aptLabel(u.id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-white/90">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-1.5 py-0.5 rounded-md">
                            you
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">{u.email}</td>
                      <td className="py-3.5 px-4">{roleBadge(u.role)}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-white/50">
                        {label ? (
                          <span className="text-sm">{label}</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30 text-xs font-semibold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{connectedBadge(u.hasConnected)}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {deleteId === u.id ? (
                            <>
                              <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Confirm?</span>
                              <button
                                onClick={() => handleDelete(u.id)}
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
                                onClick={() => openEdit(u)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (isSelf) {
                                    setError('You cannot delete your own account.');
                                    return;
                                  }
                                  setDeleteId(u.id);
                                }}
                                disabled={isSelf}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
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
