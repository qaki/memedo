/**
 * Historical Data Store
 * Manages historical token analysis data and time-series tracking
 */

import { create } from 'zustand';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

export interface HistoricalDataPoint {
  timestamp: string;
  safetyScore: number;
  riskLevel: string;
  priceUSD: number | null;
  liquidityUSD: number | null;
  volume24h: number | null;
  marketCap: number | null;
  holders: number | null;
  top10HolderPercentage: number | null;
  dataCompleteness: number;
}

export interface TokenHistoricalData {
  tokenAddress: string;
  chain: string;
  tokenName: string | null;
  tokenSymbol: string | null;
  totalAnalyses: number;
  dateRange: {
    oldest: string;
    newest: string;
  };
  dataPoints: HistoricalDataPoint[];
  summary: {
    averageSafetyScore: number;
    safetyScoreChange: number;
    priceChange: number | null;
    currentRiskLevel: string;
    previousRiskLevel: string;
    riskLevelChanged: boolean;
  };
}

export interface TokenWithHistory {
  tokenAddress: string;
  chain: string;
  tokenName: string | null;
  tokenSymbol: string | null;
  analysisCount: number;
  firstAnalysis: string;
  lastAnalysis: string;
}

interface HistoricalStore {
  // State
  currentTokenHistory: TokenHistoricalData | null;
  tokensWithHistory: TokenWithHistory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTokenHistory: (tokenAddress: string, chain: string, days?: number) => Promise<void>;
  fetchTokensWithHistory: () => Promise<void>;
  clearHistory: () => void;
  reanalyzeToken: (tokenAddress: string, chain: string) => Promise<void>;
}

export const useHistoricalStore = create<HistoricalStore>((set, get) => ({
  // Initial State
  currentTokenHistory: null,
  tokensWithHistory: [],
  isLoading: false,
  error: null,

  // Fetch historical data for a specific token
  fetchTokenHistory: async (tokenAddress: string, chain: string, days?: number) => {
    set({ isLoading: true, error: null });

    try {
      const params = days ? `?days=${days}` : '';
      const response = await api.get(`/historical/${chain}/${tokenAddress}${params}`);

      if (response.data.success) {
        set({
          currentTokenHistory: response.data.data,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch history');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch token history:', error);
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Failed to fetch historical data';

      set({
        currentTokenHistory: null,
        isLoading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
    }
  },

  // Fetch all tokens with historical data
  fetchTokensWithHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/historical/tokens');

      if (response.data.success) {
        set({
          tokensWithHistory: response.data.data || [],
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch tokens');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch tokens with history:', error);
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Failed to fetch tokens';

      set({
        tokensWithHistory: [],
        isLoading: false,
        error: errorMessage,
      });

      // Don't show toast for this one (might be called on page load)
    }
  },

  // Re-analyze a token (force refresh)
  reanalyzeToken: async (tokenAddress: string, chain: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post('/analysis/reanalyze', {
        address: tokenAddress,
        chain,
      });

      if (response.data.success) {
        toast.success('Token re-analyzed successfully! Refreshing history...');

        // Auto-refresh the history after re-analysis
        await get().fetchTokenHistory(tokenAddress, chain);
      } else {
        throw new Error(response.data.error?.message || 'Re-analysis failed');
      }
    } catch (error: unknown) {
      console.error('Failed to re-analyze token:', error);
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Re-analysis failed';

      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  // Clear current history
  clearHistory: () => {
    set({ currentTokenHistory: null, error: null });
  },
}));
