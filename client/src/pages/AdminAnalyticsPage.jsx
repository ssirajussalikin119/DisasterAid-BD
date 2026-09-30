import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import AnalyticsCard from '../components/analytics/AnalyticsCard';
import BarList from '../components/analytics/BarList';
import DonutChart from '../components/analytics/DonutChart';
import GroupedBarChart from '../components/analytics/GroupedBarChart';
import { ChartEmpty, ChartError, ChartLoading } from '../components/analytics/ChartStates';
import SecondaryButton from '../components/ui/SecondaryButton';
import StatCard from '../components/ui/StatCard';
import { getAdminAnalyticsOverview, getDistrictDisasterSummary } from '../services/adminDashboardService';

const VIEW_BADGE = (
  <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">
    PostgreSQL VIEW
  </span>
);

const KPI_META = [
  ['active_incidents', 'Active incidents', 'Ongoing emergencies'],
  ['critical_incidents', 'Critical incidents', 'Highest-priority situations'],
  ['verified_reports', 'Verified reports', 'Confirmed genuine reports'],
  ['pending_relief_requests', 'Pending relief requests', 'Waiting for dispatch'],
  ['active_volunteers', 'Active volunteers', 'Registered volunteer accounts'],
  ['active_assignments', 'Active assignments', 'Ongoing response tasks'],
  ['resolved_incidents', 'Resolved incidents', 'Brought under control'],
];

const DISTRICT_SERIES = [
  { key: 'active_incidents', label: 'Active incidents', color: '#0ea5e9' },
  { key: 'critical_incidents', label: 'Critical incidents', color: '#dc2626' },
  { key: 'verified_reports', label: 'Verified reports', color: '#166534' },
  { key: 'active_assignments', label: 'Active assignments', color: '#0d9488' },
];

