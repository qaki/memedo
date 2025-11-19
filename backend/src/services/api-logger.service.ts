/**
 * API Logger Service
 * Tracks all external API calls for monitoring, cost tracking, and performance analysis
 */

import { db } from '../db/index.js';
import { api_logs } from '../db/schema/index.js';

interface APICallLog {
  analysisId?: string;
  chain: string;
  contractAddress?: string;
  provider: string;
  endpoint?: string;
  success: boolean;
  responseTimeMs: number;
  httpStatusCode?: number;
  errorMessage?: string;
  errorType?: string;
  wasFallback?: boolean;
  fallbackLevel?: number;
  requestMetadata?: Record<string, unknown>;
}

// API cost estimates (in USD per 1000 requests)
const API_COSTS: Record<string, number> = {
  helius: 0.0, // Free tier
  etherscan: 0.0, // Free tier
  goplus: 0.0, // Free tier
  rugcheck: 0.0, // Free
  bscscan: 0.0, // Free tier
  polygonscan: 0.0, // Free tier
  snowtrace: 0.0, // Free tier
  basescan: 0.0, // Free tier
  // Paid tier costs (for future reference)
  'helius-pro': 50.0, // $50 per 1M requests
  'etherscan-pro': 20.0, // $20 per 1M requests
};

export class APILoggerService {
  /**
   * Log an API call
   */
  async logAPICall(log: APICallLog): Promise<void> {
    try {
      await db.insert(api_logs).values({
        analysis_id: log.analysisId,
        chain: log.chain,
        contract_address: log.contractAddress,
        provider: log.provider,
        endpoint: log.endpoint,
        success: log.success,
        response_time_ms: log.responseTimeMs,
        http_status_code: log.httpStatusCode,
        error_message: log.errorMessage,
        error_type: log.errorType,
        was_fallback: log.wasFallback || false,
        fallback_level: log.fallbackLevel || 0,
        request_metadata: log.requestMetadata,
      });

      console.log(
        `[APILogger] ${log.provider} - ${log.success ? '✅' : '❌'} ${log.responseTimeMs}ms`
      );
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('[APILogger] Failed to log API call:', error);
    }
  }

  /**
   * Get API health statistics for the last 24 hours
   */
  async getAPIHealth() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await db.query.api_logs.findMany({
      where: (api_logs, { gte }) => gte(api_logs.created_at, twentyFourHoursAgo),
    });

    // Group by provider
    const providerStats = new Map<
      string,
      {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        avgResponseTime: number;
        totalResponseTime: number;
        errors: string[];
        fallbackCount: number;
      }
    >();

    logs.forEach((log) => {
      if (!providerStats.has(log.provider)) {
        providerStats.set(log.provider, {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          avgResponseTime: 0,
          totalResponseTime: 0,
          errors: [],
          fallbackCount: 0,
        });
      }

      const stats = providerStats.get(log.provider)!;
      stats.totalCalls++;
      stats.totalResponseTime += log.response_time_ms;

      if (log.success) {
        stats.successfulCalls++;
      } else {
        stats.failedCalls++;
        if (log.error_message && stats.errors.length < 5) {
          stats.errors.push(log.error_message);
        }
      }

      if (log.was_fallback) {
        stats.fallbackCount++;
      }
    });

    // Calculate averages and success rates
    const healthData = Array.from(providerStats.entries()).map(([provider, stats]) => ({
      provider,
      totalCalls: stats.totalCalls,
      successfulCalls: stats.successfulCalls,
      failedCalls: stats.failedCalls,
      successRate: ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(2),
      avgResponseTime: Math.round(stats.totalResponseTime / stats.totalCalls),
      fallbackCount: stats.fallbackCount,
      fallbackRate: ((stats.fallbackCount / stats.totalCalls) * 100).toFixed(2),
      recentErrors: stats.errors,
      status: stats.successfulCalls / stats.totalCalls > 0.8 ? 'healthy' : 'degraded',
      estimatedCost: this.calculateCost(provider, stats.totalCalls),
    }));

    return {
      timestamp: new Date(),
      period: '24h',
      providers: healthData,
      summary: {
        totalCalls: logs.length,
        successfulCalls: logs.filter((l) => l.success).length,
        failedCalls: logs.filter((l) => !l.success).length,
        overallSuccessRate: ((logs.filter((l) => l.success).length / logs.length) * 100).toFixed(2),
        avgResponseTime: Math.round(
          logs.reduce((sum, l) => sum + l.response_time_ms, 0) / logs.length
        ),
        totalFallbacks: logs.filter((l) => l.was_fallback).length,
        totalEstimatedCost: healthData.reduce((sum, p) => sum + p.estimatedCost, 0).toFixed(4),
      },
    };
  }

  /**
   * Calculate estimated cost for API calls
   */
  private calculateCost(provider: string, callCount: number): number {
    const costPer1000 = API_COSTS[provider] || 0;
    return (callCount / 1000) * costPer1000;
  }

  /**
   * Get API usage by chain
   */
  async getUsageByChain(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await db.query.api_logs.findMany({
      where: (api_logs, { gte }) => gte(api_logs.created_at, since),
    });

    const chainStats = new Map<string, { calls: number; successRate: number }>();

    logs.forEach((log) => {
      if (!chainStats.has(log.chain)) {
        chainStats.set(log.chain, { calls: 0, successRate: 0 });
      }
      chainStats.get(log.chain)!.calls++;
    });

    // Calculate success rates
    chainStats.forEach((stats, chain) => {
      const chainLogs = logs.filter((l) => l.chain === chain);
      const successful = chainLogs.filter((l) => l.success).length;
      stats.successRate = (successful / chainLogs.length) * 100;
    });

    return Array.from(chainStats.entries())
      .map(([chain, stats]) => ({
        chain,
        calls: stats.calls,
        successRate: stats.successRate.toFixed(2),
      }))
      .sort((a, b) => b.calls - a.calls);
  }

  /**
   * Get recent errors (for alerting)
   */
  async getRecentErrors(limit = 20) {
    const logs = await db.query.api_logs.findMany({
      where: (api_logs, { eq }) => eq(api_logs.success, false),
      orderBy: (api_logs, { desc }) => [desc(api_logs.created_at)],
      limit,
    });

    return logs.map((log) => ({
      provider: log.provider,
      chain: log.chain,
      error: log.error_message,
      errorType: log.error_type,
      timestamp: log.created_at,
      wasFallback: log.was_fallback,
    }));
  }

  /**
   * Check if any provider has high failure rate (>20%)
   */
  async getAlertsCheck() {
    const health = await this.getAPIHealth();
    const alerts = [];

    for (const provider of health.providers) {
      const successRate = parseFloat(provider.successRate);

      if (successRate < 80 && provider.totalCalls > 10) {
        alerts.push({
          severity: successRate < 50 ? 'critical' : 'warning',
          provider: provider.provider,
          message: `${provider.provider} has ${successRate}% success rate (${provider.failedCalls}/${provider.totalCalls} failures)`,
          successRate,
          failedCalls: provider.failedCalls,
        });
      }
    }

    return {
      hasAlerts: alerts.length > 0,
      alerts,
      checkedAt: new Date(),
    };
  }
}

// Singleton instance
export const apiLogger = new APILoggerService();
