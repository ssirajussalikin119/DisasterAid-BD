import Badge from './Badge';

export default function NewsCard({ category, title, excerpt, date, image }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.1)]">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="space-y-4 p-6">
        <Badge className="bg-amber-100 text-amber-900">{category}</Badge>
        <h3 className="font-display text-[1.3rem] font-bold leading-8 text-ink">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{excerpt}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{date}</p>
      </div>
    </article>
  );
}
