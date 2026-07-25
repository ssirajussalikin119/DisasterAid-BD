export default function Logo({ dark = false, large = false }) {
  const iconSize = large ? 'h-11 w-11' : 'h-9 w-9';
  const textSize = large ? 'text-xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5`}>
      <div className={`flex ${iconSize} items-center justify-center rounded-lg ${dark ? 'bg-white' : 'bg-ink'}`}>
        <svg viewBox="0 0 24 24" className={`h-[60%] w-[60%] ${dark ? 'text-ink' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className={`font-display ${textSize} font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
        DisasterAid<span className="text-signal">BD</span>
      </div>
    </div>
  );
}
