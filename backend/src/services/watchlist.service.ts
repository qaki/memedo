/**
 * Watchlist Service
 *
 * Manages user watchlists for tracking favorite tokens.
 */

import { db } from '../db/index.js';
import { watchlist, analyses } from '../db/schema/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AddToWatchlistParams {
  userId: string;
  tokenAddress: string;
  chain: string;
  tokenName?: string;
  tokenSymbol?: string;
}

export interface WatchlistItemWithAnalysis {
  id: string;
  tokenAddress: string;
  chain: string;
  tokenName: string | null;
  tokenSymbol: string | null;
  addedAt: Date;
  latestAnalysis?: {
    safetyScore: number;
    riskLevel: string;
    priceUSD: number;
    analyzedAt: Date;
  };
}

class WatchlistService {
  /**
   * Add a token to user's watchlist
   */
  async addToWatchlist(params: AddToWatchlistParams): Promise<void> {
    const { userId, tokenAddress, chain, tokenName, tokenSymbol } = params;

    try {
      // Check if already in watchlist
      const existing = await db
        .select()
        .from(watchlist)
        .where(
          and(
            eq(watchlist.userId, userId),
            eq(watchlist.tokenAddress, tokenAddress.toLowerCase()),
            eq(watchlist.chain, chain)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new ApiError('Token already in watchlist', 409);
      }

      // Add to watchlist
      await db.insert(watchlist).values({
        userId,
        tokenAddress: tokenAddress.toLowerCase(),
        chain,
        tokenName,
        tokenSymbol,
      });

      logger.info(
        `[Watchlist] User ${userId} added ${tokenSymbol || tokenAddress} (${chain}) to watchlist`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('[Watchlist] Error adding to watchlist:', error);
      throw new ApiError('Failed to add token to watchlist', 500);
    }
  }

  /**
   * Get user's watchlist with latest analysis data
   */
  async getWatchlist(userId: string): Promise<WatchlistItemWithAnalysis[]> {
    try {
      // Get all watchlist items for user
      const watchlistItems = await db
        .select()
        .from(watchlist)
        .where(eq(watchlist.userId, userId))
        .orderBy(desc(watchlist.addedAt));

      // Fetch latest analysis for each token
      const itemsWithAnalysis = await Promise.all(
        watchlistItems.map(async (item) => {
          // Get most recent analysis for this token
          const latestAnalyses = await db
            .select({
              safetyScore: analyses.safety_score,
              riskLevel: analyses.risk_level,
              analysisData: analyses.analysis_data,
              createdAt: analyses.created_at,
            })
            .from(analyses)
            .where(
              and(eq(analyses.token_address, item.tokenAddress), eq(analyses.chain, item.chain))
            )
            .orderBy(desc(analyses.created_at))
            .limit(1);

          const latestAnalysis = latestAnalyses[0];

          // Extract price from analysis_data JSON
          let priceUSD = 0;
          if (latestAnalysis?.analysisData) {
            try {
              const data =
                typeof latestAnalysis.analysisData === 'string'
                  ? JSON.parse(latestAnalysis.analysisData)
                  : latestAnalysis.analysisData;
              priceUSD = data?.market?.priceUSD || 0;
            } catch (e) {
              logger.warn(`[Watchlist] Failed to parse analysis data for ${item.tokenAddress}`);
            }
          }

          return {
            id: item.id,
            tokenAddress: item.tokenAddress,
            chain: item.chain,
            tokenName: item.tokenName,
            tokenSymbol: item.tokenSymbol,
            addedAt: item.addedAt,
            latestAnalysis: latestAnalysis
              ? {
                  safetyScore: latestAnalysis.safetyScore || 50,
                  riskLevel: latestAnalysis.riskLevel || 'UNKNOWN',
                  priceUSD,
                  analyzedAt: latestAnalysis.createdAt,
                }
              : undefined,
          };
        })
      );

      return itemsWithAnalysis;
    } catch (error) {
      logger.error('[Watchlist] Error fetching watchlist:', error);
      throw new ApiError('Failed to fetch watchlist', 500);
    }
  }

  /**
   * Remove a token from watchlist
   */
  async removeFromWatchlist(userId: string, watchlistId: string): Promise<void> {
    try {
      const result = await db
        .delete(watchlist)
        .where(and(eq(watchlist.id, watchlistId), eq(watchlist.userId, userId)))
        .returning();

      if (result.length === 0) {
        throw new ApiError('Watchlist item not found', 404);
      }

      logger.info(`[Watchlist] User ${userId} removed item ${watchlistId} from watchlist`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('[Watchlist] Error removing from watchlist:', error);
      throw new ApiError('Failed to remove from watchlist', 500);
    }
  }

  /**
   * Check if a token is in user's watchlist
   */
  async isInWatchlist(userId: string, tokenAddress: string, chain: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(watchlist)
        .where(
          and(
            eq(watchlist.userId, userId),
            eq(watchlist.tokenAddress, tokenAddress.toLowerCase()),
            eq(watchlist.chain, chain)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      logger.error('[Watchlist] Error checking watchlist status:', error);
      return false;
    }
  }

  /**
   * Get watchlist count for user
   */
  async getWatchlistCount(userId: string): Promise<number> {
    try {
      const result = await db.select().from(watchlist).where(eq(watchlist.userId, userId));

      return result.length;
    } catch (error) {
      logger.error('[Watchlist] Error getting watchlist count:', error);
      return 0;
    }
  }
}

export const watchlistService = new WatchlistService();
