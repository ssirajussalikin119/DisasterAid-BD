import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'grid' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Applications', to: '/admin/applications', icon: 'applications' },
  { label: 'Reports', to: '/admin/reports', icon: 'reports' },
  { label: 'Incidents', icon: 'incidents' },
  { label: 'Volunteers', icon: 'volunteers' },
  { label: 'Assignments', icon: 'assignments' },
  { label: 'Relief & Resources', icon: 'relief' },
  { label: 'Verification', icon: 'verification' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Audit Logs', icon: 'audit' },
];

function NavIcon({ type }) {
  const paths = {
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M16 11a3 3 0 1 0 0-6M18 15a3.5 3.5 0 0 1 2 3.2V20" /></>,
    applications: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 12h6M9 16h4" /></>,
    reports: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    incidents: <><path d="M12 3 4 7v5c0 4.5 3.1 7.7 8 9 4.9-1.3 8-4.5 8-9V7z" /><path d="M12 8v4M12 15h.01" /></>,
    volunteers: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0M4 12h4M16 12h4" /></>,
    assignments: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="m4 6 .8.8L6.5 5M4 12l.8.8 1.7-1.8M4 18l.8.8 1.7-1.8" /></>,
    relief: <><path d="M4 10h16M6 10V7l6-3 6 3v3M6 10v9M18 10v9M4 19h16" /></>,
    verification: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    analytics: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
    audit: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" /></>,
  };

  return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2"><Link to="/"><Logo /></Link><button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-mist lg:hidden" aria-label="Close admin navigation">×</button></div>
        <div className="mt-10 px-3"><p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Admin workspace</p><p className="mt-2 text-sm font-semibold text-ink">Operations control panel</p></div>
        <nav className="mt-7 flex-1 space-y-1 overflow-y-auto">
          {navigation.map((item) => item.to ? <NavLink key={item.label} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-mist hover:text-ink'}`}><NavIcon type={item.icon} />{item.label}</NavLink> : <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-400" title="Available in a future admin module"><span className="flex items-center gap-3"><NavIcon type={item.icon} />{item.label}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Soon</span></div>)}
        </nav>
        <div className="border-t border-slate-100 pt-4"><Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-mist hover:text-ink">← <span>Back to platform</span></Link><button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700">↪ <span>Log out</span></button></div>
      </aside>
      {sidebarOpen ? <button type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-ink/20 lg:hidden" /> : null}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-8"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-mist lg:hidden" aria-label="Open admin navigation"><span className="text-xl">☰</span></button><div className="hidden lg:block"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">DisasterAid BD</p><p className="mt-1 font-display text-lg font-bold text-ink">Admin Control Panel</p></div><div className="ml-auto flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-ink">{user?.name}</p><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Administrator</p></div><Link to="/account" className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-display font-bold text-sky-700">{user?.name?.charAt(0)?.toUpperCase() ?? 'A'}</Link></div></div></header>
        <main className="px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}