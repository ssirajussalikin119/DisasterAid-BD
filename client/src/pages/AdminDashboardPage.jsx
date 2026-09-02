import AdminLayout from '../layouts/AdminLayout';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import StatCard from '../components/ui/StatCard';

const summaries = [
  ['--', 'Total users', 'Waiting for user management'],
  ['--', 'Pending applications', 'Waiting for review workflow'],
  ['--', 'Pending reports', 'Waiting for moderation workflow'],
  ['--', 'Active incidents', 'Waiting for incident management'],
];

function EmptyPanel({ title, description }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Not connected</span>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-mist px-5 py-8 text-center">
        <p className="text-sm font-semibold text-slate-500">{description}</p>
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Overview</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Good day, Admin.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">A calm view of the DisasterAid BD response platform. Operational data will appear here as each admin module is connected.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton to="/admin/dashboard">Dashboard</PrimaryButton>
            <SecondaryButton to="/account" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Account</SecondaryButton>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map(([value, label, description]) => <StatCard key={label} value={value} label={label} description={description} />)}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <EmptyPanel title="Recent reports" description="Report moderation and recent activity will appear here." />
            <EmptyPanel title="Pending applications" description="Volunteer and NGO application review will appear here." />
          </div>
          <div className="space-y-6">
            <EmptyPanel title="Active incidents" description="Incident monitoring will appear here." />
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">Quick actions</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Admin workflows will be enabled here as their modules are delivered.</p>
              <div className="mt-6 grid gap-3">
                <SecondaryButton type="button" disabled className="justify-start border-slate-200 bg-mist text-slate-400">Review applications <span className="ml-auto text-xs">Coming soon</span></SecondaryButton>
                <SecondaryButton type="button" disabled className="justify-start border-slate-200 bg-mist text-slate-400">Verify reports <span className="ml-auto text-xs">Coming soon</span></SecondaryButton>
                <SecondaryButton type="button" disabled className="justify-start border-slate-200 bg-mist text-slate-400">Manage resources <span className="ml-auto text-xs">Coming soon</span></SecondaryButton>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}