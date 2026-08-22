import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start rounded-[2rem] border border-slate-200 bg-white p-10 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sea">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-4 text-slate">The requested route does not exist or is not available in this phase.</p>
      <Link to="/" className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Go home</Link>
    </div>
  );
}
