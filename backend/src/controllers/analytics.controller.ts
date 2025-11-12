/**
 * Analytics Controller
 * Provides API health monitoring and performance analytics
 */

import { Request, Response } from 'express';
import { apiLogger } from '../services/api-logger.service';
import { cafo } from '../services/cafo.service';
import { getCacheStats, getCacheHitRatio } from '../services/redis.service';

/**
 * GET /api/analytics/api-health
 * Get API health statistics
 */
export const getAPIHealthStats = async (_req: Request, res: Response) => {
  try {
    const health = await apiLogger.getAPIHealth();

    res.json({
      success: true,
      data: health,
    });
  } catch (error: unknown) {
    console.error('Get API health error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve API health statistics',
      },
    });
  }
};

/**
 * GET /api/analytics/usage-by-chain
 * Get API usage breakdown by blockchain
 */
export const getUsageByChain = async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const usage = await apiLogger.getUsageByChain(hours);

    res.json({
      success: true,
      data: {
        period: `${hours}h`,
        usage,
      },
    });
  } catch (error: unknown) {
    console.error('Get usage by chain error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve usage statistics',
      },
    });
  }
};

/**
 * GET /api/analytics/recent-errors
 * Get recent API errors
 */
export const getRecentErrors = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const errors = await apiLogger.getRecentErrors(limit);

    res.json({
      success: true,
      data: {
        errors,
        count: errors.length,
      },
    });
  } catch (error: unknown) {
    console.error('Get recent errors error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve error logs',
      },
    });
  }
};

/**
 * GET /api/analytics/alerts
 * Check for provider alerts (high failure rates)
 */
export const getAlerts = async (_req: Request, res: Response) => {
  try {
    const alerts = await apiLogger.getAlertsCheck();

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error: unknown) {
    console.error('Get alerts error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check alerts',
      },
    });
  }
};

/**
 * GET /api/analytics/adapter-health
 * Get CAFO adapter health scores
 */
export const getAdapterHealth = async (_req: Request, res: Response) => {
  try {
    const healthMap = cafo.getAdapterHealth();
    const health = Array.from(healthMap.entries()).map(([adapterId, data]) => ({
      adapterId,
      score: Math.round(data.score),
      totalCalls: data.totalCalls,
      successfulCalls: data.successfulCalls,
      successRate:
        data.totalCalls > 0 ? ((data.successfulCalls / data.totalCalls) * 100).toFixed(2) : '0',
      consecutiveFailures: data.consecutiveFailures,
      isCircuitOpen: data.isCircuitOpen,
      lastFailure: data.lastFailure,
      status: data.isCircuitOpen
        ? 'disabled'
        : data.score > 80
          ? 'healthy'
          : data.score > 50
            ? 'degraded'
            : 'unhealthy',
    }));

    res.json({
      success: true,
      data: {
        adapters: health,
        supportedChains: cafo.getSupportedChains(),
      },
    });
  } catch (error: unknown) {
    console.error('Get adapter health error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve adapter health',
      },
    });
  }
};

/**
 * GET /api/analytics/cache-stats
 * Get Redis cache statistics
 */
export const getCacheStatistics = async (_req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    const hitRatio = getCacheHitRatio();

    res.json({
      success: true,
      data: {
        ...stats,
        hitRatio: hitRatio.toFixed(2),
        hitRatioPercent: `${hitRatio.toFixed(1)}%`,
      },
    });
  } catch (error: unknown) {
    console.error('Get cache stats error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve cache statistics',
      },
    });
  }
};

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard data
 */
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const [apiHealth, alerts, adapterHealthMap, cacheStats, usageByChain] = await Promise.all([
      apiLogger.getAPIHealth(),
      apiLogger.getAlertsCheck(),
      Promise.resolve(cafo.getAdapterHealth()),
      Promise.resolve(getCacheStats()),
      apiLogger.getUsageByChain(24),
    ]);

    const adapterHealth = Array.from(adapterHealthMap.entries()).map(([adapterId, data]) => ({
      adapterId,
      score: Math.round(data.score),
      status: data.isCircuitOpen ? 'disabled' : data.score > 80 ? 'healthy' : 'degraded',
      successRate:
        data.totalCalls > 0 ? ((data.successfulCalls / data.totalCalls) * 100).toFixed(2) : '0',
    }));

    res.json({
      success: true,
      data: {
        apiHealth: {
          summary: apiHealth.summary,
          providers: apiHealth.providers,
        },
        alerts: {
          hasAlerts: alerts.hasAlerts,
          count: alerts.alerts.length,
          alerts: alerts.alerts,
        },
        adapters: {
          health: adapterHealth,
          supportedChains: cafo.getSupportedChains(),
        },
        cache: {
          ...cacheStats,
          hitRatio: getCacheHitRatio().toFixed(2),
        },
        usage: {
          byChain: usageByChain,
        },
        timestamp: new Date(),
      },
    });
  } catch (error: unknown) {
    console.error('Get dashboard error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve dashboard data',
      },
    });
  }
};
