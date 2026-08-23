export default function VolunteerDashboardPage() {
  return <DashboardCard title="Volunteer Dashboard" description="Accessible only after admin approval upgrades the account from Citizen to Volunteer." />;
}

function DashboardCard({ title, description }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sea">Role dashboard</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-4 max-w-2xl text-slate">{description}</p>
    </div>
  );
}
