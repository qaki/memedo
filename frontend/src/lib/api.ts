import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://memedo-backend.onrender.com';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for token analysis
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - Add auth token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (as backup to cookies)
    const token = localStorage.getItem('accessToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // CRITICAL: Skip token refresh for these endpoints to prevent loops
    const skipRefreshEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
    ];

    const requestUrl = originalRequest?.url || '';
    const shouldSkipRefresh = skipRefreshEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    // If 401 and not already retried and not a skip endpoint, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      console.log('[API] 401 on', requestUrl, '- Attempting token refresh');
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/api/auth/refresh');
        console.log('[API] Token refresh successful, retrying original request');

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed, logging out');
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For login/register errors, just reject without refresh attempt
    if (shouldSkipRefresh) {
      console.log('[API] Skipping token refresh for', requestUrl);
    }

    return Promise.reject(error);
  }
);

// API error response type
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// API success response type
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

// Type guard for API errors
export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error) && error.response !== undefined;
};

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

export default api;
