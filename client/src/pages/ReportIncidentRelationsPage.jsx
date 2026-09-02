import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Badge from '../components/ui/Badge';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import { getReportRelationships } from '../services/reportRelationshipService';

const JOIN_MODES = [
  {
    id: 'full',
    label: 'Complete Overview',
    joinSql: 'FULL OUTER JOIN',
    badge: '360° Matrix',
    description: 'Shows all reports and incidents together, highlighting linked records, unlinked reports, and unassigned incidents.',
  },
  {
    id: 'inner',
    label: 'Reports + Reporters',
    joinSql: 'INNER JOIN',
    badge: 'Verified Matches',
    description: 'Shows disaster reports strictly paired with their registered citizen or volunteer reporters.',
  },
  {
    id: 'left',
    label: 'Reports with Incident Status',
    joinSql: 'LEFT JOIN',
    badge: 'Report Centric',
    description: 'Lists all emergency reports, including whether an official response incident has been linked yet.',
  },
  {
    id: 'right',
    label: 'Incident-Wise Reports',
    joinSql: 'RIGHT JOIN',
    badge: 'Incident Centric',
    description: 'Lists all registered disaster incidents and any citizen reports currently mapped to them.',
  },
];

export default function ReportIncidentRelationsPage() {
  const [activeMode, setActiveMode] = useState('full');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total_reports: 0,
    linked_reports: 0,
    unlinked_reports: 0,
    total_incidents: 0,
    incidents_with_reports: 0,
    incidents_without_reports: 0,
  });
  const [relationships, setRelationships] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');

  // Modal inspection state
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchData = async (mode) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportRelationships(mode);
      setSummary(data.summary || {});
      setRelationships(data.relationships || []);
    } catch (err) {
      console.error('Failed to load report-incident relationships:', err);
      setError(err?.response?.data?.message || 'Could not fetch relational report-incident data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeMode);
  }, [activeMode]);

  const filteredData = useMemo(() => {
    return relationships.filter((item) => {
      const report = item.report;
      const incident = item.incident;
      const reporter = item.reporter;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const reportTitle = (report?.title || '').toLowerCase();
        const reportLocation = (report?.location || '').toLowerCase();
        const reporterName = (reporter?.name || '').toLowerCase();
        const incidentTitle = (incident?.title || '').toLowerCase();
        const incidentDistrict = (incident?.district || '').toLowerCase();

        const matches =
          reportTitle.includes(query) ||
          reportLocation.includes(query) ||
          reporterName.includes(query) ||
          incidentTitle.includes(query) ||
          incidentDistrict.includes(query);

        if (!matches) return false;
      }

      // Severity filter
      if (severityFilter !== 'all') {
        const currentSeverity = (report?.severity || incident?.severity || '').toLowerCase();
        if (currentSeverity !== severityFilter.toLowerCase()) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const currentStatus = (report?.status || incident?.status || '').toLowerCase();
        if (currentStatus !== statusFilter.toLowerCase()) return false;
      }

      // Relationship state filter
      if (relationshipFilter !== 'all') {
        if (item.relationship_state !== relationshipFilter) return false;
      }

      return true;
    });
  }, [relationships, searchQuery, severityFilter, statusFilter, relationshipFilter]);

  const currentModeInfo = JOIN_MODES.find((m) => m.id === activeMode) || JOIN_MODES[0];

  const getSeverityBadgeClass = (severity) => {
    const s = String(severity || '').toLowerCase();
    if (s === 'critical') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (s === 'high') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s === 'medium') return 'bg-sky-100 text-sky-800 border-sky-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'resolved' || s === 'verified') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'in_progress' || s === 'active') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s === 'monitoring') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10">
      <Container className="space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Link to="/" className="hover:text-ink">Home</Link>
              <span>/</span>
              <Link to="/incidents" className="hover:text-ink">Disasters</Link>
              <span>/</span>
              <span className="text-signal">Relational Management</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Report-to-Incident Management
            </h1>
            <p className="mt-1 text-base text-slate-600">
              Explore relational database connections between emergency citizen reports, verified reporters, and operational incidents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PrimaryButton to="/incidents/new" className="text-sm shadow-md">
              + Submit Report
            </PrimaryButton>
            <SecondaryButton to="/incidents" className="text-sm">
              Incident List
            </SecondaryButton>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Reports</p>
            <p className="mt-1 font-display text-2xl font-black text-ink">{summary.total_reports ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-emerald-600">Citizen submissions</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Linked to Incidents</p>
            <p className="mt-1 font-display text-2xl font-black text-blue-600">{summary.linked_reports ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-blue-600">Active operations</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unlinked Reports</p>
            <p className="mt-1 font-display text-2xl font-black text-amber-600">{summary.unlinked_reports ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-amber-600">Pending review</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Incidents</p>
            <p className="mt-1 font-display text-2xl font-black text-purple-600">{summary.total_incidents ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-purple-600">Operations desk</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Incidents w/ Reports</p>
            <p className="mt-1 font-display text-2xl font-black text-emerald-600">{summary.incidents_with_reports ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-emerald-600">Supported by field data</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Incidents Unlinked</p>
            <p className="mt-1 font-display text-2xl font-black text-rose-600">{summary.incidents_without_reports ?? 0}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-rose-600">Awaiting field reports</span>
          </div>
        </div>

        {/* SQL Join View Selector Tabs */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Relational SQL Perspective</span>
              <h2 className="text-lg font-bold text-ink">Choose Database Query View</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
              <span>⚡ Active Query:</span>
              <code className="font-mono font-bold text-sky-950">{currentModeInfo.joinSql}</code>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {JOIN_MODES.map((mode) => {
              const isSelected = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-ink bg-ink text-white shadow-lg ring-2 ring-ink/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                        {mode.joinSql}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {mode.badge}
                      </span>
                    </div>
                    <p className={`mt-2 font-display text-base font-bold ${isSelected ? 'text-white' : 'text-ink'}`}>
                      {mode.label}
                    </p>
                    <p className={`mt-1 text-xs leading-relaxed ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                      {mode.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-amber-300' : 'text-slate-500'}>
                      {isSelected ? '✓ Selected' : 'Click to execute'}
                    </span>
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Search Records</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, location, reporter, incident..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pl-9 text-sm text-ink placeholder-slate-400 transition focus:border-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink transition focus:border-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink transition focus:border-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="in_progress">In Progress / Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Relationship State Filter */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Relationship State</label>
              <select
                value={relationshipFilter}
                onChange={(e) => setRelationshipFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink transition focus:border-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="all">All States</option>
                <option value="linked">Linked (Report & Incident)</option>
                <option value="report_only">Report Only (Unlinked)</option>
                <option value="incident_only">Incident Only (Unassigned)</option>
              </select>
            </div>
          </div>

          {(searchQuery || severityFilter !== 'all' || statusFilter !== 'all' || relationshipFilter !== 'all') && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Showing {filteredData.length} of {relationships.length} records</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                  setRelationshipFilter('all');
                }}
                className="font-semibold text-rose-600 hover:text-rose-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Content Section: Loading / Error / Data Table */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ink"></div>
            <p className="mt-4 font-display text-lg font-bold text-ink">Executing Raw SQL Query...</p>
            <p className="mt-1 text-sm text-slate-500">Running <code className="font-mono text-signal">{currentModeInfo.joinSql}</code> against disaster database.</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-rose-900">Query Execution Error</h3>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => fetchData(activeMode)}
              className="mt-4 inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
            >
              Retry Query
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">No Relational Matches Found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria or switch to another SQL JOIN mode.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setRelationshipFilter('all');
              }}
              className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">Report Details</th>
                    <th scope="col" className="px-6 py-4">Reporter Information</th>
                    <th scope="col" className="px-6 py-4">Linked Incident</th>
                    <th scope="col" className="px-6 py-4">Location</th>
                    <th scope="col" className="px-6 py-4">Severity & Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, index) => {
                    const report = item.report;
                    const reporter = item.reporter;
                    const incident = item.incident;
                    const state = item.relationship_state;

                    return (
                      <tr
                        key={`rel-${index}-${report?.id || 'norep'}-${incident?.id || 'noinc'}`}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Report Column */}
                        <td className="px-6 py-4">
                          {report ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                                  #{report.id}
                                </span>
                                <span className="font-semibold text-ink line-clamp-1">{report.title}</span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {report.description}
                              </p>
                              <span className="mt-1.5 inline-block text-[10px] text-slate-400">
                                {report.created_at ? new Date(report.created_at).toLocaleString() : 'Recent'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs italic text-slate-400">
                              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-400">
                                NULL
                              </span>
                              No report attached (Incident Only)
                            </div>
                          )}
                        </td>

                        {/* Reporter Column */}
                        <td className="px-6 py-4">
                          {reporter ? (
                            <div>
                              <div className="font-semibold text-ink">{reporter.name}</div>
                              {reporter.phone && (
                                <div className="text-xs text-slate-500 font-mono">{reporter.phone}</div>
                              )}
                              <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                                {reporter.role}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400">No reporter record</span>
                          )}
                        </td>

                        {/* Incident Column */}
                        <td className="px-6 py-4">
                          {incident ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                                  INC-{incident.id}
                                </span>
                                <span className="font-semibold text-ink line-clamp-1">{incident.title}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span>District: <strong>{incident.district}</strong></span>
                                {incident.verified && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs italic text-amber-700">
                              <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                                Unlinked
                              </span>
                              <span>No incident paired</span>
                            </div>
                          )}
                        </td>

                        {/* Location Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1.5 text-xs text-slate-700">
                            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{report?.location || incident?.district || 'Location unavailable'}</span>
                          </div>
                        </td>

                        {/* Severity & Status Column */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                getSeverityBadgeClass(report?.severity || incident?.severity)
                              }`}>
                                {report?.severity || incident?.severity || 'Medium'} Severity
                              </span>
                            </div>
                            <div>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                getStatusBadgeClass(report?.status || incident?.status)
                              }`}>
                                {report?.status || incident?.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {report && (
                              <button
                                type="button"
                                onClick={() => setSelectedReport(report)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-ink hover:bg-slate-50"
                              >
                                View Report
                              </button>
                            )}
                            {incident && (
                              <button
                                type="button"
                                onClick={() => setSelectedIncident(incident)}
                                className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-900 shadow-sm transition hover:bg-purple-100"
                              >
                                View Incident
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer summary bar */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold text-slate-600 sm:flex-row">
              <div className="flex items-center gap-3">
                <span>Displaying <strong>{filteredData.length}</strong> matching relationships</span>
                <span>•</span>
                <span className="font-mono text-slate-500">Query Mode: {currentModeInfo.joinSql}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>PostgreSQL / SQL Layer Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Report Details */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                    REPORT #{selectedReport.id}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-extrabold text-ink">{selectedReport.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</p>
                  <p className="mt-1 leading-relaxed text-ink">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</p>
                    <p className="mt-0.5 font-semibold text-ink">{selectedReport.location}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Severity</p>
                    <p className="mt-0.5 font-semibold text-ink capitalize">{selectedReport.severity}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</p>
                    <p className="mt-0.5 font-semibold text-ink capitalize">{selectedReport.status}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Coordinates</p>
                    <p className="mt-0.5 font-mono text-xs text-ink">
                      {selectedReport.latitude && selectedReport.longitude
                        ? `${selectedReport.latitude}, ${selectedReport.longitude}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Incident Details */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-xs font-bold text-purple-800">
                    INCIDENT #{selectedIncident.id}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-extrabold text-ink">{selectedIncident.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">District</p>
                    <p className="mt-0.5 font-semibold text-ink">{selectedIncident.district}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Severity</p>
                    <p className="mt-0.5 font-semibold text-ink capitalize">{selectedIncident.severity}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</p>
                    <p className="mt-0.5 font-semibold text-ink capitalize">{selectedIncident.status}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verification</p>
                    <p className="mt-0.5 font-semibold text-ink">
                      {selectedIncident.verified ? '✓ Verified by Ops' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
