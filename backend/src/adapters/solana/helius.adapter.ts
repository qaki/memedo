/**
 * Helius API Adapter (Solana)
 * Provides comprehensive Solana token data
 * Documentation: https://docs.helius.dev/
 */

import axios from 'axios';
import { Adapter } from '../../services/cafo.service';
import { getCached, setCached, CacheTTL } from '../../services/redis.service';
import { TokenMetadata, HolderDistribution, Chain } from '../../types/token-analysis';
import { env } from '../../utils/env-validator';

interface HeliusTokenMetadata {
  account: string;
  onChainAccountInfo: {
    accountInfo: {
      data: {
        parsed: {
          info: {
            decimals: number;
            freezeAuthority: string | null;
            isInitialized: boolean;
            mintAuthority: string | null;
            supply: string;
          };
        };
      };
    };
  };
  onChainMetadata: {
    metadata: {
      data: {
        name: string;
        symbol: string;
        uri: string;
      };
    };
  };
  offChainMetadata?: {
    metadata: {
      name?: string;
      symbol?: string;
      image?: string;
      description?: string;
    };
    uri?: string;
  };
}

export class HeliusAdapter implements Adapter<TokenMetadata> {
  id = 'helius';
  name = 'Helius';
  chains = ['solana'];
  priority = 0; // Primary Solana data adapter

  private readonly API_KEY = env.HELIUS_API_KEY || 'demo'; // Use 'demo' for testing
  private readonly BASE_URL = 'https://api.helius.xyz/v0';

  /**
   * Get token metadata
   */
  async execute(address: string, chain: Chain): Promise<TokenMetadata> {
    if (chain !== 'solana') {
      throw new Error('Helius only supports Solana');
    }

    // Check cache first
    const cacheKey = `metadata:${chain}:${address}`;
    const cached = await getCached<TokenMetadata>(cacheKey);
    if (cached) return cached;

    console.log(`[Helius] Fetching metadata for ${address}...`);

    try {
      // Call Helius token metadata API
      const response = await axios.get<HeliusTokenMetadata[]>(`${this.BASE_URL}/token-metadata`, {
        params: {
          'api-key': this.API_KEY,
          mint: address,
        },
        timeout: 10000,
      });

      const data = response.data[0];
      if (!data) {
        throw new Error('Token not found on Helius');
      }

      const onChainInfo = data.onChainAccountInfo?.accountInfo?.data?.parsed?.info;
      const onChainMeta = data.onChainMetadata?.metadata?.data;
      const offChainMeta = data.offChainMetadata?.metadata;

      // Parse token metadata
      const metadata: TokenMetadata = {
        address,
        chain: 'solana',
        name: offChainMeta?.name || onChainMeta?.name || 'Unknown',
        symbol: offChainMeta?.symbol || onChainMeta?.symbol || 'UNKNOWN',
        decimals: onChainInfo?.decimals || 9,
        totalSupply: onChainInfo?.supply || '0',
        imageUrl: offChainMeta?.image,
        description: offChainMeta?.description,
        verified: true, // Helius returns verified tokens
        createdAt: undefined,
        deployer: undefined,
      };

      // Cache result for 1 hour (basic data doesn't change)
      await setCached(cacheKey, metadata, CacheTTL.BASIC_DATA);

      console.log(`[Helius] ✅ Metadata found: ${metadata.name} (${metadata.symbol})`);

      return metadata;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Token not found on Helius');
        }
        if (error.response?.status === 429) {
          throw new Error('Helius rate limit exceeded');
        }
        throw new Error(`Helius API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get holder distribution (to be implemented in Story 3.6)
   */
  async getHolderDistribution(address: string): Promise<HolderDistribution> {
    // Check cache first
    const cacheKey = `holders:solana:${address}`;
    const cached = await getCached<HolderDistribution>(cacheKey);
    if (cached) return cached;

    console.log(`[Helius] Fetching holder distribution for ${address}...`);

    // This would use Helius RPC or DAS API
    // For now, return mock data (to be implemented when API key is available)
    const holders: HolderDistribution = {
      totalHolders: 0,
      top10Holders: [],
      top10Concentration: 0,
      top20Concentration: 0,
    };

    await setCached(cacheKey, holders, CacheTTL.TRENDING_DATA);

    return holders;
  }
}

// Singleton instance
export const heliusAdapter = new HeliusAdapter();
