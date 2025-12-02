// User types
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: 'free' | 'premium' | 'admin';
  email_verified: boolean;
  totp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  totpToken?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

// Token Analysis types
export interface TokenMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
  total_supply?: string;
  description?: string;
  logo?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  is_verified?: boolean;
}

export interface SecurityScan {
  is_honeypot?: boolean | null;
  is_open_source?: boolean | null;
  is_proxy?: boolean | null;
  is_mintable?: boolean | null;
  can_take_back_ownership?: boolean | null;
  owner_change_balance?: boolean | null;
  hidden_owner?: boolean | null;
  selfdestruct?: boolean | null;
  external_call?: boolean | null;
  buy_tax?: string | null;
  sell_tax?: string | null;
  is_blacklisted?: boolean | null;
  is_whitelisted?: boolean | null;
  is_anti_whale?: boolean | null;
  trading_cooldown?: boolean | null;
  personal_slippage_modifiable?: boolean | null;
  cannot_sell_all?: boolean | null;
  transfer_pausable?: boolean | null;
  is_ownership_renounced?: boolean | null; // NEW: Renounced ownership flag!
  risks?: Array<{
    name: string;
    level: string;
    description: string;
  }>;
}

// NEW: Market data from BirdEye
export interface MarketData {
  price_usd: number;
  volume_24h: number;
  market_cap: number;
  price_change_24h: number;
  holders: number;
  transactions_24h: number;

  // Critical market health metrics
  total_liquidity_usd: number;
  volume_buy_24h_usd?: number;
  volume_sell_24h_usd?: number;
  total_supply: number;

  // Holder distribution
  top_10_holder_percentage: number;
  top_10_holders?: Array<{
    address: string;
    balance: number;
    percentage: number;
  }>;

  // Risk flags
  is_low_liquidity: boolean;
  is_low_volume: boolean;
  is_high_concentration: boolean;
}

export interface TokenAnalysis {
  id: string;
  user_id: string;
  chain: string;
  token_address: string;
  safety_score: number;
  risk_level: 'low' | 'medium' | 'high';
  data_completeness: number;
  metadata: TokenMetadata | null;
  security_scan: SecurityScan | null;
  market_data: MarketData | null; // NEW: Market health metrics!
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistoryItem {
  id: string;
  chain: string;
  token_address: string;
  safety_score: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface SupportedChain {
  id: string;
  name: string;
  explorerUrl: string;
  nativeToken: string;
}

// Usage types
export interface UsageStats {
  plan: 'free' | 'premium';
  usage: {
    current: number;
    limit: number;
    remaining: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// UI types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
