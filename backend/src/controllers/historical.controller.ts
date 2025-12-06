/**
 * Historical Data Controller
 * API endpoints for token historical analysis data
 */

import { Request, Response } from 'express';
import { historicalService } from '../services/historical.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Get historical analysis data for a specific token
 * GET /api/historical/:chain/:tokenAddress
 */
export const getTokenHistory = asyncHandler(async (req: Request, res: Response) => {
  const { chain, tokenAddress } = req.params;
  const { days, from, to } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError('Authentication required', 401);
  }

  if (!chain || !tokenAddress) {
    throw new ApiError('Chain and token address are required', 400);
  }

  // Parse time range parameters
  const timeRange = days
    ? { days: parseInt(days as string, 10) }
    : from
      ? { from: new Date(from as string), to: to ? new Date(to as string) : undefined }
      : undefined;

  logger.info(
    `[Historical] Fetching history for ${chain}:${tokenAddress} (user: ${userId}, range: ${JSON.stringify(timeRange)})`
  );

  const history = await historicalService.getTokenHistory(tokenAddress, chain, userId, timeRange);

  if (!history) {
    throw new ApiError(
      'No historical data found for this token. Analyze it multiple times to build history.',
      404
    );
  }

  res.json({
    success: true,
    data: history,
  });
});

/**
 * Get user's analysis count history (for dashboard charts)
 * GET /api/historical/activity
 */
export const getAnalysisActivity = asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError('Authentication required', 401);
  }

  const daysCount = days ? parseInt(days as string, 10) : 30;

  logger.info(`[Historical] Fetching analysis activity for user ${userId} (${daysCount} days)`);

  const activity = await historicalService.getAnalysisCountHistory(userId, daysCount);

  res.json({
    success: true,
    data: activity,
  });
});

/**
 * Get all tokens with historical data for current user
 * GET /api/historical/tokens
 */
export const getTokensWithHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError('Authentication required', 401);
  }

  logger.info(`[Historical] Fetching tokens with history for user ${userId}`);

  const tokens = await historicalService.getTokensWithHistory(userId);

  res.json({
    success: true,
    data: tokens,
    count: tokens.length,
  });
});
