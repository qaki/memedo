/**
 * Etherscan API Adapter (EVM chains)
 * Supports Ethereum, BSC, Polygon, Avalanche, Base
 * Documentation: https://docs.etherscan.io/
 */

import axios from 'axios';
import { Adapter } from '../../services/cafo.service';
import { getCached, setCached, CacheTTL } from '../../services/redis.service';
import { TokenMetadata, Chain, ETHERSCAN_API_URLS } from '../../types/token-analysis';
import { env } from '../../utils/env-validator';

interface EtherscanContractResponse {
  status: string;
  message: string;
  result: Array<{
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
    Implementation: string;
    SwarmSource: string;
  }>;
}

interface EtherscanTokenResponse {
  status: string;
  message: string;
  result: string;
}

export class EtherscanAdapter implements Adapter<TokenMetadata> {
  id = 'etherscan';
  name = 'Etherscan';
  chains = ['ethereum', 'bsc', 'polygon', 'avalanche', 'base'];
  priority = 0; // Primary EVM data adapter

  private readonly API_KEY = env.ETHERSCAN_API_KEY || 'demo'; // Use 'demo' for testing

  /**
   * Get API URL for a given chain
   */
  private getApiUrl(chain: Chain): string {
    const url = ETHERSCAN_API_URLS[chain];
    if (!url) {
      throw new Error(`Chain ${chain} not supported by Etherscan adapter`);
    }
    return url;
  }

  /**
   * Get token metadata
   */
  async execute(address: string, chain: Chain): Promise<TokenMetadata> {
    if (!this.chains.includes(chain)) {
      throw new Error(`Etherscan only supports EVM chains, not ${chain}`);
    }

    // Check cache first
    const cacheKey = `metadata:${chain}:${address}`;
    const cached = await getCached<TokenMetadata>(cacheKey);
    if (cached) return cached;

    console.log(`[Etherscan] Fetching metadata for ${address} on ${chain}...`);

    try {
      const apiUrl = this.getApiUrl(chain);

      // Get contract source code (includes verification status)
      const contractResponse = await axios.get<EtherscanContractResponse>(apiUrl, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address,
          apikey: this.API_KEY,
        },
        timeout: 10000,
      });

      if (contractResponse.data.status !== '1') {
        throw new Error(`Etherscan API error: ${contractResponse.data.message}`);
      }

      const contractData = contractResponse.data.result[0];
      const isVerified = contractData.SourceCode !== '';
      // const isProxy = contractData.Proxy === '1'; // For future proxy detection feature

      // Get token name and symbol
      const [nameResponse, symbolResponse, decimalsResponse, supplyResponse] = await Promise.all([
        this.getTokenInfo(apiUrl, address, 'name'),
        this.getTokenInfo(apiUrl, address, 'symbol'),
        this.getTokenInfo(apiUrl, address, 'decimals'),
        this.getTokenInfo(apiUrl, address, 'totalSupply'),
      ]);

      // Parse token metadata
      const metadata: TokenMetadata = {
        address,
        chain,
        name: this.decodeHex(nameResponse) || 'Unknown',
        symbol: this.decodeHex(symbolResponse) || 'UNKNOWN',
        decimals: parseInt(decimalsResponse) || 18,
        totalSupply: supplyResponse || '0',
        verified: isVerified,
        deployer: undefined, // Can be fetched with additional API call
        createdAt: undefined,
      };

      // Cache result for 1 hour (basic data doesn't change)
      await setCached(cacheKey, metadata, CacheTTL.BASIC_DATA);

      console.log(
        `[Etherscan] ✅ Metadata found: ${metadata.name} (${metadata.symbol}) - Verified: ${isVerified}`
      );

      return metadata;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Contract not found on Etherscan');
        }
        if (error.response?.status === 429) {
          throw new Error('Etherscan rate limit exceeded');
        }
        throw new Error(`Etherscan API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get specific token info (name, symbol, decimals, totalSupply)
   */
  private async getTokenInfo(apiUrl: string, address: string, action: string): Promise<string> {
    try {
      const response = await axios.get<EtherscanTokenResponse>(apiUrl, {
        params: {
          module: 'token',
          action: `token${action}`,
          contractaddress: address,
          apikey: this.API_KEY,
        },
        timeout: 5000,
      });

      if (response.data.status === '1') {
        return response.data.result;
      }

      // Fallback to contract call if token module fails
      return '';
    } catch (error) {
      console.error(`[Etherscan] Failed to get ${action}:`, error);
      return '';
    }
  }

  /**
   * Decode hex string to UTF-8
   */
  private decodeHex(hex: string): string {
    if (!hex || hex === '0x') return '';

    try {
      // Remove 0x prefix if present
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

      // Try to decode as UTF-8
      const bytes = Buffer.from(cleanHex, 'hex');
      return bytes.toString('utf8').replace(/\0/g, '');
    } catch {
      // If decoding fails, return the original string
      return hex;
    }
  }

  /**
   * Get contract creation info (to be implemented in Story 3.6)
   */
  async getContractCreation(address: string, chain: Chain) {
    const apiUrl = this.getApiUrl(chain);

    try {
      const response = await axios.get(apiUrl, {
        params: {
          module: 'contract',
          action: 'getcontractcreation',
          contractaddresses: address,
          apikey: this.API_KEY,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error('[Etherscan] Failed to get contract creation:', error);
      return null;
    }
  }
}

// Singleton instance
export const etherscanAdapter = new EtherscanAdapter();
