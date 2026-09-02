import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { createReport, getOfficialIncidents } from '../services/incidentService';

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
  const [form, setForm] = useState(initialForm);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOfficialIncidents()
      .then((list) => setIncidents(list))
      .catch(() => setIncidents([]));
  }, []);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createReport({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        incident_id: form.incident_id ? Number(form.incident_id) : null,
      });
      navigate('/report-incident-relations');
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to submit this report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-white py-16 text-ink sm:py-20">
          <Container>
            <div className="max-w-3xl"><p className="mb-5 font-display text-lg font-bold text-ink">Community reporting</p><h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Make an urgent situation visible.</h1><p className="mt-5 text-lg leading-9 text-slate-700">Share the details responders need to understand and verify a disaster report.</p></div>
            <form className="mt-12 grid gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8" onSubmit={submit}>
              <div className="grid gap-6 md:grid-cols-2"><FormField label="Title" value={form.title} onChange={updateField('title')} placeholder="Flooding near the market" required /><FormField label="Location" value={form.location} onChange={updateField('location')} placeholder="Area, district or landmark" required /></div>
              <FormField as="textarea" label="Description" rows={5} value={form.description} onChange={updateField('description')} placeholder="Describe what is happening and what people need." required />
              <div className="grid gap-6 md:grid-cols-4">
                <FormField label="Latitude" type="number" step="any" value={form.latitude} onChange={updateField('latitude')} placeholder="23.8103" />
                <FormField label="Longitude" type="number" step="any" value={form.longitude} onChange={updateField('longitude')} placeholder="90.4125" />
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
              {error ? <div role="alert" className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">{error}</div> : null}
              <div className="flex flex-wrap gap-3">
                <PrimaryButton type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit report'}</PrimaryButton>
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