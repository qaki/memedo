/**
 * Analytics Service
 *
 * Provides analytics and insights for user watchlist and token analysis data.
 */

import { db } from '../db/index.js';
import { watchlist } from '../db/schema/watchlist.js';
import { tokenAnalyses } from '../db/schema/token-analyses.js';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

// Type for watchlist items from database
type WatchlistItem = typeof watchlist.$inferSelect;

// Type for token analysis from database
type TokenAnalysis = typeof tokenAnalyses.$inferSelect | null;

// Type for combined token data
interface TokenData {
  watchlistItem: WatchlistItem;
  analysis: TokenAnalysis;
}

export interface DashboardStats {
  overview: {
    totalTokens: number;
    averageSafetyScore: number;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
      unknown: number;
    };
    chainDistribution: Record<string, number>;
  };
  topTokens: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    safetyScore: number;
    riskLevel: string;
  }>;
  attentionNeeded: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    safetyScore: number;
    riskLevel: string;
  }>;
  recentActivity: Array<{
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    chain: string;
    addedAt: Date;
  }>;
}

class AnalyticsService {
  /**
   * Get comprehensive dashboard analytics for a user
   */
  async getDashboardAnalytics(userId: string): Promise<DashboardStats> {
    try {
      // Get all watchlist items for the user
      const userWatchlist = await db.select().from(watchlist).where(eq(watchlist.user_id, userId));

      if (userWatchlist.length === 0) {
        return this.getEmptyStats();
      }

      // Get latest analysis for each watchlist token
      const tokenAnalysisData = await Promise.all(
        userWatchlist.map(async (item) => {
          const latestAnalysis = await db
            .select()
            .from(tokenAnalyses)
            .where(
              and(
                eq(tokenAnalyses.token_address, item.token_address),
                eq(tokenAnalyses.chain, item.chain)
              )
            )
            .orderBy(desc(tokenAnalyses.analyzed_at))
            .limit(1);

          return {
            watchlistItem: item,
            analysis: latestAnalysis[0] || null,
          };
        })
      );

      // Calculate overview statistics
      const overview = this.calculateOverview(tokenAnalysisData);

      // Get top performing tokens (highest safety scores)
      const topTokens = this.getTopTokens(tokenAnalysisData);

      // Get tokens needing attention (lowest safety scores)
      const attentionNeeded = this.getAttentionNeeded(tokenAnalysisData);

      // Get recent activity (recently added tokens)
      const recentActivity = this.getRecentActivity(userWatchlist);

      return {
        overview,
        topTokens,
        attentionNeeded,
        recentActivity,
      };
    } catch (error) {
      logger.error('Failed to get dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate overview statistics
   */
  private calculateOverview(tokenData: TokenData[]) {
    const totalTokens = tokenData.length;

    // Calculate average safety score
    const tokensWithScore = tokenData.filter((t) => t.analysis?.safety_score != null);
    const averageSafetyScore =
      tokensWithScore.length > 0
        ? tokensWithScore.reduce((sum, t) => sum + t.analysis.safety_score, 0) /
          tokensWithScore.length
        : 0;

    // Calculate risk distribution
    const riskDistribution = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };

    tokenData.forEach((t) => {
      const riskLevel = t.analysis?.risk_level?.toLowerCase() || 'unknown';
      if (riskLevel === 'high') riskDistribution.high++;
      else if (riskLevel === 'medium') riskDistribution.medium++;
      else if (riskLevel === 'low') riskDistribution.low++;
      else riskDistribution.unknown++;
    });

    // Calculate chain distribution
    const chainDistribution: Record<string, number> = {};
    tokenData.forEach((t) => {
      const chain = t.watchlistItem.chain;
      chainDistribution[chain] = (chainDistribution[chain] || 0) + 1;
    });

    return {
      totalTokens,
      averageSafetyScore: Math.round(averageSafetyScore * 10) / 10,
      riskDistribution,
      chainDistribution,
    };
  }

  /**
   * Get top tokens by safety score
   */
  private getTopTokens(tokenData: TokenData[]) {
    return tokenData
      .filter((t) => t.analysis?.safety_score != null)
      .sort((a, b) => b.analysis.safety_score - a.analysis.safety_score)
      .slice(0, 5)
      .map((t) => ({
        tokenName: t.watchlistItem.token_name || 'Unknown',
        tokenSymbol: t.watchlistItem.token_symbol || 'N/A',
        tokenAddress: t.watchlistItem.token_address,
        chain: t.watchlistItem.chain,
        safetyScore: t.analysis.safety_score,
        riskLevel: t.analysis.risk_level || 'unknown',
      }));
  }

  /**
   * Get tokens needing attention (lowest safety scores)
   */
  private getAttentionNeeded(tokenData: TokenData[]) {
    return tokenData
      .filter((t) => t.analysis?.safety_score != null && t.analysis.safety_score < 50)
      .sort((a, b) => a.analysis.safety_score - b.analysis.safety_score)
      .slice(0, 5)
      .map((t) => ({
        tokenName: t.watchlistItem.token_name || 'Unknown',
        tokenSymbol: t.watchlistItem.token_symbol || 'N/A',
        tokenAddress: t.watchlistItem.token_address,
        chain: t.watchlistItem.chain,
        safetyScore: t.analysis.safety_score,
        riskLevel: t.analysis.risk_level || 'unknown',
      }));
  }

  /**
   * Get recent activity (recently added tokens)
   */
  private getRecentActivity(watchlistItems: WatchlistItem[]) {
    return watchlistItems
      .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
      .slice(0, 5)
      .map((item) => ({
        tokenName: item.token_name || 'Unknown',
        tokenSymbol: item.token_symbol || 'N/A',
        tokenAddress: item.token_address,
        chain: item.chain,
        addedAt: item.added_at,
      }));
  }

  /**
   * Get empty stats structure
   */
  private getEmptyStats(): DashboardStats {
    return {
      overview: {
        totalTokens: 0,
        averageSafetyScore: 0,
        riskDistribution: {
          high: 0,
          medium: 0,
          low: 0,
          unknown: 0,
        },
        chainDistribution: {},
      },
      topTokens: [],
      attentionNeeded: [],
      recentActivity: [],
    };
  }
}

export const analyticsService = new AnalyticsService();
