/**
 * BirdEye Adapter
 * Provides market data, trade volume, and holder distribution
 *
 * API Endpoints:
 * - /defi/v3/token/market-data/single - Price, liquidity, market cap
 * - /defi/v3/token/trade-data/single - 24h volume
 * - /defi/v3/token/holder - Top holders distribution
 */

import { Adapter } from '../../services/cafo.service.js';
import axios from 'axios';
import { logger } from '../../utils/logger.js';

const BASE_URL = 'https://public-api.birdeye.so';
const API_KEY = process.env.BIRDEYE_API_KEY || '';

// Market data response from BirdEye
export interface BirdEyeMarketData {
  price: number;
  liquidity: number;
  market_cap: number;
  total_supply: number;
  v24hUSD?: number; // Sometimes included here
  v24hChangePercent?: number;
}

// Trade data response from BirdEye
export interface BirdEyeTradeData {
  volume_24h_usd: number;
  volume_buy_24h_usd: number;
  volume_sell_24h_usd: number;
  trade_24h_change_percent: number;
  buy_24h?: number;
  sell_24h?: number;
}

// Holder data response from BirdEye
export interface BirdEyeHolder {
  owner: string;
  ui_amount: number;
  owner_percentage?: number;
}

export interface BirdEyeHoldersResponse {
  items: BirdEyeHolder[];
  total?: number;
}

// Combined market health metrics
export interface MarketHealthMetrics {
  // Market Data
  priceUSD: number;
  totalLiquidityUSD: number;
  marketCapUSD: number;
  totalSupply: number;

  // Trade Data
  volume24hUSD: number;
  volumeBuy24hUSD: number;
  volumeSell24hUSD: number;
  volume24hChangePercent: number;

  // Holder Data
  totalHolders: number;
  top10HolderPercentage: number;
  top10Holders: Array<{
    address: string;
    balance: number;
    percentage: number;
  }>;

  // Calculated Risk Flags
  isLowLiquidity: boolean; // < $50,000
  isLowVolume: boolean; // < $10,000/24h
  isHighConcentration: boolean; // Top 10 > 30%
}

// Chain ID mapping for BirdEye
const BIRDEYE_CHAIN_MAP: Record<string, string> = {
  solana: 'solana',
  ethereum: 'ethereum',
  bsc: 'bsc',
  polygon: 'polygon',
  avalanche: 'avalanche',
  base: 'base',
};

class BirdEyeAdapter implements Adapter<MarketHealthMetrics> {
  id = 'birdeye';
  name = 'BirdEye Market Data';
  chains = ['ethereum', 'solana', 'bsc', 'base', 'polygon', 'avalanche'];
  priority = 0; // Primary source for market data

