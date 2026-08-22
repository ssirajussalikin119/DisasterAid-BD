export default function StatCard({ value, label, description, compact = false }) {
  return (
    <article className={`rounded-[1.75rem] border border-slate-200 bg-white ${compact ? 'p-5' : 'p-6'} shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]`}>
      <p className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.2rem]">{value}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
    </article>
  );
}
