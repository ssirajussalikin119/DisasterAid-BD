import { useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/common/Container';

const incidents = [
  {
    id: 1,
    title: 'Severe Flooding in Sylhet',
    location: 'Sylhet Sadar, Sylhet',
    type: 'Flood',
    severity: 'Critical',
    status: 'Verified',
    reportedAt: '26 July 2026, 5:30 AM',
    peopleAffected: 420,
    description:
      'Several neighbourhoods are under water. Emergency food, clean water and temporary shelter are urgently required.',
  },
  {
    id: 2,
    title: 'River Erosion in Kurigram',
    location: 'Chilmari, Kurigram',
    type: 'River Erosion',
    severity: 'High',
    status: 'Pending',
    reportedAt: '26 July 2026, 4:15 AM',
    peopleAffected: 185,
    description:
      'Multiple families have been displaced after rapid river erosion damaged homes near the riverbank.',
  },
  {
    id: 3,
    title: 'Fire Incident at Local Market',
    location: 'Kotwali, Chattogram',
    type: 'Fire',
    severity: 'High',
    status: 'Responding',
    reportedAt: '25 July 2026, 11:40 PM',
    peopleAffected: 76,
    description:
      'A large fire affected several shops. Fire service teams are working at the scene and medical support is needed.',
  },
  {
    id: 4,
    title: 'Cyclone Shelter Support Needed',
    location: 'Kalapara, Patuakhali',
    type: 'Cyclone',
    severity: 'Medium',
    status: 'Verified',
    reportedAt: '25 July 2026, 8:20 PM',
    peopleAffected: 260,
    description:
      'Residents are moving to nearby shelters. Additional dry food, medicine and volunteer support are requested.',
  },
  {
    id: 5,
    title: 'Landslide Risk After Heavy Rain',
    location: 'Rangamati Sadar, Rangamati',
    type: 'Landslide',
    severity: 'Critical',
    status: 'Pending',
    reportedAt: '25 July 2026, 6:10 PM',
    peopleAffected: 132,
    description:
      'Continuous rainfall has increased landslide risk in several hillside communities. Evacuation support may be required.',
  },
  {
    id: 6,
    title: 'Heatwave Medical Assistance',
    location: 'Rajshahi City, Rajshahi',
    type: 'Heatwave',
    severity: 'Medium',
    status: 'Resolved',
    reportedAt: '24 July 2026, 2:45 PM',
    peopleAffected: 94,
    description:
      'Temporary medical booths and drinking-water stations were arranged for vulnerable residents.',
  },
];

const severityStyles = {
  Critical: 'bg-red-50 text-red-700 ring-red-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const statusStyles = {
  Verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  Responding: 'bg-sky-50 text-sky-700 ring-sky-200',
  Resolved: 'bg-slate-100 text-slate-700 ring-slate-200',
};

function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export default function IncidentListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const disasterTypes = ['All', ...new Set(incidents.map((item) => item.type))];
  const statuses = ['All', ...new Set(incidents.map((item) => item.status))];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        incident.title.toLowerCase().includes(searchValue) ||
        incident.location.toLowerCase().includes(searchValue) ||
        incident.description.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === 'All' || incident.type === typeFilter;

      const matchesStatus =
        statusFilter === 'All' || incident.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  const criticalCount = incidents.filter(
    (incident) => incident.severity === 'Critical',
  ).length;

  const verifiedCount = incidents.filter(
    (incident) => incident.status === 'Verified',
  ).length;

  const totalAffected = incidents.reduce(
    (total, incident) => total + incident.peopleAffected,
    0,
  );

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar />

      <main>
        <section className="border-b border-slate-200 bg-white py-14 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-10 w-1 rounded-full bg-amber-400" />
                <p className="font-display text-lg font-bold text-ink">
                  Active Incidents
                </p>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Verified disaster reports across Bangladesh.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate">
                Browse recently reported incidents, review their current
                response status and identify communities that require urgent
                assistance.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate">
                  Total incidents
                </p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {incidents.length}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate">
                  Critical reports
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-red-600">
                  {criticalCount}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate">
                  Verified reports
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-emerald-600">
                  {verifiedCount}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate">
                  People affected
                </p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {totalAffected.toLocaleString()}+
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-16">
          <Container>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
                <div>
                  <label
                    htmlFor="incident-search"
                    className="mb-2 block text-sm font-bold text-ink"
                  >
                    Search incidents
                  </label>

                  <input
                    id="incident-search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title, location or description"
                    className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sea focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type-filter"
                    className="mb-2 block text-sm font-bold text-ink"
                  >
                    Disaster type
                  </label>

                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition focus:border-sea focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    {disasterTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-sm font-bold text-ink"
                  >
                    Status
                  </label>

                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition focus:border-sea focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Incident reports
                </h2>
                <p className="mt-1 text-sm text-slate">
                  Showing {filteredIncidents.length} of {incidents.length}{' '}
                  reports
                </p>
              </div>

              {(searchTerm ||
                typeFilter !== 'All' ||
                statusFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('All');
                    setStatusFilter('All');
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate transition hover:border-slate-300 hover:text-ink"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredIncidents.length > 0 ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {filteredIncidents.map((incident) => (
                  <article
                    key={incident.id}
                    className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-panel"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge
                        className={
                          severityStyles[incident.severity] ||
                          'bg-slate-100 text-slate-700 ring-slate-200'
                        }
                      >
                        {incident.severity} severity
                      </Badge>

                      <Badge
                        className={
                          statusStyles[incident.status] ||
                          'bg-slate-100 text-slate-700 ring-slate-200'
                        }
                      >
                        {incident.status}
                      </Badge>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sea">
                        {incident.type}
                      </p>

                      <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                        {incident.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-slate">
                        {incident.location}
                      </p>

                      <p className="mt-4 text-sm leading-7 text-slate">
                        {incident.description}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 rounded-2xl bg-mist p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Reported
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {incident.reportedAt}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          People affected
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {incident.peopleAffected.toLocaleString()}+
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="rounded-xl bg-sea px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(14,165,233,0.22)] transition hover:bg-sky-600"
                      >
                        View details
                      </button>

                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-slate-300 hover:bg-mist"
                      >
                        View location
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h3 className="font-display text-2xl font-bold">
                  No incidents found
                </h3>
                <p className="mt-2 text-sm text-slate">
                  Try changing your search term or selected filters.
                </p>
              </div>
            )}
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}