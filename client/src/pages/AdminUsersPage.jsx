import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Badge from '../components/ui/Badge';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import {
  activateAdminUser,
  getAdminUser,
  getAdminUsers,
  suspendAdminUser,
  updateAdminUser,
} from '../services/adminUserService';

const blankEdit = { name: '', email: '', phone: '' };

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
}

function statusClass(status) {
  return status === 'active' ? 'border-forest/30 bg-forest/10 text-forest' : 'border-ember/30 bg-ember/10 text-ember';
}

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1, per_page: 20 });
  const [result, setResult] = useState({ rows: [], total: 0, page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(blankEdit);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminUsers(filters)
      .then((data) => {
        if (alive) {
          setResult(data.users);
          setError('');
        }
      })
      .catch((exception) => {
        if (alive) setError(exception?.response?.data?.message ?? 'Unable to load users.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [filters]);

  const updateFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value, page: 1 }));

  const openDetails = async (user) => {
    setNotice('');
    try {
      setSelected(await getAdminUser(user.id));
      setEditing(false);
      setEditForm({ name: user.name, email: user.email ?? '', phone: user.phone ?? '' });
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to load user details.');
    }
  };

  const refresh = () => setFilters((current) => ({ ...current }));

  const changeStatus = async (user) => {
    const action = user.status === 'active' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    try {
      const updated = user.status === 'active' ? await suspendAdminUser(user.id) : await activateAdminUser(user.id);
      setNotice(`User ${action}d successfully.`);
      setSelected((current) => current ? { ...current, user: updated } : current);
      refresh();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? `Unable to ${action} this user.`);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminUser(selected.user.id, editForm);
      setSelected((current) => ({ ...current, user: updated }));
      setEditing(false);
      setNotice('User profile updated successfully.');
      refresh();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to update this user.');
    } finally {
      setSaving(false);
    }
  };

  const users = result.rows ?? [];
  const totalPages = Math.max(1, Math.ceil((result.total ?? 0) / (result.per_page ?? 20)));

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Admin management</p><h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Users & accounts</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">Review registered accounts and manage access using the live database.</p></div><SecondaryButton to="/admin/dashboard" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Back to dashboard</SecondaryButton></div>
        <div className="mt-10 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"><div className="grid gap-5 md:grid-cols-[1fr_190px_190px]"><FormField label="Search users" value={filters.search} onChange={updateFilter('search')} placeholder="Name, email or phone" /><FormField as="select" label="Role" value={filters.role} onChange={updateFilter('role')}><option value="">All roles</option>{['citizen', 'volunteer', 'doctor', 'ngo', 'admin'].map((role) => <option key={role}>{role}</option>)}</FormField><FormField as="select" label="Status" value={filters.status} onChange={updateFilter('status')}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></FormField></div></div>
        {notice ? <div role="status" className="mt-5 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm font-semibold text-forest">{notice}</div> : null}
        {error ? <div role="alert" className="mt-5 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{error}</div> : null}
        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5"><div><h2 className="font-display text-xl font-bold text-ink">Registered users</h2><p className="mt-1 text-sm text-slate-600">{result.total ?? 0} accounts found</p></div></div>{loading ? <p className="px-6 py-12 text-sm text-slate-600">Loading users...</p> : users.length === 0 ? <div className="px-6 py-16 text-center"><h3 className="font-display text-xl font-bold text-ink">No users found</h3><p className="mt-2 text-sm text-slate-600">Try adjusting the search or filters.</p></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Registered</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-ink">{user.name}</td><td className="px-6 py-4 text-slate-600"><div>{user.phone}</div><div className="text-xs">{user.email || 'No email'}</div></td><td className="px-6 py-4"><Badge>{user.role}</Badge></td><td className="px-6 py-4"><Badge className={statusClass(user.status)}>{user.status}</Badge></td><td className="px-6 py-4 text-slate-600">{dateLabel(user.created_at)}</td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><SecondaryButton type="button" onClick={() => openDetails(user)} className="border-slate-300 bg-white px-4 py-2 text-ink hover:bg-slate-50">Details</SecondaryButton><button type="button" onClick={() => changeStatus(user)} className="rounded-full px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50">{user.status === 'active' ? 'Suspend' : 'Activate'}</button></div></td></tr>)}</tbody></table></div>}<div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-600"><span>Page {filters.page} of {totalPages}</span><div className="flex gap-2"><SecondaryButton type="button" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="border-slate-300 bg-white px-4 py-2 text-ink hover:bg-slate-50">Previous</SecondaryButton><SecondaryButton type="button" disabled={filters.page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="border-slate-300 bg-white px-4 py-2 text-ink hover:bg-slate-50">Next</SecondaryButton></div></div></section>
      </div>
      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" role="dialog" aria-modal="true" aria-label="User details"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Account details</p><h2 className="mt-2 font-display text-2xl font-bold text-ink">{selected.user.name}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-2xl leading-none text-slate-500 hover:bg-mist" aria-label="Close details">×</button></div>{editing ? <form className="mt-8 grid gap-5" onSubmit={saveProfile}><FormField label="Name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required /><FormField label="Email" type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} required /><FormField label="Phone" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} required /><div className="flex gap-3"><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditing(false)} className="border-slate-300 bg-white text-ink hover:bg-slate-50">Cancel</SecondaryButton></div></form> : <><dl className="mt-8 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-1 font-semibold text-ink">{selected.user.role}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-1"><Badge className={statusClass(selected.user.status)}>{selected.user.status}</Badge></dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</dt><dd className="mt-1 text-slate-700">{selected.user.phone}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered</dt><dd className="mt-1 text-slate-700">{dateLabel(selected.user.created_at)}</dd></div></dl><div className="mt-8 grid gap-3 sm:grid-cols-4">{[['Reports', selected.user.report_count], ['Applications', selected.user.application_count], ['Volunteer profile', selected.user.volunteer_profile_count], ['Assignments', selected.user.assignment_count]].map(([label, value]) => <div key={label} className="rounded-xl bg-mist p-4"><p className="font-display text-2xl font-bold text-ink">{value}</p><p className="mt-1 text-xs font-semibold text-slate-600">{label}</p></div>)}</div><div className="mt-8"><h3 className="font-display text-lg font-bold text-ink">Recent activity</h3>{selected.activity.length === 0 ? <p className="mt-3 text-sm text-slate-600">No related activity recorded.</p> : <div className="mt-3 divide-y divide-slate-100">{selected.activity.map((item) => <div key={`${item.activity_type}-${item.activity_id}`} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-semibold text-ink">{item.label}</span><span className="text-slate-500">{item.activity_type} · {dateLabel(item.created_at)}</span></div>)}</div>}</div><div className="mt-8 flex flex-wrap gap-3"><PrimaryButton type="button" onClick={() => setEditing(true)}>Edit profile</PrimaryButton><SecondaryButton type="button" onClick={() => changeStatus(selected.user)} className="border-slate-300 bg-white text-ink hover:bg-slate-50">{selected.user.status === 'active' ? 'Suspend account' : 'Activate account'}</SecondaryButton></div></>}</div></div> : null}
    </AdminLayout>
  );
}