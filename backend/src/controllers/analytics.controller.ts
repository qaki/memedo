/**
 * Analytics Controller
 *
 * Handles HTTP requests for analytics and insights.
 */

import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/**
 * Get dashboard analytics
 * GET /api/analytics/dashboard
 */
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      },
    });
  }

  logger.info(`Fetching dashboard analytics for user: ${userId}`);

  const analytics = await analyticsService.getDashboardAnalytics(userId);

  res.json({
    success: true,
    data: analytics,
  });
});
