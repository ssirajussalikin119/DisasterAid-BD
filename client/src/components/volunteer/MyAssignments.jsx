import { useCallback, useEffect, useState } from 'react';
import { getMyAssignments, updateAssignmentStatus } from '../../services/volunteerAssignments';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-sky-100 text-sky-700 border-sky-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const NEXT_ACTIONS = {
  pending: [
    { status: 'accepted', label: 'Accept Task', primary: true },
    { status: 'cancelled', label: 'Decline', primary: false },
  ],
  accepted: [
    { status: 'in_progress', label: 'Start Task', primary: true },
    { status: 'cancelled', label: 'Cancel', primary: false },
  ],
  in_progress: [{ status: 'completed', label: 'Mark Completed', primary: true }],
  completed: [],
  cancelled: [],
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function StatusBadge({ status }) {
  const key = String(status ?? 'pending').toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.12em] ${
        STATUS_STYLES[key] ?? STATUS_STYLES.pending
      }`}
    >
      {key.replace('_', ' ')}
    </span>
  );
}

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAssignments(await getMyAssignments());
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to load your assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (assignment, nextStatus) => {
    if (busyId !== null) return;
    setBusyId(assignment.id);
    setError('');
    setSuccess('');
    try {
      const updated = await updateAssignmentStatus(assignment.id, nextStatus);
      setAssignments((current) => current.map((item) => (item.id === assignment.id ? updated : item)));
      setSuccess(`Task status updated to ${String(nextStatus).replace('_', ' ')}.`);
    } catch (exception) {
      const status = exception?.response?.status;
      setError(
        status === 404
          ? 'This assignment is no longer available to you.'
          : exception?.response?.data?.message ?? 'Unable to update the task status.',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-ink">My Assignments</h2>
          <p className="text-xs text-slate-400">Tasks assigned to you by the response coordinators</p>
        </div>
        {!loading && assignments.length > 0 ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
            {assignments.length}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            Loading your assignments…
          </p>
        ) : error && assignments.length === 0 ? (
          <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : assignments.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            No assignments have been assigned to you yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => {
              const key = String(assignment.status ?? 'pending').toLowerCase();
              const actions = NEXT_ACTIONS[key] ?? [];
              const expanded = expandedId === assignment.id;
              const busy = busyId === assignment.id;
              const incident = assignment.incident ?? {};
              return (
                <li key={assignment.id} className="rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : assignment.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">
                        {incident.title ?? `Assignment #${assignment.id}`}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {[incident.district, incident.severity ? `${incident.severity} severity` : null]
                          .filter(Boolean)
                          .join(' · ') || 'Details inside'}
                      </p>
                    </div>
                    <StatusBadge status={assignment.status} />
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {expanded ? (
                    <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-sm">
                      <dl className="space-y-2">
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Incident</dt>
                          <dd className="text-right font-semibold text-ink">{incident.title ?? '—'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">District</dt>
                          <dd className="text-right font-semibold text-ink">{incident.district ?? '—'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Severity</dt>
                          <dd className="text-right font-semibold capitalize text-ink">{incident.severity ?? '—'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Incident status</dt>
                          <dd className="text-right font-semibold capitalize text-ink">{incident.status ?? '—'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned</dt>
                          <dd className="text-right font-semibold text-ink">{formatDateTime(assignment.created_at)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned by</dt>
                          <dd className="text-right font-semibold text-ink">{assignment.assigner?.name ?? 'Coordinator'}</dd>
                        </div>
                      </dl>

                      {actions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {actions.map((action) => (
                            <button
                              key={action.status}
                              type="button"
                              disabled={busyId !== null}
                              onClick={() => handleStatusUpdate(assignment, action.status)}
                              className={`rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                action.primary
                                  ? 'bg-ink text-white hover:bg-slate-800'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {busy ? 'Updating…' : action.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-400">
                          This task is {key.replace('_', ' ')}. No further action needed.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {error && assignments.length > 0 ? (
          <div role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div role="status" className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        ) : null}
      </div>
    </section>
  );
}
