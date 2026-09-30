export default function AnalyticsCard({ title, question, badge, children, className = '' }) {
  return (
    <section className={`rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${className}`}>
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{question}</p>
          </div>
          {badge}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
