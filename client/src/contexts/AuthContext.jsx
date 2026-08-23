import { createContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, logoutUser, sendOtp, updateProfileUser, verifyOtp } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        const response = await fetchCurrentUser();
        if (!alive) {
          return;
        }

        setUser(response.data.user);
      } catch {
        if (!alive) {
          return;
        }

        setUser(null);
      } finally {
        if (alive) {
          setBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    bootstrapping,
    busy,
    error,
    sendOtp: async (phone) => {
      setBusy(true);
      setError(null);
      try {
        return await sendOtp(phone);
      } catch (exception) {
        setError(exception?.response?.data?.message ?? 'Unable to send an OTP.');
        throw exception;
      } finally {
        setBusy(false);
      }
    },
    verifyOtp: async (payload) => {
      setBusy(true);
      setError(null);
      try {
        const response = await verifyOtp(payload);
        setUser(response.user);
        return response;
      } catch (exception) {
        setUser(null);
        setError(exception?.response?.data?.message ?? 'The OTP could not be verified.');
        throw exception;
      } finally {
        setBusy(false);
      }
    },
    logout: async () => {
      setBusy(true);
      setUser(null);
      try {
        await logoutUser();
      } finally {
        setBusy(false);
      }
    },
    refreshUser: async () => {
      const response = await fetchCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    },
    updateProfile: async (payload) => {
      const response = await updateProfileUser(payload);
      setUser(response.data.user);
      return response.data.user;
    },
    clearError: () => setError(null),
    setUser,
  }), [busy, bootstrapping, error, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
