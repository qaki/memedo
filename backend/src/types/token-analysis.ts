/**
 * Shared types for token analysis across all adapters
 */

// Supported blockchain networks
export type Chain = 'ethereum' | 'solana' | 'bsc' | 'base' | 'polygon' | 'avalanche';

// Token metadata (basic info)
export interface TokenMetadata {
  address: string;
  chain: Chain;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  imageUrl?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  verified: boolean; // Contract verified on explorer
  createdAt?: Date;
  deployer?: string;
}

// Holder distribution analysis
export interface HolderDistribution {
  totalHolders: number;
  top10Holders: Array<{
    address: string;
    balance: string;
    percentage: number;
  }>;
  top10Concentration: number; // Percentage held by top 10
  top20Concentration: number; // Percentage held by top 20
  creatorBalance?: string;
  creatorPercentage?: number;
}

// Liquidity pool analysis
export interface LiquidityInfo {
  totalLiquidityUSD: number;
  locked: boolean;
  lockedPercentage?: number;
  lockedUntil?: Date;
  burned: boolean;
  burnedPercentage?: number;
  removable: boolean;
  pools: Array<{
    dex: string;
    pairAddress: string;
    liquidityUSD: number;
    locked: boolean;
  }>;
}

// Security scan results
export interface SecurityScan {
  isHoneypot: boolean;
  isMintable: boolean;
  canTakeBackOwnership: boolean;
  hasBlacklist: boolean;
  hasWhitelist: boolean;
  hasProxy: boolean;
  hasHiddenOwner: boolean;
  hasTradingCooldown: boolean;
  canBePaused: boolean;
  hasTaxes: boolean;
  buyTaxPercentage?: number;
  sellTaxPercentage?: number;
  ownerBalance?: string;
  ownerPercentage?: number;
  creatorBalance?: string;
  creatorPercentage?: number;
  risks: Array<{
    level: 'critical' | 'high' | 'medium' | 'low';
    name: string;
    description: string;
    score: number; // Impact on safety score
  }>;
}

// Market data
export interface MarketData {
  priceUSD: number;
  volume24h: number;
  marketCap: number;
  priceChange24h: number;
  holders: number;
  transactions24h: number;
}

// Transaction analysis
export interface TransactionAnalysis {
  recent: Array<{
    hash: string;
    type: 'buy' | 'sell' | 'transfer';
    amountUSD: number;
    timestamp: Date;
  }>;
  buyCount24h: number;
  sellCount24h: number;
  volume24h: number;
  avgBuySize: number;
  avgSellSize: number;
  largeTransfers: Array<{
    hash: string;
    amountUSD: number;
    from: string;
    to: string;
  }>;
}

// Complete analysis result
export interface TokenAnalysis {
  address: string;
  chain: Chain;
  metadata: TokenMetadata | null;
  security: SecurityScan | null;
  holders: HolderDistribution | null;
  liquidity: LiquidityInfo | null;
  market: MarketData | null;
  transactions: TransactionAnalysis | null;
  safetyScore: number; // 0-100 (100 = safest)
  riskLevel: 'SAFE' | 'CAUTION' | 'AVOID';
  confidence: number; // 0-100 based on data completeness
  dataCompleteness: number; // 0-100 percentage
  summary: string; // Natural language summary
  redFlags: string[]; // List of critical issues
  analyzedAt: Date;
  userId?: string; // User who requested analysis (UUID)
}

// Chain-specific configuration
export interface ChainConfig {
  id: Chain;
  name: string;
  rpcUrl?: string;
  explorerUrl: string;
  nativeToken: string;
  addressPattern: RegExp;
}

export const CHAIN_CONFIGS: Record<Chain, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    explorerUrl: 'https://etherscan.io',
    nativeToken: 'ETH',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    explorerUrl: 'https://solscan.io',
    nativeToken: 'SOL',
    addressPattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    explorerUrl: 'https://bscscan.com',
    nativeToken: 'BNB',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  base: {
    id: 'base',
    name: 'Base',
    explorerUrl: 'https://basescan.org',
    nativeToken: 'ETH',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    explorerUrl: 'https://polygonscan.com',
    nativeToken: 'MATIC',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    explorerUrl: 'https://snowtrace.io',
    nativeToken: 'AVAX',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
};

// Validate address format for a given chain
export function isValidAddress(address: string, chain: Chain): boolean {
  const config = CHAIN_CONFIGS[chain];
  return config.addressPattern.test(address);
}

// Map GoPlus chain IDs to our chain types
export const GOPLUS_CHAIN_MAP: Record<string, string> = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  avalanche: '43114',
  base: '8453',
  solana: 'solana',
};

// Map Etherscan-compatible APIs
export const ETHERSCAN_API_URLS: Record<string, string> = {
  ethereum: 'https://api.etherscan.io/api',
  bsc: 'https://api.bscscan.com/api',
  polygon: 'https://api.polygonscan.com/api',
  avalanche: 'https://api.snowtrace.io/api',
  base: 'https://api.basescan.org/api',
};
