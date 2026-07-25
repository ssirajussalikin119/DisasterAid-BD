import { Link } from 'react-router-dom';
import Logo from './Logo';
import Container from '../common/Container';
import { navLinks } from '../../data/homepage';
import PrimaryButton from '../ui/PrimaryButton';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white/85 px-5 py-4 text-ink shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-slate-700 lg:justify-center">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton href="#get-involved" className="bg-[#fbbf24] text-ink shadow-[0_14px_30px_rgba(251,191,36,0.22)] hover:bg-amber-300">
              Emergency Report
            </PrimaryButton>
            <Link to="/login" className="text-sm font-semibold text-slate-700 transition hover:text-ink">Login</Link>
            <Link to="/register" className="text-sm font-semibold text-slate-700 transition hover:text-ink">Register</Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
