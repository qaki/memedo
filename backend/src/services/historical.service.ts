/**
 * Historical Token Analysis Service
 * Provides time-series data for token analysis tracking
 */

import { db } from '../db/index.js';
import { analyses } from '../db/schema/index.js';
import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

export interface HistoricalDataPoint {
  timestamp: Date;
  safetyScore: number;
  riskLevel: string;
  priceUSD: number | null;
  liquidityUSD: number | null;
  volume24h: number | null;
  marketCap: number | null;
  holders: number | null;
  top10HolderPercentage: number | null;
  dataCompleteness: number;
}

export interface TokenHistoricalData {
  tokenAddress: string;
  chain: string;
  tokenName: string | null;
  tokenSymbol: string | null;
  totalAnalyses: number;
  dateRange: {
    oldest: Date;
    newest: Date;
  };
  dataPoints: HistoricalDataPoint[];
  summary: {
    averageSafetyScore: number;
    safetyScoreChange: number; // Change from first to last analysis
    priceChange: number | null; // Percentage change
    currentRiskLevel: string;
    previousRiskLevel: string;
    riskLevelChanged: boolean;
  };
}

export interface TimeRange {
  days?: number;
  from?: Date;
  to?: Date;
}

class HistoricalService {
  /**
   * Get historical analysis data for a specific token
   */
  async getTokenHistory(
    tokenAddress: string,
    chain: string,
    userId: string,
    timeRange?: TimeRange
  ): Promise<TokenHistoricalData | null> {
    try {
      // Build date filter
      let dateFilter = and(
        eq(analyses.token_address, tokenAddress),
        eq(analyses.chain, chain),
        eq(analyses.user_id, userId)
      );

      if (timeRange?.days) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - timeRange.days);
        dateFilter = and(dateFilter, gte(analyses.created_at, fromDate));
      } else if (timeRange?.from) {
        dateFilter = and(dateFilter, gte(analyses.created_at, timeRange.from));
      }

      // Fetch all analyses for this token in the time range
      const tokenAnalyses = await db
        .select()
        .from(analyses)
        .where(dateFilter)
        .orderBy(desc(analyses.created_at));

      if (tokenAnalyses.length === 0) {
        logger.info(
          `[Historical] No analysis history found for ${chain}:${tokenAddress} (user: ${userId})`
        );
        return null;
      }

      // Extract data points from analyses
      const dataPoints: HistoricalDataPoint[] = tokenAnalyses
        .map((analysis) => {
          try {
            // Parse analysis_data JSON
            const analysisData =
              typeof analysis.analysis_data === 'string'
                ? JSON.parse(analysis.analysis_data)
                : analysis.analysis_data;

            return {
              timestamp: analysis.created_at,
              safetyScore: analysis.safety_score,
              riskLevel: analysis.risk_level,
              priceUSD: analysisData?.market?.priceUSD || null,
              liquidityUSD: analysisData?.market?.liquidityUSD || null,
              volume24h: analysisData?.market?.volume24h || null,
              marketCap: analysisData?.market?.marketCap || null,
              holders: analysisData?.market?.holders || null,
              top10HolderPercentage: analysisData?.market?.top10HolderPercentage || null,
              dataCompleteness: analysis.data_completeness,
            };
          } catch (error) {
            logger.warn(`[Historical] Failed to parse analysis data for ${analysis.id}:`, error);
            return null;
          }
        })
        .filter((point): point is HistoricalDataPoint => point !== null)
        .reverse(); // Oldest to newest for chronological order

      // Calculate summary statistics
      const summary = this.calculateSummary(dataPoints);

      // Get token metadata from most recent analysis
      const latestAnalysis = tokenAnalyses[0];

