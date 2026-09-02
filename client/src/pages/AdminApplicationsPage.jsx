import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Badge from '../components/ui/Badge';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import {
  getAdminApplications,
  approveApplication,
  rejectApplication,
  getApplicationDetail,
  getInnerJoinApplications,
  getLeftJoinApplications,
  getUnionApplications,
  getIntersectApproved,
  getStatistics,
  getRecentApplications,
} from '../services/adminApplicationService';

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
}

function datetimeLabel(value) {
  return value ? new Date(value).toLocaleString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
}

function statusClass(status) {
  if (status === 'approved') return 'border-forest/30 bg-forest/10 text-forest';
  if (status === 'rejected') return 'border-ember/30 bg-ember/10 text-ember';
  return 'border-sky-300 bg-sky-100 text-sky-700';
}

function roleBadge(role) {
  if (role === 'volunteer') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (role === 'ngo') return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function SqlSection({ title, sqlOperation, description, loading, error, count, onRetry, children }) {
  return (
    <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            {count !== undefined && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{count} rows</span>
            )}
            <code className="hidden rounded-lg bg-ink px-3 py-1.5 font-mono text-[11px] font-bold text-amber-300 sm:inline-block">{sqlOperation}</code>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-ink" />
          <p className="mt-3 text-sm text-slate-600">Executing raw SQL query...</p>
        </div>
      ) : error ? (
        <div className="px-6 py-8">
          <div className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{error}</div>
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90">Retry</button>
          )}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-6 py-16 text-center">
      <h3 className="font-display text-lg font-bold text-ink">No data found</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [innerJoinData, setInnerJoinData] = useState(null);
  const [leftJoinData, setLeftJoinData] = useState(null);
  const [unionData, setUnionData] = useState(null);
  const [intersectData, setIntersectData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [recentData, setRecentData] = useState(null);

  const [loadingSections, setLoadingSections] = useState({
    innerJoin: false,
    leftJoin: false,
    union: false,
    intersect: false,
    stats: false,
    recent: false,
  });
  const [errorSections, setErrorSections] = useState({});

  const fetchSqlSection = useCallback(async (key, fetchFn, setData) => {
    setLoadingSections((prev) => ({ ...prev, [key]: true }));
    setErrorSections((prev) => ({ ...prev, [key]: null }));
    try {
      const result = await fetchFn();
      setData(result);
    } catch (exception) {
      setErrorSections((prev) => ({ ...prev, [key]: exception?.response?.data?.message ?? 'Query failed.' }));
    } finally {
      setLoadingSections((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const fetchAllSections = useCallback(() => {
    const search = filters.search || undefined;
    const type = filters.type || undefined;
    const status = filters.status || undefined;
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (status) params.status = status;

    fetchSqlSection('innerJoin', () => getInnerJoinApplications(params), setInnerJoinData);
    fetchSqlSection('leftJoin', () => getLeftJoinApplications(params), setLeftJoinData);
    fetchSqlSection('union', () => getUnionApplications(params), setUnionData);
    fetchSqlSection('intersect', () => getIntersectApproved(), setIntersectData);
    fetchSqlSection('stats', () => getStatistics(), setStatsData);
    fetchSqlSection('recent', () => getRecentApplications({ ...params, limit: 20 }), setRecentData);
  }, [filters, fetchSqlSection]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    const search = filters.search || undefined;
    const type = filters.type || undefined;
    const status = filters.status || undefined;
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (status) params.status = status;

    getAdminApplications(params).then((result) => {
      if (alive) { setLoading(false); fetchAllSections(); }
    }).catch((exception) => {
      if (alive) { setError(exception?.response?.data?.message ?? 'Unable to load applications.'); setLoading(false); }
    });
    return () => { alive = false; };
  }, [filters]);

  const updateFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));

  const openDetails = async (applicationId) => {
    setNotice('');
    setError('');
    try {
      const detail = await getApplicationDetail(applicationId);
      setSelected(detail);
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to load application details.');
    }
  };

  const review = async (application, decision) => {
    if (!window.confirm(`${decision === 'approved' ? 'Approve' : 'Reject'} this ${application.requested_role || application.application_type} application from ${application.applicant_name}?`)) return;
    const reviewNotes = decision === 'rejected' ? window.prompt('Reason for rejection (optional):', '') : null;
    if (reviewNotes === null && decision === 'rejected') return;
    setBusyId(application.application_id || application.id);
    setError('');
    try {
      const appId = application.application_id || application.id;
      const updated = decision === 'approved' ? await approveApplication(appId) : await rejectApplication(appId, reviewNotes);
      setSelected(null);
      setNotice(`Application ${decision} successfully.`);
      fetchAllSections();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? `Unable to ${decision} this application.`);
    } finally {
      setBusyId(null);
    }
  };

  const overview = statsData?.overview ?? {};

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Admin review</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Applications</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">Review volunteer and NGO applications. SQL operations execute raw PostgreSQL queries.</p>
          </div>
          <SecondaryButton to="/admin/dashboard" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Back to dashboard</SecondaryButton>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-ink">{overview.total_applications ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Total applications</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-sky-600">{overview.pending_applications ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Pending review</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-forest">{overview.approved_applications ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Approved</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-ember">{overview.rejected_applications ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Rejected</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="grid gap-5 md:grid-cols-[1fr_190px_190px]">
            <FormField label="Search applications" value={filters.search} onChange={updateFilter('search')} placeholder="Name, email or phone" />
            <FormField as="select" label="Type" value={filters.type} onChange={updateFilter('type')}>
              <option value="">All types</option>
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO</option>
            </FormField>
            <FormField as="select" label="Status" value={filters.status} onChange={updateFilter('status')}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </FormField>
          </div>
        </div>

        {notice && <div role="status" className="mt-5 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm font-semibold text-forest">{notice}</div>}
        {error && <div role="alert" className="mt-5 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{error}</div>}

        <SqlSection
          title="1. Application + Applicant"
          sqlOperation="INNER JOIN"
          description="Shows application information joined with the actual applicant user record. Only records with matching applicants are shown."
          loading={loadingSections.innerJoin}
          error={errorSections.innerJoin}
          count={innerJoinData?.count}
          onRetry={() => fetchSqlSection('innerJoin', () => getInnerJoinApplications(filters), setInnerJoinData)}
        >
          {innerJoinData?.data?.length === 0 ? (
            <EmptyState message="No applications match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Requested Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {innerJoinData?.data?.map((row) => (
                    <tr key={row.application_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.application_id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{row.applicant_name}</p>
                        <p className="text-xs text-slate-500">ID: {row.applicant_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">{row.applicant_phone}</p>
                        <p className="text-xs text-slate-500">{row.applicant_email}</p>
                      </td>
                      <td className="px-6 py-4"><Badge className={roleBadge(row.requested_role)}>{row.requested_role}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.submitted_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.application_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="2. Application + Reviewer"
          sqlOperation="LEFT JOIN"
          description="Shows ALL applications including pending ones that have no reviewer yet. Reviewer fields are NULL for unreviewed applications."
          loading={loadingSections.leftJoin}
          error={errorSections.leftJoin}
          count={leftJoinData?.count}
          onRetry={() => fetchSqlSection('leftJoin', () => getLeftJoinApplications(filters), setLeftJoinData)}
        >
          {leftJoinData?.data?.length === 0 ? (
            <EmptyState message="No applications match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Requested Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Reviewed At</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leftJoinData?.data?.map((row) => (
                    <tr key={row.application_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.application_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.applicant_name}</td>
                      <td className="px-6 py-4"><Badge className={roleBadge(row.requested_role)}>{row.requested_role}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                      <td className="px-6 py-4">
                        {row.reviewer_name ? (
                          <span className="text-sm font-semibold text-ink">{row.reviewer_name}</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">Pending review</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.reviewed_at ? datetimeLabel(row.reviewed_at) : '—'}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.submitted_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.application_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="3. Combined Volunteer + NGO Queue"
          sqlOperation="UNION"
          description="Unified result set containing both Volunteer and NGO applications normalized into the same columns."
          loading={loadingSections.union}
          error={errorSections.union}
          count={unionData?.count}
          onRetry={() => fetchSqlSection('union', () => getUnionApplications(filters), setUnionData)}
        >
          {unionData?.data?.length === 0 ? (
            <EmptyState message="No applications match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unionData?.data?.map((row) => (
                    <tr key={`union-${row.application_id}`} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.application_id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{row.applicant_name}</p>
                        <p className="text-xs text-slate-500">ID: {row.applicant_id}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.applicant_contact}</td>
                      <td className="px-6 py-4"><Badge className={roleBadge(row.application_type)}>{row.application_type}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.submitted_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.application_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="4. Approved & Linked Volunteers"
          sqlOperation="INTERSECT"
          description="Users who have BOTH an approved volunteer application AND a corresponding volunteer record in the database."
          loading={loadingSections.intersect}
          error={errorSections.intersect}
          count={intersectData?.count}
          onRetry={() => fetchSqlSection('intersect', () => getIntersectApproved(), setIntersectData)}
        >
          {intersectData?.data?.length === 0 ? (
            <EmptyState message="No approved volunteers with linked volunteer records found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">User ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Volunteer ID</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {intersectData?.data?.map((row) => (
                    <tr key={`intersect-${row.user_id}`} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{row.user_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.user_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.phone}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{row.email}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-forest">VOL-{row.volunteer_id}</td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="5. Application Statistics"
          sqlOperation="COUNT / GROUP BY"
          description="Aggregated counts of applications grouped by type and status."
          loading={loadingSections.stats}
          error={errorSections.stats}
          onRetry={() => fetchSqlSection('stats', () => getStatistics(), setStatsData)}
        >
          {statsData?.grouped?.length === 0 ? (
            <EmptyState message="No application statistics available." />
          ) : (
            <div className="p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Volunteer Apps</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-800">{overview.volunteer_applications ?? 0}</p>
                  <p className="text-xs text-emerald-600">{overview.volunteer_pending ?? 0} pending</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600">NGO Apps</p>
                  <p className="mt-1 font-display text-2xl font-bold text-purple-800">{overview.ngo_applications ?? 0}</p>
                  <p className="text-xs text-purple-600">{overview.ngo_pending ?? 0} pending</p>
                </div>
                <div className="rounded-xl border border-forest/30 bg-forest/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-forest">Approved</p>
                  <p className="mt-1 font-display text-2xl font-bold text-forest">{overview.approved_applications ?? 0}</p>
                </div>
                <div className="rounded-xl border border-ember/30 bg-ember/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-ember">Rejected</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ember">{overview.rejected_applications ?? 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Application Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statsData?.grouped?.map((row) => (
                      <tr key={`${row.application_type}-${row.application_status}`} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4"><Badge className={roleBadge(row.application_type)}>{row.application_type}</Badge></td>
                        <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                        <td className="px-6 py-4 font-display text-lg font-bold text-ink">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="6. Recent / Filtered Applications"
          sqlOperation="WHERE / ORDER BY"
          description="Recent applications with optional status and type filtering, ordered by submission date."
          loading={loadingSections.recent}
          error={errorSections.recent}
          count={recentData?.count}
          onRetry={() => fetchSqlSection('recent', () => getRecentApplications({ ...filters, limit: 20 }), setRecentData)}
        >
          {recentData?.data?.length === 0 ? (
            <EmptyState message="No recent applications match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentData?.data?.map((row) => (
                    <tr key={`recent-${row.application_id}`} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.application_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.applicant_name}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">{row.applicant_phone}</p>
                        <p className="text-xs text-slate-500">{row.applicant_email}</p>
                      </td>
                      <td className="px-6 py-4"><Badge className={roleBadge(row.application_type)}>{row.application_type}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.application_status)}>{row.application_status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.reviewer_name || '—'}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.submitted_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.application_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Application details">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">{selected.requested_role} application</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-ink">{selected.applicant_name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{selected.applicant_phone} {selected.applicant_email ? `· ${selected.applicant_email}` : ''}</p>
                  <p className="mt-1 text-xs text-slate-500">Submitted {dateLabel(selected.submitted_at)}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-2xl leading-none text-slate-500 hover:bg-mist" aria-label="Close details">×</button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-mist p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <Badge className={`mt-1 ${statusClass(selected.application_status)}`}>{selected.application_status}</Badge>
                </div>
                <div className="rounded-xl bg-mist p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Role</p>
                  <Badge className={`mt-1 ${roleBadge(selected.requested_role)}`}>{selected.requested_role}</Badge>
                </div>
                {selected.reviewer_name && (
                  <div className="rounded-xl bg-mist p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reviewed by</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{selected.reviewer_name}</p>
                  </div>
                )}
                {selected.reviewed_at && (
                  <div className="rounded-xl bg-mist p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reviewed at</p>
                    <p className="mt-1 text-sm text-slate-700">{datetimeLabel(selected.reviewed_at)}</p>
                  </div>
                )}
              </div>
              {selected.review_notes && (
                <div className="mt-4 rounded-xl bg-mist p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Review Notes</p>
                  <p className="mt-1 text-sm text-slate-700">{selected.review_notes}</p>
                </div>
              )}
              <div className="mt-6 grid gap-3 rounded-xl bg-mist p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Payload</p>
                {Object.entries(selected.application_payload ?? {}).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{key.replaceAll('_', ' ')}</p>
                    <p className="text-sm text-right text-slate-700">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                  </div>
                ))}
              </div>
              {selected.application_status === 'pending' && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryButton type="button" disabled={busyId === (selected.application_id || selected.id)} onClick={() => review(selected, 'approved')}>Approve</PrimaryButton>
                  <SecondaryButton type="button" disabled={busyId === (selected.application_id || selected.id)} onClick={() => review(selected, 'rejected')} className="border-ember/30 bg-white text-ember hover:bg-ember/10">Reject</SecondaryButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
