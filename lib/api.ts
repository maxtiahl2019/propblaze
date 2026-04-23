import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Base URL resolution:
 *  - Browser: '' (empty string) → relative paths → same origin, /api prefix added per call
 *  - Server-side: use NEXT_PUBLIC_APP_URL if set
 *
 * All API routes live at /api/* (Next.js route handlers).
 * External FastAPI backend is NOT used in the current architecture.
 * baseURL = '/api' so api.get('/properties/123') → GET /api/properties/123
 */
const BASE =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api'
    : '/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Auth token injection ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 401 handler: attempt token refresh, then redirect to /login ────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try /api/auth/refresh if a refresh_token exists
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return api(originalRequest);
        } catch {
          // Refresh failed — clear tokens and send to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
