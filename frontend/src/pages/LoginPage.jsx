import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import { EmailIcon, LockIcon } from '../components/auth/AuthIcons';
import PrimaryButton from '../components/ui/PrimaryButton';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

function EyeIcon({ open }) {
  return open ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" /><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 8.8 5.2 8.8 8s-1.4 4.4-3.4 5.8M6.2 6.2C4.2 7.6 3.2 10 3.2 12c0 2.8 3.6 8 8.8 8 1 0 2-.2 2.9-.6" /></svg> : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3.2 12S6.8 4 12 4s8.8 8 8.8 8-3.6 8-8.8 8-8.8-8-8.8-8Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export default function LoginPage() {
  const { login, clearError, busy, error } = useAuth();
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: { email: '', password: '' } });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (values) => {
    clearError();
    try {
      const response = await login(values);
      navigate(response.data.dashboard_route ?? '/account', { replace: true, state: { from: location.state?.from } });
    } catch (exception) {
      Object.entries(exception?.response?.data?.errors ?? {}).forEach(([name, messages]) => {
        setError(name, { type: 'server', message: messages[0] });
      });
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your DisasterAid BD account and continue supporting your community.">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput label="Email address" type="email" autoComplete="email" placeholder="you@example.com" icon={<EmailIcon />} error={errors.email} disabled={busy} {...register('email', { required: 'Email is required.' })} />
        <AuthInput label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" icon={<LockIcon />} error={errors.password} disabled={busy} {...register('password', { required: 'Password is required.' })} trailing={<button type="button" onClick={() => setShowPassword((current) => !current)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-sky-200" aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon open={showPassword} /></button>} />
        <div className="flex items-center gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            Remember me
          </label>
        </div>
        {error ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
        <PrimaryButton type="submit" disabled={busy} className="w-full bg-ink py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">
          {busy ? 'Signing in…' : 'Login'}
        </PrimaryButton>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">New to DisasterAid BD? <Link className="font-bold text-ink underline decoration-amber-400 decoration-2 underline-offset-4" to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
