import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/common/Container';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import FormField from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { deleteReport, getIncidents, normalizeIncident, updateReport } from '../services/incidentService';

const severityStyles = {
  Critical: 'border-ember/30 bg-ember/10 text-ember',
  High: 'border-ember/30 bg-ember/10 text-ember',
  Medium: '',
  Low: 'border-forest/30 bg-forest/10 text-forest',
};

const statusStyles = {
  Resolved: 'border-forest/30 bg-forest/10 text-forest',
};

const emptyForm = { title: '', description: '', location: '', latitude: '', longitude: '', severity: 'medium' };

function formatDate(value) {
  if (!value) return 'Recently reported';
  return new Date(value).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function IncidentListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedIncidentId = searchParams.get('incident');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingId, setSavingId] = useState(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      setIncidents(await getIncidents());
      setApiError('');
    } catch {
      setApiError('Live report data is unavailable. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const statuses = ['All', ...new Set(incidents.map((item) => item.status))];
  const filteredIncidents = useMemo(() => incidents.filter((incident) => {
    if (selectedIncidentId && String(incident.id) !== selectedIncidentId) return false;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [incident.title, incident.location, incident.description].some((value) => String(value).toLowerCase().includes(query));
    return matchesSearch && (severityFilter === 'All' || incident.severity === severityFilter) && (statusFilter === 'All' || incident.status === statusFilter);
  }), [incidents, searchTerm, severityFilter, statusFilter, selectedIncidentId]);

  const ownReport = (incident) => user && String(incident.userId) === String(user.id);
  const criticalCount = incidents.filter((incident) => incident.severity === 'Critical').length;
  const resolvedCount = incidents.filter((incident) => incident.status === 'Resolved').length;

  const startEditing = (incident) => {
    setEditingId(incident.id);
    setEditForm({ title: incident.title, description: incident.description, location: incident.location, latitude: incident.latitude ?? '', longitude: incident.longitude ?? '', severity: incident.severity.toLowerCase() });
  };

  const saveEdit = async (event, incident) => {
    event.preventDefault();
    setSavingId(incident.id);
    try {
      const updated = await updateReport(incident.id, editForm);
      setIncidents((current) => current.map((item) => item.id === incident.id ? normalizeIncident(updated) : item));
      setEditingId(null);
    } catch (exception) {
      setApiError(exception?.response?.data?.message ?? 'Unable to update this report.');
    } finally {
      setSavingId(null);
    }
  };

  const removeReport = async (incident) => {
    if (!window.confirm(`Delete "${incident.title}"?`)) return;
    try {
      await deleteReport(incident.id);
      setIncidents((current) => current.filter((item) => item.id !== incident.id));
    } catch (exception) {
      setApiError(exception?.response?.data?.message ?? 'Unable to delete this report.');
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-white py-16 text-ink sm:py-20">
          <Container>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl"><p className="mb-5 font-display text-lg font-bold text-ink">Active Reports</p><h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Verified disaster reports across Bangladesh.</h1><p className="mt-5 text-lg leading-9 text-slate-700">Browse community reports, understand current response needs, and help make urgent situations visible.</p></div>
              <div className="flex flex-wrap gap-3">
                <PrimaryButton to="/incidents/new">Report an incident</PrimaryButton>
                <SecondaryButton to="/report-incident-relations" className="border-slate-300 bg-white text-ink hover:bg-slate-50">
                  SQL Relational Matrix
                </SecondaryButton>
              </div>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-3"><StatCard value={incidents.length} label="Total reports" /><StatCard value={criticalCount} label="Critical reports" /><StatCard value={resolvedCount} label="Resolved reports" /></div>
          </Container>
        </section>

        <section className="py-12 sm:py-16">
          <Container>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px]"><FormField label="Search reports" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by title, location or description" /><FormField as="select" label="Severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>{['All', 'Critical', 'High', 'Medium', 'Low'].map((value) => <option key={value}>{value}</option>)}</FormField><FormField as="select" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</FormField></div>
            </div>

            <div className="mt-12 flex items-end justify-between gap-4"><div><h2 className="font-display text-2xl font-bold tracking-tight text-ink">Incident reports</h2><p className="mt-2 text-base leading-7 text-slate-700">Showing {filteredIncidents.length} of {incidents.length} reports</p></div>{selectedIncidentId ? <SecondaryButton to="/incidents" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Show all</SecondaryButton> : null}</div>
            {apiError ? <div role="alert" className="mt-6 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{apiError}</div> : null}
            {loading ? <p className="mt-10 text-base text-slate-700">Loading reports...</p> : null}
            {!loading && filteredIncidents.length === 0 ? <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h3 className="font-display text-2xl font-bold text-ink">No reports found</h3><p className="mt-2 text-base leading-7 text-slate-700">New reports will appear here after they are submitted.</p></div> : null}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {filteredIncidents.map((incident) => (
                <article key={incident.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-3"><Badge className={severityStyles[incident.severity]}>{incident.severity}</Badge><Badge className={statusStyles[incident.status]}>{incident.status}</Badge></div>
                  <p className="mt-6 text-sm font-semibold text-slate-700">{incident.location}</p><h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{incident.title}</h3><p className="mt-4 text-base leading-7 text-slate-700">{incident.description}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-sm text-slate-700"><span>Reported {formatDate(incident.reportedAt)}</span>{incident.latitude !== null && incident.longitude !== null ? <Link className="font-semibold text-sky-600 hover:text-sky-700" to={`/map?incident=${encodeURIComponent(incident.id)}`}>View location</Link> : null}</div>
                  {ownReport(incident) ? editingId === incident.id ? (
                    <form className="mt-6 grid gap-4 border-t border-slate-100 pt-5" onSubmit={(event) => saveEdit(event, incident)}><FormField label="Title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required /><FormField as="textarea" label="Description" rows={3} value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} required /><FormField label="Location" value={editForm.location} onChange={(event) => setEditForm({ ...editForm, location: event.target.value })} required /><FormField as="select" label="Severity" value={editForm.severity} onChange={(event) => setEditForm({ ...editForm, severity: event.target.value })}>{['low', 'medium', 'high', 'critical'].map((value) => <option key={value}>{value}</option>)}</FormField><div className="flex flex-wrap gap-3"><PrimaryButton type="submit" disabled={savingId === incident.id}>{savingId === incident.id ? 'Saving...' : 'Save changes'}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditingId(null)} className="border-slate-300 bg-white text-ink hover:bg-slate-50">Cancel</SecondaryButton></div></form>
                  ) : <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5"><SecondaryButton type="button" onClick={() => startEditing(incident)} className="border-slate-300 bg-white text-ink hover:bg-slate-50">Edit report</SecondaryButton><SecondaryButton type="button" onClick={() => removeReport(incident)} className="border-ember/30 bg-white text-ember hover:bg-ember/10">Delete</SecondaryButton></div> : null}
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}