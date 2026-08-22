import Container from '../common/Container';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

const heroStats = [
  {
    value: '602,500+',
    label: 'people assisted',
    description: 'through learning and response support',
    icon: 'cap',
  },
  {
    value: '2.5 million',
    label: 'relief services',
    description: 'supported across Bangladesh',
    icon: 'water',
  },
  {
    value: '723,300+',
    label: 'verified responses',
    description: 'tracked through the platform',
    icon: 'health',
  },
  {
    value: '330,000+',
    label: 'households reached',
    description: 'with coordinated emergency aid',
    icon: 'shelter',
  },
];

function HeroIcon({ type }) {
  const common = 'h-11 w-11 text-black';

  switch (type) {
    case 'cap':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 10.5L12 6l9.5 4.5L12 15 2.5 10.5z" />
          <path d="M6 12.1V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.9" />
          <path d="M2.5 10.5L12 15l9.5-4.5" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v4" />
          <path d="M8.5 7.5h7" />
          <path d="M10 7.5v6.3c0 .8-.6 1.4-1.3 1.8A3.7 3.7 0 0 0 7 19.2V21" />
          <path d="M14 7.5v8.5c0 1.8-1.4 3.2-3.2 3.2H9" />
          <path d="M6.5 21a1.5 1.5 0 0 1 0-3c.8 0 1.5.7 1.5 1.5S7.3 21 6.5 21z" />
        </svg>
      );
    case 'health':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M7 4.5a3.5 3.5 0 0 0 0 7h1.5" />
          <path d="M17 4.5a3.5 3.5 0 0 1 0 7h-1.5" />
          <path d="M9 11.5c1.3-1.4 1.9-2 3-2s1.7.6 3 2" />
          <path d="M9 18.5c1.3 1.4 1.9 2 3 2s1.7-.6 3-2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" />
          <path d="M12 8v8" />
          <path d="M12 16l-3-2" />
          <path d="M7.5 18.5A4.5 4.5 0 1 1 7.5 9" />
        </svg>
      );
  }
}

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-white text-ink">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(250,204,21,0.14)_0%,rgba(255,255,255,0)_100%)]" />
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl">
          <div className="mb-5 flex items-start gap-4">
            <span className="mt-1 h-16 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.9rem] xl:text-[4.25rem] xl:leading-[1.02]">
                We help people survive, recover and rebuild their lives
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700 sm:text-xl">
                DisasterAid BD helps citizens report disasters, request relief, and follow verified emergency response updates through one professional humanitarian platform for Bangladesh.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href="#get-involved" className="bg-ink text-white hover:bg-slate-800">Start Now</PrimaryButton>
            <SecondaryButton href="#latest-headlines" className="border-slate-300 bg-white/80 text-ink hover:bg-slate-50">View Updates</SecondaryButton>
          </div>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat) => (
            <article key={stat.label} className="text-left">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#fbbf24] shadow-[0_18px_45px_rgba(251,191,36,0.16)] sm:h-44 sm:w-44">
                <HeroIcon type={stat.icon} />
              </div>
              <div className="mt-6 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{stat.value}</div>
              <p className="mt-2 max-w-56 text-base leading-7 text-slate-700">{stat.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
