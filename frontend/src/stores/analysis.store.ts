import { create } from 'zustand';
import api, { getErrorMessage } from '../lib/api';
import type { TokenAnalysis, AnalysisHistoryItem, SupportedChain } from '../types';

interface AnalysisState {
  currentAnalysis: TokenAnalysis | null;
  history: AnalysisHistoryItem[];
  supportedChains: SupportedChain[];
  isAnalyzing: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // Actions
  analyzeToken: (chain: string, contractAddress: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchAnalysisById: (id: string) => Promise<void>;
  fetchSupportedChains: () => Promise<void>;
  clearCurrentAnalysis: () => void;
  clearError: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  history: [],
  supportedChains: [],
  isAnalyzing: false,
  isLoadingHistory: false,
  error: null,

  analyzeToken: async (chain: string, contractAddress: string) => {
    set({ isAnalyzing: true, error: null, currentAnalysis: null });

    try {
      const response = await api.post<{
        success: true;
        data: { analysis: TokenAnalysis };
      }>('/api/analysis/analyze', {
        chain,
        contractAddress,
      });

      const { analysis } = response.data.data;

      set({
        currentAnalysis: analysis,
        isAnalyzing: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        error: message,
        isAnalyzing: false,
        currentAnalysis: null,
      });
      throw error;
    }
  },

  fetchHistory: async () => {
    set({ isLoadingHistory: true, error: null });

    try {
      const response = await api.get<{
        success: true;
        data: { analyses: AnalysisHistoryItem[] };
      }>('/api/analysis/history');

      const { analyses } = response.data.data;

      set({
        history: analyses,
        isLoadingHistory: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        error: message,
        isLoadingHistory: false,
      });
      throw error;
    }
  },

  fetchAnalysisById: async (id: string) => {
    set({ isAnalyzing: true, error: null });

    try {
      const response = await api.get<{
        success: true;
        data: { analysis: TokenAnalysis };
      }>(`/api/analysis/${id}`);

      const { analysis } = response.data.data;

      set({
        currentAnalysis: analysis,
        isAnalyzing: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        error: message,
        isAnalyzing: false,
      });
      throw error;
    }
  },

  fetchSupportedChains: async () => {
    try {
      const response = await api.get<{
        success: true;
        data: { chains: SupportedChain[] };
      }>('/api/analysis/supported-chains');

      const { chains } = response.data.data;

      set({
        supportedChains: chains,
      });
    } catch (error) {
      console.error('Failed to fetch supported chains:', error);
    }
  },

  clearCurrentAnalysis: () => set({ currentAnalysis: null }),

  clearError: () => set({ error: null }),
}));
