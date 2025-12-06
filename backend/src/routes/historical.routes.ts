/**
 * Historical Data Routes
 * Routes for accessing historical token analysis data
 */

import { Router } from 'express';
import {
  getTokenHistory,
  getAnalysisActivity,
  getTokensWithHistory,
} from '../controllers/historical.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// All historical routes require authentication
router.use(requireAuth);

/**
 * GET /api/historical/tokens
 * Get all tokens with historical data for current user
 */
router.get('/tokens', getTokensWithHistory);

/**
 * GET /api/historical/activity
 * Get user's analysis count history (for dashboard charts)
 * Query params: ?days=30
 */
router.get('/activity', getAnalysisActivity);

/**
 * GET /api/historical/:chain/:tokenAddress
 * Get historical analysis data for a specific token
 * Query params: ?days=30 OR ?from=2024-01-01&to=2024-12-31
 */
router.get('/:chain/:tokenAddress', getTokenHistory);

export default router;
