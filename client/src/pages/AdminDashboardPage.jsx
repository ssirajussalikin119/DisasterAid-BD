import { Link } from 'react-router-dom';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sea">Role dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Admin Operations Center</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Centralized administrative command for moderating disaster reports, managing emergency incidents, reviewing volunteer applications, and analyzing relational data.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <PrimaryButton to="/report-incident-relations">
            Open Report-Incident SQL Matrix
          </PrimaryButton>
          <SecondaryButton to="/incidents" className="border-slate-300 bg-white text-ink hover:bg-slate-50">
            View All Incidents
          </SecondaryButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-ink">Relational Data & Joins</h3>
          <p className="mt-2 text-sm text-slate-600">
            Inspect raw SQL relationships across INNER, LEFT, RIGHT, and FULL OUTER joins connecting citizen reports, verified reporters, and response operations.
          </p>
          <Link
            to="/report-incident-relations"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700"
          >
            Access Relational Database Matrix →
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-ink">Incident Field Operations</h3>
          <p className="mt-2 text-sm text-slate-600">
            Create, verify, and assign volunteer teams to high-priority disaster zones across Bangladesh.
          </p>
          <Link
            to="/incidents"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700"
          >
            Manage Operations & Volunteers →
          </Link>
        </div>
      </div>
    </div>
  );
}

