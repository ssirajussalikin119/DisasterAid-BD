import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

function getInitials(name) {
  return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const roleStyles = {
  citizen: 'bg-sky-100 text-sky-700 border-sky-200',
  volunteer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  doctor: 'bg-purple-100 text-purple-700 border-purple-200',
  ngo: 'bg-amber-100 text-amber-700 border-amber-200',
  admin: 'bg-red-100 text-red-700 border-red-200',
};

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
};

function ActivityIcon({ type }) {
  const icons = {
    registered: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    volunteer: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" /><path d="M7.5 7.2h9" /><path d="M5.8 14.2a4.2 4.2 0 108.4 0V8.7" /><path d="M14.2 14.2a4.2 4.2 0 108.4 0V8.7" />
      </svg>
    ),
    ngo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    login: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
  };
  return icons[type] ?? icons.registered;
}

const activities = [
  { type: 'registered', label: 'Registered account', date: null },
  { type: 'profile', label: 'Updated profile', date: null },
  { type: 'volunteer', label: 'Applied as Volunteer', date: null },
  { type: 'ngo', label: 'Applied as NGO', date: null },
  { type: 'login', label: 'Logged in', date: null },
];

export default function AccountPage() {
  const { user, refreshUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    try {
      await updateProfile(form);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (exception) {
      setErrors(exception?.response?.data?.errors ?? {});
      setMessage(exception?.response?.data?.message ?? 'Unable to update profile.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-panel">
        <div className="relative bg-gradient-to-br from-ink via-slate-900 to-slate-800 px-8 pb-8 pt-10 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,191,36,0.15),transparent_40%),radial-gradient(circle_at_85%_70%,rgba(14,165,233,0.12),transparent_35%)]" />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-amber-400 to-amber-500 text-2xl font-bold text-white shadow-[0_12px_35px_rgba(251,191,36,0.3)] sm:h-24 sm:w-24 sm:text-3xl">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">My Account</p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold text-white sm:text-3xl">{user?.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-[0.16em] ${roleStyles[user?.role] ?? 'bg-sky-100 text-sky-700 border-sky-200'}`}>
                  {user?.role}
                </span>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-[0.16em] ${statusStyles[user?.role_status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {user?.role_status}
                </span>
                <span className="ml-1 text-xs text-slate-400">
                  Member since {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/50 px-8 py-4 sm:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate transition hover:border-ink hover:bg-ink hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
          <button
            type="button"
            onClick={() => navigate(user?.dashboard_route ?? '/account', { replace: true })}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate transition hover:border-ink hover:bg-ink hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Go to dashboard
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Personal Information</h2>
          </div>
          <form className="mt-6 flex-1 space-y-5" onSubmit={handleSubmit} noValidate>
            <Field label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name?.[0]} required />
            <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email?.[0]} required />
            <Field label="Phone Number" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} error={errors.phone?.[0]} required />
            {message ? (
              <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${message === 'Profile updated successfully.' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            ) : null}
            <PrimaryButton type="submit" loading={busy}>Save Changes</PrimaryButton>
          </form>
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-ink">Account Information</h2>
            </div>
            <dl className="mt-6 flex-1 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Role</dt>
                <dd className="ml-4 text-right font-semibold text-ink capitalize">{user?.role}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</dt>
                <dd className="ml-4 text-right">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.12em] ${statusStyles[user?.role_status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {user?.role_status}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Member Since</dt>
                <dd className="ml-4 text-right font-semibold text-ink">{formatDate(user?.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Last Login</dt>
                <dd className="ml-4 text-right font-medium text-slate-400">—</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Account ID</dt>
                <dd className="ml-4 text-right font-mono text-xs text-slate-400">#{user?.id}</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-ink">Security</h2>
            </div>
            <div className="mt-6 flex-1 space-y-3">
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-400 transition hover:border-slate-300"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M9 16l2 2 4-4" />
                </svg>
                <span className="flex-1">Change Password</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Soon</span>
              </button>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">Active Session</p>
                  <p className="text-xs text-slate-400">Current device</p>
                </div>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-white px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {loggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sea/10 text-sea">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Recent Activity</h2>
        </div>
        <div className="mt-6 space-y-1">
          {activities.map((item, index) => (
            <div key={item.type} className="flex items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-50">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                index < 2 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <ActivityIcon type={item.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${index < 2 ? 'text-ink' : 'text-slate-500'}`}>{item.label}</p>
                <p className="text-xs text-slate-400">{item.date ?? '—'}</p>
              </div>
              {index < 2 ? (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Account activity tracking coming soon</p>
      </section>

      {user?.role === 'citizen' ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/account/apply-volunteer"
            className="group flex flex-col items-start gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.1)] sm:p-10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.25)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" /><path d="M7.5 7.2h9" /><path d="M5.8 14.2a4.2 4.2 0 108.4 0V8.7" /><path d="M14.2 14.2a4.2 4.2 0 108.4 0V8.7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-ink group-hover:text-emerald-700">Apply as Volunteer</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Contribute directly by joining field operations, coordinating aid, and supporting affected communities on the ground.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 transition group-hover:bg-emerald-100">
              Apply now
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          <Link
            to="/account/apply-ngo"
            className="group flex flex-col items-start gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.1)] sm:p-10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_12px_30px_rgba(251,191,36,0.25)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-ink group-hover:text-amber-700">Apply as NGO</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Register your organisation to coordinate large-scale relief efforts, access funding, and deploy resources efficiently.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-700 transition group-hover:bg-amber-100">
              Apply now
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
