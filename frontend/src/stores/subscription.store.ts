/**
 * Subscription Store
 * Manages subscription state and operations
 */

import { create } from 'zustand';
import { api } from '../lib/api';
import type {
  SubscriptionStatusResponse,
  SubscriptionUsageResponse,
  CheckoutSessionResponse,
} from '@memedo/shared';

interface SubscriptionState {
  // State
  subscription: SubscriptionStatusResponse | null;
  usage: SubscriptionUsageResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscriptionStatus: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  createCheckoutSession: (plan: 'monthly' | 'yearly') => Promise<string>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  updatePlan: (plan: 'monthly' | 'yearly') => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  // Initial state
  subscription: null,
  usage: null,
  isLoading: false,
  error: null,

  // Fetch subscription status
  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SubscriptionStatusResponse>('/api/subscription/status');
      set({ subscription: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to fetch subscription status'
          : 'Failed to fetch subscription status';
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  // Fetch usage statistics
  fetchUsage: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SubscriptionUsageResponse>('/api/subscription/usage');
      set({ usage: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to fetch usage'
          : 'Failed to fetch usage';
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  // Create checkout session and return URL
  createCheckoutSession: async (plan: 'monthly' | 'yearly') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<CheckoutSessionResponse>('/api/subscription/checkout', {
        plan,
      });
      set({ isLoading: false });
      return response.data.checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to create checkout session'
          : 'Failed to create checkout session';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/subscription/cancel');

      // Refetch subscription status
      const response = await api.get<SubscriptionStatusResponse>('/api/subscription/status');
      set({ subscription: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to cancel subscription'
          : 'Failed to cancel subscription';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Reactivate subscription
  reactivateSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/subscription/reactivate');

      // Refetch subscription status
      const response = await api.get<SubscriptionStatusResponse>('/api/subscription/status');
      set({ subscription: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to reactivate subscription'
          : 'Failed to reactivate subscription';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Update subscription plan
  updatePlan: async (plan: 'monthly' | 'yearly') => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/api/subscription/plan', { plan });

      // Refetch subscription status
      const response = await api.get<SubscriptionStatusResponse>('/api/subscription/status');
      set({ subscription: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to update plan:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to update plan'
          : 'Failed to update plan';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
