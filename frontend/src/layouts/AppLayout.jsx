import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {user ? <NavLink className="rounded-full px-4 py-2 text-sm font-semibold text-slate transition hover:bg-slate-100" to="/account">My Account</NavLink> : null}
            {user?.role === 'citizen' ? <NavLink className="rounded-full px-4 py-2 text-sm font-semibold text-slate transition hover:bg-slate-100" to="/account/apply-volunteer">Apply Volunteer</NavLink> : null}
            {user?.role === 'citizen' ? <NavLink className="rounded-full px-4 py-2 text-sm font-semibold text-slate transition hover:bg-slate-100" to="/account/apply-ngo">Apply NGO</NavLink> : null}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-ink">{user.name}</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate">{user.role}</div>
                </div>
                <button type="button" onClick={handleLogout} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-white">
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
