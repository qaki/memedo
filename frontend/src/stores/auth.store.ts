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

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ success: true; data: AuthResponse }>(
            '/api/auth/login',
            credentials
          );

          const { user } = response.data.data;

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
          await api.post('/api/auth/refresh');
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
