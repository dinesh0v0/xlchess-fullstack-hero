/**
 * Axios-based HTTP client with interceptors for auth tokens,
 * error handling, and base URL configuration.
 *
 * Points to the Django REST Framework backend.
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Pre-configured Axios instance for all API requests.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Send session cookies for Django auth
});

// ──────────────────────────────────────────────────
// Request Interceptor
// ──────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    // Attach CSRF token if available (Django session auth)
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1];

    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────
// Response Interceptor
// ──────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Handle unauthorized — redirect to login if needed
        console.warn('[API] Unauthorized request — session may have expired.');
      } else if (status === 403) {
        console.warn('[API] Forbidden — insufficient permissions.');
      } else if (status >= 500) {
        console.error('[API] Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('[API] Network error — no response received.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
