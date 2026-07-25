import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import { EmailIcon, LockIcon, PhoneIcon, UserIcon } from '../components/auth/AuthIcons';
import PrimaryButton from '../components/ui/PrimaryButton';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

function PasswordToggle({ shown, onClick }) {
  return <button type="button" onClick={onClick} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-sky-200" aria-label={shown ? 'Hide password' : 'Show password'}>{shown ? 'Hide' : 'Show'}</button>;
}

export default function RegisterPage() {
  const { register: registerUser, clearError, busy, error } = useAuth();
  const { register, handleSubmit, setError, watch, formState: { errors } } = useForm({ defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '' } });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (values) => {
    clearError();
    try {
      const response = await registerUser(values);
      navigate(response.data.dashboard_route ?? '/account', { replace: true });
    } catch (exception) {
      Object.entries(exception?.response?.data?.errors ?? {}).forEach(([name, messages]) => {
        setError(name, { type: 'server', message: messages[0] });
      });
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join as a Citizen today. Volunteer and NGO access can be requested later and is reviewed by an administrator.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput label="Full name" type="text" autoComplete="name" placeholder="Your full name" icon={<UserIcon />} error={errors.name} disabled={busy} {...register('name', { required: 'Full name is required.' })} />
        <AuthInput label="Email address" type="email" autoComplete="email" placeholder="you@example.com" icon={<EmailIcon />} error={errors.email} disabled={busy} {...register('email', { required: 'Email is required.' })} />
        <AuthInput label="Phone number" type="tel" autoComplete="tel" placeholder="e.g. +8801XXXXXXXXX" icon={<PhoneIcon />} error={errors.phone} disabled={busy} {...register('phone', { required: 'Phone number is required.' })} />
        <AuthInput label="Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a strong password" icon={<LockIcon />} error={errors.password} disabled={busy} {...register('password', { required: 'Password is required.' })} trailing={<PasswordToggle shown={showPassword} onClick={() => setShowPassword((current) => !current)} />} />
        <AuthInput label="Confirm password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your password" icon={<LockIcon />} error={errors.password_confirmation} disabled={busy} {...register('password_confirmation', { required: 'Please confirm your password.', validate: (value) => value === password || 'Passwords do not match.' })} trailing={<PasswordToggle shown={showConfirmation} onClick={() => setShowConfirmation((current) => !current)} />} />
        {error ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
        <PrimaryButton type="submit" disabled={busy} className="mt-2 w-full bg-ink py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">
          {busy ? 'Creating account…' : 'Create account'}
        </PrimaryButton>
      </form>
      <p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link className="font-bold text-ink underline decoration-amber-400 decoration-2 underline-offset-4" to="/login">Login</Link></p>
    </AuthLayout>
  );
}
