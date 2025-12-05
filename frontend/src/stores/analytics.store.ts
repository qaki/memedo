/**
 * Analytics Store
 *
 * Manages analytics and dashboard statistics state.
 */

import { create } from 'zustand';
import api from '../lib/api';

export interface DashboardStats {
  overview: {
    totalTokens: number;
    averageSafetyScore: number;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
      unknown: number;
    };
    chainDistribution: Record<string, number>;
  };
  topTokens: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    safetyScore: number;
    riskLevel: string;
  }>;
  attentionNeeded: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    safetyScore: number;
    riskLevel: string;
  }>;
  recentActivity: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    addedAt: Date;
  }>;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dashboardStats: null,
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/analytics/dashboard');

      set({
        dashboardStats: response.data.data,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch dashboard stats:', error);
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      set({
        error: errorMessage || 'Failed to load analytics',
        isLoading: false,
      });
    }
  },
}));
