import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Container from '../common/Container';
import { navLinks } from '../../data/homepage';
import PrimaryButton from '../ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, bootstrapping, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200/80 bg-white/85 px-4 py-3 text-ink shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-700 lg:flex-nowrap lg:justify-center xl:gap-x-4">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="whitespace-nowrap transition hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap lg:shrink-0">
            <PrimaryButton
              to={isAuthenticated ? '/incidents/new' : '/login'}
              state={isAuthenticated ? undefined : { from: '/incidents/new' }}
              className="whitespace-nowrap bg-[#fbbf24] text-ink shadow-[0_14px_30px_rgba(251,191,36,0.22)] hover:bg-amber-300"
            >
              Emergency Report
            </PrimaryButton>
            {!bootstrapping && user ? (
              <>
                <Link to="/account" className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-ink">{user.name}</Link>
                <button type="button" onClick={handleLogout} className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-ink">Logout</button>
              </>
            ) : !bootstrapping ? (
              <>
                <Link to="/login" className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-ink">Login</Link>
                <Link to="/register" className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-ink">Register</Link>
              </>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  );
}
