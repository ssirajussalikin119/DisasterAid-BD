import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ReportLocationPicker from '../components/map/ReportLocationPicker';
import { createReport, getOfficialIncidents } from '../services/incidentService';
import { useAuth } from '../hooks/useAuth';

const initialForm = {
  title: '',
  description: '',
  location: '',
  latitude: '',
  longitude: '',
  severity: 'medium',
  incident_id: '',
};

export default function CreateReportPage() {
  const navigate = useNavigate();
  const { isAuthenticated, bootstrapping } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getOfficialIncidents()
      .then((list) => setIncidents(list))
      .catch(() => setIncidents([]));
  }, []);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleLocationSelection = ({ location, latitude, longitude }) => {
    setForm((current) => ({
      ...current,
      location: location || current.location,
      latitude: latitude !== '' && latitude != null ? String(latitude) : '',
      longitude: longitude !== '' && longitude != null ? String(longitude) : '',
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError('Please log in to submit a report.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await createReport({
        title: form.title,
        description: form.description,
        location: form.location,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        severity: form.severity,
        incident_id: form.incident_id ? Number(form.incident_id) : null,
      });
      window.dispatchEvent(new CustomEvent('disasteraid:report-created'));
      setSubmitted(true);
    } catch (exception) {
      const status = exception?.response?.status;
      if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(exception?.response?.data?.message ?? 'Unable to submit this report.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-mist text-ink">
        <Navbar />
        <main>
          <section className="relative overflow-hidden bg-white py-16 text-ink sm:py-20">
            <Container>
              <div className="mx-auto max-w-lg text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-emerald-600">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Report submitted</h1>
                <p className="mt-4 text-lg leading-8 text-slate-700">
                  Your report has been submitted successfully. It will be reviewed and verified by an administrator before appearing on the public disaster map.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/map"
                    className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700"
                  >
                    View Disaster Map
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); setForm(initialForm); setError(''); }}
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-slate-50"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            </Container>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-white py-16 text-ink sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-5 font-display text-lg font-bold text-ink">Community reporting</p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Make an urgent situation visible.</h1>
              <p className="mt-5 text-lg leading-9 text-slate-700">Share the details responders need to understand and verify a disaster report.</p>
            </div>
            <form className="mt-12 grid gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8" onSubmit={submit}>
              <FormField label="Title" value={form.title} onChange={updateField('title')} placeholder="Flooding near the market" required />

              <ReportLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                location={form.location}
                onSelectionChange={handleLocationSelection}
              />

              <FormField label="Location" value={form.location} onChange={updateField('location')} placeholder="Auto-filled from map selection above" required />

              <FormField as="textarea" label="Description" rows={5} value={form.description} onChange={updateField('description')} placeholder="Describe what is happening and what people need." required />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField as="select" label="Severity" value={form.severity} onChange={updateField('severity')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </FormField>
                <FormField as="select" label="Link to Incident (Optional)" value={form.incident_id} onChange={updateField('incident_id')}>
                  <option value="">None (Standalone / Unlinked)</option>
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      INC-{inc.id}: {inc.title} ({inc.district})
                    </option>
                  ))}
                </FormField>
              </div>

              {!bootstrapping && !isAuthenticated && (
                <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  You must be logged in to submit a report.{' '}
                  <Link to="/login" className="underline hover:text-amber-900">Log in here</Link>
                </div>
              )}

              {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
              <div className="flex flex-wrap gap-3">
                <PrimaryButton type="submit" disabled={busy || !isAuthenticated}>{busy ? 'Submitting...' : 'Submit report'}</PrimaryButton>
                <SecondaryButton to="/report-incident-relations" className="border-slate-300 bg-white text-ink hover:bg-slate-50">Cancel</SecondaryButton>
              </div>
            </form>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
