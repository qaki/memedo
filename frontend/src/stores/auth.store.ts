import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { getErrorMessage } from '../lib/api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  init: () => () => void; // Returns cleanup function
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { display_name: string }) => Promise<void>;
  changePassword: (data: { current_password: string; new_password: string }) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize: Listen for auth state changes from API interceptor
      init: () => {
        // Listen for custom events from API interceptor
        const handleSessionExpired = () => {
          console.log('[AuthStore] Session expired event received, clearing state');
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);

        // Also check if localStorage was cleared while we were persisted
        const checkAuthSync = () => {
          const hasToken = localStorage.getItem('accessToken');
          const isAuth = get().isAuthenticated;

          if (isAuth && !hasToken) {
            console.log('[AuthStore] Auth state out of sync, clearing');
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          }
        };

        // Check on focus (when user returns to tab)
        window.addEventListener('focus', checkAuthSync);

        // Check every 30 seconds
        const interval = setInterval(checkAuthSync, 30000);

        // Cleanup function
        return () => {
          window.removeEventListener('auth:session-expired', handleSessionExpired);
          window.removeEventListener('focus', checkAuthSync);
          clearInterval(interval);
        };
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ success: true; data: AuthResponse }>(
            '/api/auth/login',
            credentials
          );

          const { user, accessToken } = response.data.data;

          // Store access token in localStorage
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          await api.post<{ success: true; data: AuthResponse }>('/api/auth/register', data);

          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          localStorage.removeItem('accessToken');
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post<{
            success: true;
            data: { message: string; accessToken?: string };
          }>('/api/auth/refresh');

          // Store new access token in localStorage
          const { accessToken } = response.data.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }

          // If successful, fetch the updated profile
          await get().fetchProfile();
        } catch (error) {
          // Refresh failed, logout
          get().logout();
          throw error;
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<{ success: true; data: { user: User } }>('/api/user/me');

          const { user } = response.data.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.log('[AuthStore] fetchProfile failed, clearing auth state');
          // Clear auth state on failure (expired session, etc.)
          set({
            error: null, // Don't show error for expired sessions
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      updateProfile: async (data: { display_name: string }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.patch<{ success: true; data: { user: User } }>(
            '/api/user/me',
            data
          );

          const { user } = response.data.data;

          set({
            user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (data: { current_password: string; new_password: string }) => {
        set({ isLoading: true, error: null });

        try {
          await api.post('/api/user/change-password', data);

          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => set({ user, isAuthenticated: user !== null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
