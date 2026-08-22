import Badge from './Badge';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

export default function FeatureCard({ category, title, excerpt, image, linkLabel = 'Read more', showBadge = true }) {
  return (
    <article className="group overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="space-y-4 border-b-[6px] border-b-[#fbbf24] p-6 pb-7">
        {showBadge ? <Badge>{category}</Badge> : null}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-bold leading-8 text-ink">{title}</h3>
          <span className="mt-1 text-ink transition duration-300 group-hover:translate-x-0.5"><ArrowIcon /></span>
        </div>
        <p className="text-sm leading-6 text-slate-600">{excerpt}</p>
        <button type="button" className="inline-flex rounded-none bg-transparent px-0 py-0 text-sm font-semibold text-ink underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-slate-900">
          {linkLabel}
        </button>
      </div>
    </article>
  );
}
