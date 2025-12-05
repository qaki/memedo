/**
 * Analytics Routes
 *
 * Defines API routes for analytics endpoints.
 */

import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * All analytics routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
router.get('/dashboard', getDashboardAnalytics);

export default router;