const SEVERITY_COLORS = { critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#0ea5e9' };

const TYPE_COLORS = {
  'Flood / Waterlogging': '#0ea5e9',
  'Cyclone / Storm': '#7c3aed',
  Landslide: '#f97316',
  Earthquake: '#dc2626',
  Fire: '#f59e0b',
  Heatwave: '#ef4444',
  'Disease Outbreak': '#0d9488',
  'River Erosion': '#166534',
  'Road Accident': '#334155',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  open: '#f59e0b',
  approved: '#0ea5e9',
  accepted: '#0ea5e9',
  fulfilled: '#166534',
  completed: '#166534',
  rejected: '#dc2626',
  cancelled: '#64748b',
};

const VOLUNTEER_TILES = [
  ['active_volunteers', 'Active volunteers', 'Registered volunteer accounts'],
  ['district_view_volunteers', 'In district table', 'Attributed by profile location'],
  ['unlocated_volunteers', 'Without location', 'Cannot be mapped to a district'],
  ['assigned_volunteers', 'Assigned volunteers', 'Hold at least one assignment'],
  ['pending_assignments', 'Pending assignments', 'Not yet started'],
  ['completed_assignments', 'Completed assignments', 'Work finished'],
];

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [districtsError, setDistrictsError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setOverviewError(null);
    setOverviewLoading(true);
    try {
      const response = await getAdminAnalyticsOverview();
      if (response.success) {
        setOverview(response.data);
      } else {
        setOverviewError('Failed to fetch analytics overview');
      }
    } catch (err) {
      setOverviewError(err?.response?.data?.message ?? err.message ?? 'An error occurred while fetching analytics overview');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchDistricts = useCallback(async () => {
    setDistrictsError(null);
    setDistrictsLoading(true);
    try {
      const response = await getDistrictDisasterSummary();
      if (response.success) {
        setDistricts(response.data?.districts ?? []);
      } else {
        setDistrictsError('Failed to fetch district summary');
      }
    } catch (err) {
      setDistrictsError(err?.response?.data?.message ?? err.message ?? 'An error occurred while fetching district summary');
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchDistricts();
  }, [fetchOverview, fetchDistricts]);

  const overviewFallback = overviewError ? (
    <ChartError message={overviewError} onRetry={fetchOverview} />
  ) : (
    <ChartLoading label="Loading analytics overview..." />
  );

  const districtFallback = districtsError ? (
    <ChartError message={districtsError} onRetry={fetchDistricts} />
  ) : (
    <ChartLoading label="Loading district summary..." />
  );

  const districtCategories = districts.map((row) => ({
    label: row.district_name,
    values: {
      active_incidents: row.active_incidents,
      critical_incidents: row.critical_incidents,
      verified_reports: row.verified_reports,
      active_assignments: row.active_assignments,
    },
  }));

  const unavailableExcluded = Math.max(
    0,
    (overview?.volunteer_activity?.located_volunteers ?? 0) - (overview?.volunteer_activity?.district_view_volunteers ?? 0),
  );

  const renderDistrictContent = (content, empty) => {
    if (districts.length > 0) {
      return content;
    }

    if (districtsLoading) {
      return districtFallback;
    }

    if (districtsError) {
      return districtFallback;
    }

    return empty;
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Analytics</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Disaster response analytics
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
              District-level analysis powered by the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-semibold">district_disaster_summary</code>{' '}
              PostgreSQL view. Every number is aggregated from the live database at request time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SecondaryButton to="/admin/dashboard" className="border-slate-300 bg-white text-ink hover:bg-slate-50">
              Back to dashboard
            </SecondaryButton>
          </div>
        </div>

        {overview ? (
          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-ink">Disaster Overview</h2>
                <p className="mt-1 text-sm text-slate-600">What is the current state of the disaster response platform?</p>
              </div>
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {KPI_META.map(([key, label, description]) => (
                <StatCard key={key} value={overview.kpis?.[key] ?? 0} label={label} description={description} compact />
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-8">{overviewFallback}</div>
        )}

        <div className="mt-6">
          <AnalyticsCard
            title="District Situation"
            question="Which districts currently need the most response?"
            badge={VIEW_BADGE}
          >
            {renderDistrictContent(
              <GroupedBarChart categories={districtCategories} series={DISTRICT_SERIES} />,
              <ChartEmpty
                title="No district data yet"
                description="Districts appear here once disaster incidents have been reported."
              />,
            )}
          </AnalyticsCard>
        </div>

        {overview ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <AnalyticsCard title="Incident Severity" question="How severe are the current incidents?">
              {overview.severity_distribution?.length ? (
                <DonutChart
                  data={overview.severity_distribution.map((entry) => ({
                    ...entry,
                    color: SEVERITY_COLORS[entry.label.toLowerCase()],
                  }))}
                  centerLabel="incidents"
                />
              ) : (
                <ChartEmpty
                  title="No incidents recorded"
                  description="Severity breakdown appears as soon as incidents are reported."
                />
              )}
            </AnalyticsCard>

            <AnalyticsCard
              title="Disaster Types"
              question="Which types of disasters are being reported?"
              badge={
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  From incident titles
                </span>
              }
            >
              {overview.type_distribution?.length ? (
                <BarList data={overview.type_distribution} colorMap={TYPE_COLORS} unitLabel="incidents" />
              ) : (
                <ChartEmpty
                  title="No incident titles to classify"
                  description="Disaster types are derived from real incident titles in the database."
                />
              )}
            </AnalyticsCard>

            <AnalyticsCard title="Relief Request Status" question="How are relief requests distributed by status?">
              {overview.relief_status_distribution?.length ? (
                <BarList
                  data={overview.relief_status_distribution}
                  colorMap={STATUS_COLORS}
                  unitLabel="relief requests"
                />
              ) : (
                <ChartEmpty
                  title="No relief requests yet"
                  description="Status breakdown appears as soon as citizens submit relief requests."
                />
              )}
            </AnalyticsCard>

            <AnalyticsCard
              title="Volunteer Activity"
              question="How many volunteers are active, located and assigned?"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {VOLUNTEER_TILES.map(([key, label, description]) => (
                  <StatCard
                    key={key}
                    value={overview.volunteer_activity?.[key] ?? 0}
                    label={label}
                    description={description}
                    compact
                  />
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-xs leading-5 text-slate-600">
                <span className="font-bold text-ink">Why are district numbers lower?</span> Volunteers are matched to a
                district through their profile location and must not be marked unavailable.{' '}
                {overview.volunteer_activity?.unlocated_volunteers ?? 0} of{' '}
                {overview.volunteer_activity?.active_volunteers ?? 0} active volunteers have no location set
                {unavailableExcluded > 0
                  ? `, and ${unavailableExcluded} ${unavailableExcluded === 1 ? 'is' : 'are'} marked unavailable`
                  : ''}{' '}
                — they count towards the platform total but not towards any district row.
              </div>
            </AnalyticsCard>
          </div>
        ) : null}

        <div className="mt-6">
          <AnalyticsCard
            title="District Situation — Full Breakdown"
            question="Exact per-district numbers from the district_disaster_summary view."
            badge={VIEW_BADGE}
          >
            {renderDistrictContent(
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-4 py-4">District</th>
                      <th className="px-4 py-4 text-right">Active incidents</th>
                      <th className="px-4 py-4 text-right">Critical incidents</th>
                      <th className="px-4 py-4 text-right">Verified reports</th>
                      <th className="px-4 py-4 text-right">Pending relief requests</th>
                      <th className="px-4 py-4 text-right">Active volunteers</th>
                      <th className="px-4 py-4 text-right">Active assignments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {districts.map((row) => (
                      <tr key={`${row.district_id}-${row.district_name}`} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4 font-semibold text-ink">{row.district_name}</td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-ink">
                          {row.active_incidents.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-red-600">
                          {row.critical_incidents.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-forest">
                          {row.verified_reports.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-sky-600">
                          {row.pending_relief_requests.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-ink">
                          {row.active_volunteers.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-lg font-bold text-ink">
                          {row.active_assignments.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-mist/60 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <td className="px-4 py-3">Total</td>
                      {['active_incidents', 'critical_incidents', 'verified_reports', 'pending_relief_requests', 'active_volunteers', 'active_assignments'].map(
                        (key) => (
                          <td key={key} className="px-4 py-3 text-right text-sm font-bold text-ink">
                            {districts.reduce((sum, row) => sum + row[key], 0).toLocaleString()}
                          </td>
                        ),
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>,
              <ChartEmpty
                title="No district data found"
                description="Districts appear here once disaster incidents have been reported."
              />,
            )}
          </AnalyticsCard>
        </div>
      </div>
    </AdminLayout>
  );
}
