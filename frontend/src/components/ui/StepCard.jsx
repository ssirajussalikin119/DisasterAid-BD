function iconFor(type) {
  switch (type) {
    case 'report':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l9 4.8v8.4L12 21l-9-4.8V7.8L12 3z" />
          <path d="M12 8v8" />
          <path d="M8.5 12h7" />
        </svg>
      );
    case 'verify':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 5-3.1 8.6-7 10-3.9-1.4-7-5-7-10V6l7-3z" />
          <path d="M9.5 12l1.8 1.8L15 10.2" />
        </svg>
      );
    case 'volunteer':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M7.5 7.2h9" />
          <path d="M5.8 14.2a4.2 4.2 0 108.4 0V8.7" />
          <path d="M14.2 14.2a4.2 4.2 0 108.4 0V8.7" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11.5l8-7 8 7" />
          <path d="M6 10.5V20h12v-9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
  }
}

export default function StepCard({ step, title, description, icon }) {
  return (
    <article className="relative flex flex-col items-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)]">
        {iconFor(icon)}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-500">{step}</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-ink">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
