import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import { PhoneIcon } from '../components/auth/AuthIcons';
import PrimaryButton from '../components/ui/PrimaryButton';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

const phonePattern = /^\+8801[3-9]\d{8}$/;

export default function OtpPage() {
  const { sendOtp, verifyOtp, clearError, busy, error } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [fieldError, setFieldError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const requestOtp = async (event) => {
    event.preventDefault();
    clearError();
    setFieldError('');

    if (!phonePattern.test(phone)) {
      setFieldError('Use a Bangladesh number in the format +8801XXXXXXXXX.');
      return;
    }

    try {
      await sendOtp(phone);
      setStep('code');
      setSecondsLeft(300);
    } catch (exception) {
      const message = exception?.response?.data?.errors?.phone?.[0];
      if (message) {
        setFieldError(message);
      }
    }
  };

  const submitCode = async (event) => {
    event.preventDefault();
    clearError();
    setFieldError('');

    if (!/^\d{6}$/.test(code)) {
      setFieldError('Enter the six-digit code from the message.');
      return;
    }

    try {
      const response = await verifyOtp({ phone, code });
      navigate(response.dashboard_route ?? '/account', { replace: true, state: { from: location.state?.from } });
    } catch (exception) {
      const message = exception?.response?.data?.errors?.code?.[0];
      if (message) {
        setFieldError(message);
      }
    }
  };

  const resend = async () => {
    if (secondsLeft > 240 || busy) {
      return;
    }

    clearError();
    setFieldError('');
    try {
      await sendOtp(phone);
      setSecondsLeft(300);
    } catch (exception) {
      const message = exception?.response?.data?.errors?.phone?.[0];
      if (message) {
        setFieldError(message);
      }
    }
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <AuthLayout
      title={step === 'phone' ? 'Sign in with your phone' : 'Enter your OTP'}
      subtitle={step === 'phone' ? 'Use your Bangladesh phone number to access DisasterAid BD or create a new citizen account.' : `We sent a six-digit code to ${phone}.`}
    >
      {step === 'phone' ? (
        <form className="space-y-5" onSubmit={requestOtp} noValidate>
          <AuthInput label="Phone number" type="tel" autoComplete="tel" placeholder="+8801XXXXXXXXX" icon={<PhoneIcon />} value={phone} onChange={(event) => setPhone(event.target.value)} error={fieldError ? { message: fieldError } : null} disabled={busy} autoFocus />
          {error ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
          <PrimaryButton type="submit" disabled={busy} className="w-full bg-ink py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
            {busy ? 'Sending code...' : 'Send OTP'}
          </PrimaryButton>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={submitCode} noValidate>
          <AuthInput label="Six-digit code" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} error={fieldError ? { message: fieldError } : null} disabled={busy} autoFocus />
          {error ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
          <PrimaryButton type="submit" disabled={busy} className="w-full bg-ink py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
            {busy ? 'Verifying...' : 'Verify and continue'}
          </PrimaryButton>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep('phone'); setCode(''); setSecondsLeft(0); clearError(); }} className="font-semibold text-slate-600 underline underline-offset-4 hover:text-ink">Change number</button>
            <button type="button" onClick={resend} disabled={secondsLeft > 240 || busy} className="font-semibold text-sky-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-slate-400">{secondsLeft > 0 ? `Resend in ${minutes}:${seconds}` : 'Resend OTP'}</button>
          </div>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-slate-600">Protected access for citizens and responders. <Link className="font-bold text-ink underline decoration-amber-400 decoration-2 underline-offset-4" to="/">Return home</Link></p>
    </AuthLayout>
  );
}