      return {
        tokenAddress,
        chain,
        tokenName: latestAnalysis.token_name,
        tokenSymbol: latestAnalysis.token_symbol,
        totalAnalyses: dataPoints.length,
        dateRange: {
          oldest: dataPoints[0].timestamp,
          newest: dataPoints[dataPoints.length - 1].timestamp,
        },
        dataPoints,
        summary,
      };
    } catch (error) {
      logger.error('[Historical] Failed to fetch token history:', error);
      throw error;
    }
  }

  /**
   * Get analysis count history for a user (analyses per day)
   */
  async getAnalysisCountHistory(
    userId: string,
    days: number = 30
  ): Promise<{
    labels: string[];
    counts: number[];
  }> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const result = await db
        .select({
          date: sql<string>`DATE(${analyses.created_at})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(analyses)
        .where(and(eq(analyses.user_id, userId), gte(analyses.created_at, fromDate)))
        .groupBy(sql`DATE(${analyses.created_at})`)
        .orderBy(sql`DATE(${analyses.created_at})`);

      return {
        labels: result.map((r) => r.date),
        counts: result.map((r) => Number(r.count)),
      };
    } catch (error) {
      logger.error('[Historical] Failed to fetch analysis count history:', error);
      return { labels: [], counts: [] };
    }
  }

  /**
   * Get all tokens that have historical data for a user
   */
  async getTokensWithHistory(userId: string): Promise<
    Array<{
      tokenAddress: string;
      chain: string;
      tokenName: string | null;
      tokenSymbol: string | null;
      analysisCount: number;
      firstAnalysis: Date;
      lastAnalysis: Date;
    }>
  > {
    try {
      const result = await db
        .select({
          tokenAddress: analyses.token_address,
          chain: analyses.chain,
          tokenName: analyses.token_name,
          tokenSymbol: analyses.token_symbol,
          analysisCount: sql<number>`COUNT(*)`,
          firstAnalysis: sql<Date>`MIN(${analyses.created_at})`,
          lastAnalysis: sql<Date>`MAX(${analyses.created_at})`,
        })
        .from(analyses)
        .where(eq(analyses.user_id, userId))
        .groupBy(analyses.token_address, analyses.chain, analyses.token_name, analyses.token_symbol)
        .having(sql`COUNT(*) > 1`) // Only tokens with multiple analyses
        .orderBy(sql`MAX(${analyses.created_at}) DESC`);

      return result.map((r) => ({
        tokenAddress: r.tokenAddress,
        chain: r.chain,
        tokenName: r.tokenName,
        tokenSymbol: r.tokenSymbol,
        analysisCount: Number(r.analysisCount),
        firstAnalysis: r.firstAnalysis,
        lastAnalysis: r.lastAnalysis,
      }));
    } catch (error) {
      logger.error('[Historical] Failed to fetch tokens with history:', error);
      return [];
    }
  }

  /**
   * Calculate summary statistics from data points
   */
  private calculateSummary(dataPoints: HistoricalDataPoint[]) {
    if (dataPoints.length === 0) {
      return {
        averageSafetyScore: 0,
        safetyScoreChange: 0,
        priceChange: null,
        currentRiskLevel: 'unknown',
        previousRiskLevel: 'unknown',
        riskLevelChanged: false,
      };
    }

    const firstPoint = dataPoints[0];
    const lastPoint = dataPoints[dataPoints.length - 1];

    // Calculate average safety score
    const averageSafetyScore =
      dataPoints.reduce((sum, point) => sum + point.safetyScore, 0) / dataPoints.length;

    // Calculate safety score change
    const safetyScoreChange = lastPoint.safetyScore - firstPoint.safetyScore;

    // Calculate price change percentage
    let priceChange = null;
    if (firstPoint.priceUSD !== null && lastPoint.priceUSD !== null && firstPoint.priceUSD > 0) {
      priceChange = ((lastPoint.priceUSD - firstPoint.priceUSD) / firstPoint.priceUSD) * 100;
    }

    // Check risk level change
    const currentRiskLevel = lastPoint.riskLevel;
    const previousRiskLevel = firstPoint.riskLevel;
    const riskLevelChanged = currentRiskLevel !== previousRiskLevel;

    return {
      averageSafetyScore: Math.round(averageSafetyScore),
      safetyScoreChange: Math.round(safetyScoreChange),
      priceChange: priceChange !== null ? Math.round(priceChange * 100) / 100 : null,
      currentRiskLevel,
      previousRiskLevel,
      riskLevelChanged,
    };
  }
}

export const historicalService = new HistoricalService();
