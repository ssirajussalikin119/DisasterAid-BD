export default function SectionTitle({ eyebrow, title, description, align = 'left', className = '' }) {
  return (
    <div className={`max-w-4xl ${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow ? (
        <div className={`mb-5 flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-14 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
          <p className="text-2xl font-bold tracking-tight text-ink sm:text-4xl">{eyebrow}</p>
        </div>
      ) : null}
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[3rem]">{title}</h2>
      {description ? <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}
