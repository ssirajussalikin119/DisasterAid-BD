import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { submitVolunteerApplication } from '../services/authService';

export default function ApplyVolunteerPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ district: '', skills: '', motivation: '', availability: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    try {
      await submitVolunteerApplication({
        district: form.district,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        motivation: form.motivation,
        availability: form.availability,
      });
      await refreshUser();
      setMessage('Volunteer application submitted and marked pending.');
      navigate('/account', { replace: true });
    } catch (exception) {
      setErrors(exception?.response?.data?.errors ?? {});
      setMessage(exception?.response?.data?.message ?? 'Unable to submit volunteer application.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sea">Volunteer application</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Apply as Volunteer</h1>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <Field label="District" name="district" value={form.district} onChange={handleChange} error={errors.district?.[0]} required />
        <Field label="Skills" name="skills" value={form.skills} onChange={handleChange} error={errors.skills?.[0]} placeholder="first aid, logistics, communication" required />
        <Field label="Motivation" name="motivation" as="textarea" rows="5" value={form.motivation} onChange={handleChange} error={errors.motivation?.[0]} required />
        <Field label="Availability" name="availability" value={form.availability} onChange={handleChange} error={errors.availability?.[0]} placeholder="Weekends, evenings, during emergencies" required />
        {message ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate">{message}</div> : null}
        <PrimaryButton type="submit" loading={busy}>Submit Application</PrimaryButton>
      </form>
    </div>
  );
}
