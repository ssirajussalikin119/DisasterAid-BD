import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function endSession() {
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.common.Authorization;
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((response) => {
        const token = response.data?.data?.token;
        if (!token) {
          throw new Error('Refresh response did not include a token.');
        }
        localStorage.setItem('auth_token', token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token } }));
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const url = config?.url ?? '';

    // Only a real 401 on a retriable call with a stored token triggers a
    // silent refresh. Network errors (no response), non-401 failures, the
    // refresh call itself, and token-less requests pass through untouched,
    // so connectivity problems never end the session.
    if (!config || status !== 401 || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem('auth_token')) {
      return Promise.reject(error);
    }

    // A 401 that survives a refresh means the session cannot continue.
    if (config._retry) {
      endSession();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const token = await refreshSession();
      config.headers.Authorization = `Bearer ${token}`;
      return api(config);
    } catch (refreshError) {
      if (!refreshError.response) {
        // Refresh attempt failed at the network level: keep local auth state
        // and surface the original error instead of logging the user out.
        return Promise.reject(error);
      }
      // The session is genuinely over (expired past the refresh window,
      // logged out, or revoked): clear local auth state so guards redirect.
      endSession();
      return Promise.reject(error);
    }
  },
);

export default api;
