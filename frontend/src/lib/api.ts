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

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/api/auth/refresh');

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
