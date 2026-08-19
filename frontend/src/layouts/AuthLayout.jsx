import { Link } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import Navbar from '../components/layout/Navbar';

const highlights = [
  ['01', 'Report an incident', 'Submit geotagged reports with photos during floods, cyclones, or heatwaves.'],
  ['02', 'Request relief', 'Tell responders exactly what\u2019s needed \u2014 medicine, food, shelter, or clean water.'],
  ['03', 'Verified response', 'Every report is checked by a volunteer or admin before help is dispatched.'],
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-ink">
      <Navbar />
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center lg:min-h-[calc(100vh-9rem)]">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-panel lg:grid-cols-[1.08fr_0.92fr]">
          <aside className="relative hidden min-h-[680px] overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(251,191,36,0.26),transparent_28%),radial-gradient(circle_at_83%_78%,rgba(14,165,233,0.28),transparent_30%)]" />
            <div className="absolute -right-24 top-36 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -left-16 bottom-[-3.5rem] h-64 w-64 rounded-full border-[20px] border-amber-400/20" />
            <div className="relative my-auto max-w-xl py-12">
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">We help people survive, recover and rebuild.</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">A trusted digital response platform for communities across Bangladesh.</p>
            </div>
            <div className="relative grid gap-3">
              {highlights.map(([number, heading, description]) => (
                <div key={number} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <span className="font-display text-lg font-bold text-[#fbbf24]">{number}</span>
                  <p className="text-sm leading-5 text-slate-300"><span className="font-semibold text-white">{heading}.</span> {description}</p>
                </div>
              ))}
            </div>
          </aside>
          <main className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-[680px] lg:px-14">
            <div className="w-full max-w-md">
              <Link to="/" className="mb-10 inline-block lg:hidden"><Logo /></Link>
              <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">DisasterAid BD</p>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
              </div>
              {children}
            </div>
          </main>
        </div>
        </div>
      </div>
    </div>
  );
}
