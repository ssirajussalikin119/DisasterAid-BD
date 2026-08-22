import Badge from './Badge';

export default function ImpactCard({ title, description, items }) {
  return (
    <div className="grid gap-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:grid-cols-[1fr_0.95fr] lg:items-center lg:p-14">
      <div className="flex items-center justify-center">
        <div className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[420px] sm:w-[420px]">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(#fbbf24_0_76%,#111827_76%_84%,#d1d5db_84%_91%,#f4f4f5_91%_100%)]" />
          <div className="absolute inset-[17%] rounded-full bg-white" />
          <div className="absolute inset-[30%] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]" />
          <div className="relative z-10 text-center">
            <div className="text-5xl font-black text-ink">86%</div>
            <div className="mt-2 text-base text-slate-600">Program services</div>
          </div>
        </div>
      </div>
      <div>
        <Badge>Our impact</Badge>
        <h3 className="mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h3>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{description}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="font-display text-2xl font-bold text-ink">{item.value}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
