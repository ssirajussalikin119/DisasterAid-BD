import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { submitNgoApplication } from '../services/authService';

export default function ApplyNgoPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: '',
    registration_number: '',
    contact_person: '',
    contact_phone: '',
    address: '',
    mission: '',
  });
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
      await submitNgoApplication(form);
      await refreshUser();
      setMessage('NGO application submitted and marked pending.');
      navigate('/account', { replace: true });
    } catch (exception) {
      setErrors(exception?.response?.data?.errors ?? {});
      setMessage(exception?.response?.data?.message ?? 'Unable to submit NGO application.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sea">NGO application</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Apply as NGO</h1>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <Field label="Organization Name" name="organization_name" value={form.organization_name} onChange={handleChange} error={errors.organization_name?.[0]} required />
        <Field label="Registration Number" name="registration_number" value={form.registration_number} onChange={handleChange} error={errors.registration_number?.[0]} required />
        <Field label="Contact Person" name="contact_person" value={form.contact_person} onChange={handleChange} error={errors.contact_person?.[0]} required />
        <Field label="Contact Phone" name="contact_phone" type="tel" value={form.contact_phone} onChange={handleChange} error={errors.contact_phone?.[0]} required />
        <Field label="Address" name="address" as="textarea" rows="4" value={form.address} onChange={handleChange} error={errors.address?.[0]} required />
        <Field label="Mission" name="mission" as="textarea" rows="5" value={form.mission} onChange={handleChange} error={errors.mission?.[0]} required />
        {message ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate">{message}</div> : null}
        <PrimaryButton type="submit" loading={busy}>Submit Application</PrimaryButton>
      </form>
    </div>
  );
}
