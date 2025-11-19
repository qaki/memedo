import { Redis } from '@upstash/redis';
import { env } from '../utils/env-validator.js';

// Parse Upstash Redis URL
// Format: https://TOKEN@HOST or redis://default:TOKEN@HOST:PORT
function parseUpstashUrl(url: string): { url: string; token: string } {
  try {
    // If URL is already https format (Upstash REST API)
    if (url.startsWith('https://')) {
      const match = url.match(/https:\/\/([^@]+)@(.+)/);
      if (match) {
        return {
          url: `https://${match[2]}`,
          token: match[1],
        };
      }
      // No token in URL, might be separate env vars
      return { url, token: '' };
    }

    // If URL is redis:// format, convert to https
    if (url.startsWith('redis://')) {
      const match = url.match(/redis:\/\/(?:default:)?([^@]+)@([^:]+)/);
      if (match) {
        return {
          url: `https://${match[2]}`,
          token: match[1],
        };
      }
    }

    // Fallback: use as-is
    return { url, token: '' };
  } catch (error) {
    console.error('[Redis] Failed to parse URL:', error);
    return { url, token: '' };
  }
}

// Initialize Upstash Redis client
const { url: redisUrl, token: redisToken } = parseUpstashUrl(env.REDIS_URL);
const redis = new Redis({
  url: redisUrl,
  token: redisToken || undefined, // Upstash requires token or undefined
});

// Cache TTL strategies (in seconds)
export const CacheTTL = {
  BASIC_DATA: 3600, // 1 hour - contract info, holder distribution
  TRENDING_DATA: 900, // 15 minutes - price, volume, liquidity
  VOLATILE_DATA: 300, // 5 minutes - transactions, recent activity
  ANALYSIS_RESULT: 900, // 15 minutes - full analysis results
  USER_SESSION: 86400, // 24 hours - user session data
};

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  errors: number;
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  errors: 0,
};

/**
 * Generate cache key with consistent format
 * Pattern: {type}:{chain}:{address}[:subtype]
 */
export function generateCacheKey(
  type: string,
  chain: string,
  address: string,
  subtype?: string
): string {
  const key = `${type}:${chain}:${address.toLowerCase()}`;
  return subtype ? `${key}:${subtype}` : key;
}

/**
 * Get cached data
 * Returns null if not found or expired
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);

    if (data === null) {
      stats.misses++;
      console.log(`[Redis] Cache MISS: ${key}`);
      return null;
    }

    stats.hits++;
    console.log(`[Redis] Cache HIT: ${key}`);
    return data;
  } catch (error) {
    stats.errors++;
    console.error(`[Redis] Cache GET error for ${key}:`, error);
    return null; // Fail gracefully
  }
}

/**
 * Set cached data with TTL
 */
export async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<boolean> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    stats.sets++;
    console.log(`[Redis] Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    stats.errors++;
    console.error(`[Redis] Cache SET error for ${key}:`, error);
    return false; // Fail gracefully
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    console.log(`[Redis] Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    stats.errors++;
    console.error(`[Redis] Cache DELETE error for ${key}:`, error);
    return false;
  }
}

/**
 * Delete all cached data matching a pattern
 * Example: deletePattern('analysis:ethereum:*') deletes all Ethereum analyses
 */
export async function deleteCachedPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    console.log(`[Redis] Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    return keys.length;
  } catch (error) {
    stats.errors++;
    console.error(`[Redis] Cache DELETE PATTERN error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...stats };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  stats.hits = 0;
  stats.misses = 0;
  stats.sets = 0;
  stats.errors = 0;
}

/**
 * Calculate cache hit ratio
 */
export function getCacheHitRatio(): number {
  const total = stats.hits + stats.misses;
  return total === 0 ? 0 : (stats.hits / total) * 100;
}

/**
 * Warm cache with popular tokens
 * This can be called periodically to pre-cache trending tokens
 */
export async function warmCache(popularTokens: Array<{ chain: string; address: string }>) {
  console.log(`[Redis] Warming cache for ${popularTokens.length} popular tokens...`);
  // Implementation will be added in Story 3.6 when analysis service is ready
  return;
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const testKey = 'health:check';
    await redis.setex(testKey, 10, 'ok');
    const result = await redis.get(testKey);
    await redis.del(testKey);
    return result === 'ok';
  } catch (error) {
    console.error('[Redis] Health check failed:', error);
    return false;
  }
}

export default redis;
