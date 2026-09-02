import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Badge from '../components/ui/Badge';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import {
  getAdminReports,
  verifyReport,
  rejectReport,
  closeReport,
  getReportDetail,
  getInnerJoinReports,
  getLeftJoinReports,
  getReportStatistics,
  getRecentReports,
} from '../services/adminReportService';

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
}

function datetimeLabel(value) {
  return value ? new Date(value).toLocaleString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
}

function statusClass(status) {
  if (status === 'verified') return 'border-forest/30 bg-forest/10 text-forest';
  if (status === 'rejected') return 'border-ember/30 bg-ember/10 text-ember';
  if (status === 'closed') return 'border-slate-300 bg-slate-100 text-slate-600';
  return 'border-sky-300 bg-sky-100 text-sky-700';
}

function severityBadge(severity) {
  if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-200';
  if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (severity === 'low') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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

export default function AdminReportsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', severity: '' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [overview, setOverview] = useState({});
  const [innerJoinData, setInnerJoinData] = useState(null);
  const [leftJoinData, setLeftJoinData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [recentData, setRecentData] = useState(null);

  const [loadingSections, setLoadingSections] = useState({
    innerJoin: false,
    leftJoin: false,
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
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.severity) params.severity = filters.severity;

    fetchSqlSection('innerJoin', () => getInnerJoinReports(params), setInnerJoinData);
    fetchSqlSection('leftJoin', () => getLeftJoinReports(params), setLeftJoinData);
    fetchSqlSection('stats', () => getReportStatistics(), setStatsData);
    fetchSqlSection('recent', () => getRecentReports({ ...params, limit: 20 }), setRecentData);
  }, [filters, fetchSqlSection]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.severity) params.severity = filters.severity;

    getAdminReports(params).then((result) => {
      if (alive) {
        setOverview(result.overview ?? {});
        setLoading(false);
        fetchAllSections();
      }
    }).catch((exception) => {
      if (alive) { setError(exception?.response?.data?.message ?? 'Unable to load reports.'); setLoading(false); }
    });
    return () => { alive = false; };
  }, [filters]);

  const updateFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));

  const openDetails = async (reportId) => {
    setNotice('');
    setError('');
    try {
      const detail = await getReportDetail(reportId);
      setSelected(detail);
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to load report details.');
    }
  };

  const handleVerify = async (report) => {
    if (!window.confirm(`Verify this report "${report.title}"?`)) return;
    setBusyId(report.report_id);
    setError('');
    try {
      await verifyReport(report.report_id);
      setSelected(null);
      setNotice('Report verified successfully.');
      fetchAllSections();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to verify this report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (report) => {
    if (!window.confirm(`Reject this report "${report.title}"?`)) return;
    setBusyId(report.report_id);
    setError('');
    try {
      await rejectReport(report.report_id);
      setSelected(null);
      setNotice('Report rejected successfully.');
      fetchAllSections();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to reject this report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClose = async (report) => {
    if (!window.confirm(`Close this report "${report.title}"?`)) return;
    setBusyId(report.report_id);
    setError('');
    try {
      await closeReport(report.report_id);
      setSelected(null);
      setNotice('Report closed successfully.');
      fetchAllSections();
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to close this report.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Admin review</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Reports</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">Review, verify, and moderate disaster reports. SQL operations execute raw PostgreSQL queries.</p>
          </div>
          <SecondaryButton to="/admin/dashboard" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Back to dashboard</SecondaryButton>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-ink">{overview.total_reports ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Total reports</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-sky-600">{overview.pending_reports ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Pending review</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-forest">{overview.verified_reports ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Verified</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-ember">{overview.rejected_reports ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Rejected</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="font-display text-3xl font-bold text-slate-500">{overview.closed_reports ?? 0}</p>
            <p className="mt-2 text-sm font-semibold text-ink">Closed</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="grid gap-5 md:grid-cols-[1fr_190px_190px]">
            <FormField label="Search reports" value={filters.search} onChange={updateFilter('search')} placeholder="Title, description, or location" />
            <FormField as="select" label="Status" value={filters.status} onChange={updateFilter('status')}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </FormField>
            <FormField as="select" label="Severity" value={filters.severity} onChange={updateFilter('severity')}>
              <option value="">All severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </FormField>
          </div>
        </div>

        {notice && <div role="status" className="mt-5 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm font-semibold text-forest">{notice}</div>}
        {error && <div role="alert" className="mt-5 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{error}</div>}

        <SqlSection
          title="1. Report + Reporter"
          sqlOperation="INNER JOIN"
          description="Shows report information joined with the reporter user record. Only reports with matching reporters are shown."
          loading={loadingSections.innerJoin}
          error={errorSections.innerJoin}
          count={innerJoinData?.count}
          onRetry={() => fetchSqlSection('innerJoin', () => getInnerJoinReports(filters), setInnerJoinData)}
        >
          {innerJoinData?.data?.length === 0 ? (
            <EmptyState message="No reports match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reported</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {innerJoinData?.data?.map((row) => (
                    <tr key={row.report_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.report_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.title}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{row.reporter_name}</p>
                        <p className="text-xs text-slate-500">ID: {row.reporter_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">{row.reporter_phone}</p>
                        <p className="text-xs text-slate-500">{row.reporter_email}</p>
                      </td>
                      <td className="px-6 py-4"><Badge className={severityBadge(row.severity)}>{row.severity}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.status)}>{row.status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.reported_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.report_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="2. Report + Incident"
          sqlOperation="LEFT JOIN"
          description="Shows ALL reports including those with no linked incident. Incident fields are NULL for unlinked reports."
          loading={loadingSections.leftJoin}
          error={errorSections.leftJoin}
          count={leftJoinData?.count}
          onRetry={() => fetchSqlSection('leftJoin', () => getLeftJoinReports(filters), setLeftJoinData)}
        >
          {leftJoinData?.data?.length === 0 ? (
            <EmptyState message="No reports match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Incident</th>
                    <th className="px-6 py-4">Reported</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leftJoinData?.data?.map((row) => (
                    <tr key={row.report_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.report_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.location}</td>
                      <td className="px-6 py-4"><Badge className={severityBadge(row.severity)}>{row.severity}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.status)}>{row.status}</Badge></td>
                      <td className="px-6 py-4">
                        {row.incident_title ? (
                          <span className="text-sm font-semibold text-ink">{row.incident_title}</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">No incident linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.reported_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.report_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        <SqlSection
          title="3. Report Statistics"
          sqlOperation="COUNT / GROUP BY"
          description="Aggregated counts of reports grouped by status and severity."
          loading={loadingSections.stats}
          error={errorSections.stats}
          onRetry={() => fetchSqlSection('stats', () => getReportStatistics(), setStatsData)}
        >
          {statsData?.grouped?.length === 0 ? (
            <EmptyState message="No report statistics available." />
          ) : (
            <div className="p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-5">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Pending</p>
                  <p className="mt-1 font-display text-2xl font-bold text-sky-800">{overview.pending_reports ?? 0}</p>
                </div>
                <div className="rounded-xl border border-forest/30 bg-forest/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-forest">Verified</p>
                  <p className="mt-1 font-display text-2xl font-bold text-forest">{overview.verified_reports ?? 0}</p>
                </div>
                <div className="rounded-xl border border-ember/30 bg-ember/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-ember">Rejected</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ember">{overview.rejected_reports ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Closed</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-600">{overview.closed_reports ?? 0}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Critical</p>
                  <p className="mt-1 font-display text-2xl font-bold text-red-800">{overview.critical_severity ?? 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Severity</th>
                      <th className="px-6 py-4">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statsData?.grouped?.map((row) => (
                      <tr key={`${row.report_status}-${row.report_severity}`} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4"><Badge className={statusClass(row.report_status)}>{row.report_status}</Badge></td>
                        <td className="px-6 py-4"><Badge className={severityBadge(row.report_severity)}>{row.report_severity}</Badge></td>
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
          title="4. Recent / Filtered Reports"
          sqlOperation="WHERE / ORDER BY"
          description="Recent reports with optional status and severity filtering, ordered by report date."
          loading={loadingSections.recent}
          error={errorSections.recent}
          count={recentData?.count}
          onRetry={() => fetchSqlSection('recent', () => getRecentReports({ ...filters, limit: 20 }), setRecentData)}
        >
          {recentData?.data?.length === 0 ? (
            <EmptyState message="No recent reports match the current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Incident</th>
                    <th className="px-6 py-4">Reported</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentData?.data?.map((row) => (
                    <tr key={`recent-${row.report_id}`} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">#{row.report_id}</td>
                      <td className="px-6 py-4 font-semibold text-ink">{row.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.reporter_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.reporter_phone}</td>
                      <td className="px-6 py-4"><Badge className={severityBadge(row.severity)}>{row.severity}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusClass(row.status)}>{row.status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-slate-600">{row.incident_title || '—'}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{dateLabel(row.reported_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openDetails(row.report_id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-50">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SqlSection>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Report details">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Report #{selected.report_id}</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-ink">{selected.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">Reported by {selected.reporter_name} ({selected.reporter_phone})</p>
                  <p className="mt-1 text-xs text-slate-500">{datetimeLabel(selected.reported_at)}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-2xl leading-none text-slate-500 hover:bg-mist" aria-label="Close details">×</button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-mist p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <Badge className={`mt-1 ${statusClass(selected.status)}`}>{selected.status}</Badge>
                </div>
                <div className="rounded-xl bg-mist p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Severity</p>
                  <Badge className={`mt-1 ${severityBadge(selected.severity)}`}>{selected.severity}</Badge>
                </div>
                {selected.location && (
                  <div className="col-span-2 rounded-xl bg-mist p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                    <p className="mt-1 text-sm text-slate-700">{selected.location}</p>
                    {selected.latitude && selected.longitude && (
                      <p className="text-xs text-slate-500">({selected.latitude}, {selected.longitude})</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-xl bg-mist p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                <p className="mt-1 text-sm text-slate-700">{selected.description}</p>
              </div>
              {selected.incident_id && (
                <div className="mt-4 rounded-xl bg-mist p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Linked Incident</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.incident_title}</p>
                  <p className="text-xs text-slate-500">{selected.incident_district} · {selected.incident_severity} · {selected.incident_status}</p>
                </div>
              )}
              {(selected.status === 'pending' || selected.status === 'verified') && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {selected.status === 'pending' && (
                    <PrimaryButton type="button" disabled={busyId === selected.report_id} onClick={() => handleVerify(selected)}>Verify</PrimaryButton>
                  )}
                  <SecondaryButton type="button" disabled={busyId === selected.report_id} onClick={() => handleReject(selected)} className="border-ember/30 bg-white text-ember hover:bg-ember/10">Reject</SecondaryButton>
                  <SecondaryButton type="button" disabled={busyId === selected.report_id} onClick={() => handleClose(selected)} className="border-slate-300 bg-white text-slate-600 hover:bg-slate-50">Close</SecondaryButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
