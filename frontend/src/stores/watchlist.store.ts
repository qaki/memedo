/**
 * Watchlist Store
 *
 * Manages user watchlist state and API calls.
 */

import { create } from 'zustand';
import api from '../lib/api';

export interface WatchlistItem {
  id: string;
  tokenAddress: string;
  chain: string;
  tokenName: string | null;
  tokenSymbol: string | null;
  addedAt: string;
  latestAnalysis?: {
    safetyScore: number;
    riskLevel: string;
    priceUSD: number;
    analyzedAt: string;
  };
}

interface WatchlistState {
  watchlist: WatchlistItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWatchlist: () => Promise<void>;
  addToWatchlist: (
    tokenAddress: string,
    chain: string,
    tokenName?: string,
    tokenSymbol?: string
  ) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  isInWatchlist: (tokenAddress: string, chain: string) => boolean;
  clearError: () => void;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],
  isLoading: false,
  error: null,

  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/watchlist');

      set({
        watchlist: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch watchlist:', error);
      set({
        error: error.response?.data?.message || 'Failed to load watchlist',
        isLoading: false,
      });
    }
  },

  addToWatchlist: async (
    tokenAddress: string,
    chain: string,
    tokenName?: string,
    tokenSymbol?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/watchlist', {
        tokenAddress,
        chain,
        tokenName,
        tokenSymbol,
      });

      // Refresh watchlist
      await get().fetchWatchlist();

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Failed to add to watchlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add token to watchlist';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  removeFromWatchlist: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/watchlist/${id}`);

      // Remove from local state immediately
      set((state) => ({
        watchlist: state.watchlist.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Failed to remove from watchlist:', error);
      set({
        error: error.response?.data?.message || 'Failed to remove token from watchlist',
        isLoading: false,
      });
    }
  },

  isInWatchlist: (tokenAddress: string, chain: string) => {
    const watchlist = get().watchlist;
    return watchlist.some(
      (item) =>
        item.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() && item.chain === chain
    );
  },

  clearError: () => set({ error: null }),
}));
