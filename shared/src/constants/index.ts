/**
 * Supported blockchain chains
 */
export const SUPPORTED_CHAINS = ['ethereum', 'solana', 'base', 'bsc'] as const;

/**
 * Chain display names
 */
export const CHAIN_NAMES = {
  ethereum: 'Ethereum',
  solana: 'Solana',
  base: 'Base',
  bsc: 'BNB Smart Chain',
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const;

/**
 * User tiers
 */
export const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

/**
 * Risk levels
 */
export const RISK_LEVELS = {
  SAFE: 'safe',
  CAUTION: 'caution',
  AVOID: 'avoid',
} as const;

/**
 * Risk level colors (for UI)
 */
export const RISK_LEVEL_COLORS = {
  safe: '#10B981', // green-500
  caution: '#F59E0B', // yellow-500
  avoid: '#EF4444', // red-500
} as const;

/**
 * Quota limits
 */
export const QUOTA_LIMITS = {
  FREE_TIER_MONTHLY: 20,
  PREMIUM_TIER_MONTHLY: -1, // unlimited
} as const;

/**
 * Rate limits (requests per minute)
 */
export const RATE_LIMITS = {
  GLOBAL_PER_IP: 30,
  AUTHENTICATED_USER: 60,
  ADMIN_USER: 120,
} as const;

/**
 * JWT expiration times
 */
export const JWT_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_TOKEN: '1h',
} as const;

/**
 * TOTP configuration
 */
export const TOTP_CONFIG = {
  WINDOW: 1, // ±1 step tolerance (90-second total window)
  STEP: 30, // 30-second time window
  DIGITS: 6,
  ALGORITHM: 'sha1',
} as const;

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
} as const;

/**
 * API timeout settings (milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 5000,
  HELIUS: 3000,
  ETHERSCAN: 4000,
  GOPLUS: 3000,
  RUGCHECK: 4000,
  DEXSCREENER: 2000,
} as const;

/**
 * Cache TTL settings (seconds)
 */
export const CACHE_TTL = {
  ANALYSIS_RESULT: 300, // 5 minutes
  USER_PROFILE: 600, // 10 minutes
  API_HEALTH: 60, // 1 minute
  WATCHLIST: 300, // 5 minutes
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Analysis completeness thresholds
 */
export const COMPLETENESS_THRESHOLDS = {
  EXCELLENT: 95, // All APIs succeeded
  GOOD: 80, // Most APIs succeeded
  ACCEPTABLE: 60, // Some APIs failed but analysis is still useful
  POOR: 40, // Many APIs failed
} as const;