  /**
   * Execute - Main entry point
   * Fetches and combines all market health metrics
   */
  async execute(address: string, chain: string): Promise<MarketHealthMetrics> {
    // ⚠️ CRITICAL: Check if API key is configured
    if (!API_KEY) {
      logger.warn(`[BirdEye] ⚠️ BIRDEYE_API_KEY not configured - skipping market data`);
      throw new Error('BIRDEYE_API_KEY not configured');
    }

    logger.info(`[BirdEye] Fetching market health for ${address} on ${chain}`);

    const birdeyeChain = BIRDEYE_CHAIN_MAP[chain.toLowerCase()];
    if (!birdeyeChain) {
      throw new Error(`Chain ${chain} not supported by BirdEye`);
    }

    // Fetch all three endpoints in parallel
    const [marketData, tradeData, holdersData] = await Promise.allSettled([
      this.fetchMarketData(address, birdeyeChain),
      this.fetchTradeData(address, birdeyeChain),
      this.fetchHolders(address, birdeyeChain),
    ]);

    // Extract data or use defaults
    const market = marketData.status === 'fulfilled' ? marketData.value : null;
    const trade = tradeData.status === 'fulfilled' ? tradeData.value : null;
    const holders = holdersData.status === 'fulfilled' ? holdersData.value : null;

    if (!market && !trade && !holders) {
      throw new Error('All BirdEye endpoints failed');
    }

    // Calculate top 10 holder percentage
    let top10Percentage = 0;
    const top10List: Array<{ address: string; balance: number; percentage: number }> = [];

    if (holders && holders.items.length > 0 && market?.total_supply) {
      const totalSupply = market.total_supply;
      const top10 = holders.items.slice(0, 10);

      top10.forEach((holder) => {
        const percentage = (holder.ui_amount / totalSupply) * 100;
        top10Percentage += percentage;

        top10List.push({
          address: holder.owner,
          balance: holder.ui_amount,
          percentage: percentage,
        });
      });
    }

    // Build combined metrics
    const metrics: MarketHealthMetrics = {
      // Market Data
      priceUSD: market?.price || 0,
      totalLiquidityUSD: market?.liquidity || 0,
      marketCapUSD: market?.market_cap || 0,
      totalSupply: market?.total_supply || 0,

      // Trade Data
      volume24hUSD: trade?.volume_24h_usd || market?.v24hUSD || 0,
      volumeBuy24hUSD: trade?.volume_buy_24h_usd || 0,
      volumeSell24hUSD: trade?.volume_sell_24h_usd || 0,
      volume24hChangePercent: trade?.trade_24h_change_percent || market?.v24hChangePercent || 0,

      // Holder Data
      totalHolders: holders?.total || holders?.items.length || 0,
      top10HolderPercentage: top10Percentage,
      top10Holders: top10List,

      // Calculated Risk Flags
      isLowLiquidity: (market?.liquidity || 0) < 50000,
      isLowVolume: (trade?.volume_24h_usd || market?.v24hUSD || 0) < 10000,
      isHighConcentration: top10Percentage > 30,
    };

    logger.info(
      `[BirdEye] ✅ Market health fetched: Liquidity=$${metrics.totalLiquidityUSD.toLocaleString()}, Volume24h=$${metrics.volume24hUSD.toLocaleString()}`
    );

    return metrics;
  }

  /**
   * Fetch market data (price, liquidity, market cap)
   */
  private async fetchMarketData(address: string, chain: string): Promise<BirdEyeMarketData> {
    const url = `${BASE_URL}/defi/v3/token/market-data/single`;

    try {
      const response = await axios.get(url, {
        params: {
          address,
          chain,
        },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      if (!response.data?.data) {
        throw new Error('No market data returned');
      }

      return response.data.data as BirdEyeMarketData;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      logger.error(`[BirdEye] Market data fetch failed: ${status} - ${message}`);
      if (status === 401 || status === 403) {
        logger.error(`[BirdEye] ❌ Authentication failed - check BIRDEYE_API_KEY`);
      }
      throw error;
    }
  }

  /**
   * Fetch trade data (24h volume)
   */
  private async fetchTradeData(address: string, chain: string): Promise<BirdEyeTradeData> {
    const url = `${BASE_URL}/defi/v3/token/trade-data/single`;

    try {
      const response = await axios.get(url, {
        params: {
          address,
          chain,
          type: '24h', // 24-hour timeframe
        },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      if (!response.data?.data) {
        throw new Error('No trade data returned');
      }

      return response.data.data as BirdEyeTradeData;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      logger.error(`[BirdEye] Trade data fetch failed: ${status} - ${message}`);
      if (status === 401 || status === 403) {
        logger.error(`[BirdEye] ❌ Authentication failed - check BIRDEYE_API_KEY`);
      }
      throw error;
    }
  }

  /**
   * Fetch holder distribution (top holders)
   */
  private async fetchHolders(address: string, chain: string): Promise<BirdEyeHoldersResponse> {
    const url = `${BASE_URL}/defi/v3/token/holder`;

    try {
      const response = await axios.get(url, {
        params: {
          address,
          chain,
          limit: 50, // Get top 50, we'll use top 10
          offset: 0,
        },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      if (!response.data?.data?.items) {
        throw new Error('No holder data returned');
      }

      return {
        items: response.data.data.items,
        total: response.data.data.total,
      };
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      logger.error(`[BirdEye] Holder data fetch failed: ${status} - ${message}`);
      if (status === 401 || status === 403) {
        logger.error(`[BirdEye] ❌ Authentication failed - check BIRDEYE_API_KEY`);
      }
      throw error;
    }
  }

  /**
   * Get request headers with API key
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (API_KEY) {
      headers['X-API-KEY'] = API_KEY;
    }

    return headers;
  }
}

// Export singleton instance
export const birdeyeAdapter = new BirdEyeAdapter();
