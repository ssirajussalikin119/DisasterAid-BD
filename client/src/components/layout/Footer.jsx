import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
              Bangladesh Emergency Relief &amp; Incident Dispatch Console. Built for real-time triage during severe flood, cyclone, and disaster events.
            </p>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-white/40">Emergency Hotlines</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-white/80">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.2 3.5 5.5 4.8c-.8.4-1.2 1.3-1 2.1 1.6 6.5 6.6 11.5 13.1 13.1.8.2 1.7-.2 2.1-1l1.3-2.7-4.1-2.1-1.5 2c-2.6-1.1-4.7-3.2-5.8-5.8l2-1.5-2.1-4.1Z" />
                </svg>
                <span className="font-mono">999</span>
                <span className="text-white/60">&mdash; National Emergency</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/80">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.2 3.5 5.5 4.8c-.8.4-1.2 1.3-1 2.1 1.6 6.5 6.6 11.5 13.1 13.1.8.2 1.7-.2 2.1-1l1.3-2.7-4.1-2.1-1.5 2c-2.6-1.1-4.7-3.2-5.8-5.8l2-1.5-2.1-4.1Z" />
                </svg>
                <span className="font-mono">1090</span>
                <span className="text-white/60">&mdash; Disaster Alert Line</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/80">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.2 3.5 5.5 4.8c-.8.4-1.2 1.3-1 2.1 1.6 6.5 6.6 11.5 13.1 13.1.8.2 1.7-.2 2.1-1l1.3-2.7-4.1-2.1-1.5 2c-2.6-1.1-4.7-3.2-5.8-5.8l2-1.5-2.1-4.1Z" />
                </svg>
                <span className="font-mono">16263</span>
                <span className="text-white/60">&mdash; Health Helpline</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-white/40">Quick Navigation</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li><a href="#" className="transition hover:text-white">About Platform</a></li>
              <li><a href="#safety-knowledge-hub" className="transition hover:text-white">Active Disasters</a></li>
              <li><a href="#" className="transition hover:text-white">Incident Map</a></li>
              <li><a href="#safety-knowledge-hub" className="transition hover:text-white">Safety Knowledge Hub</a></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-white/40">Governance &amp; Code</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li><a href="#" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="transition hover:text-white">GitHub Repository</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>&copy; 2026 DisasterAid BD. Emergency Public Safety Console.</p>
          <p>Built for Civic Resilience in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
