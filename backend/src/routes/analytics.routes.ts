import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  getAPIHealthStats,
  getUsageByChain,
  getRecentErrors,
  getAlerts,
  getAdapterHealth,
  getCacheStatistics,
  getDashboard,
} from '../controllers/analytics.controller.js';

const router = Router();

// All analytics endpoints require authentication
// Most require admin role for security

// Admin-only endpoints
router.get('/api-health', requireAuth, requireRole('admin'), getAPIHealthStats);
router.get('/usage-by-chain', requireAuth, requireRole('admin'), getUsageByChain);
router.get('/recent-errors', requireAuth, requireRole('admin'), getRecentErrors);
router.get('/alerts', requireAuth, requireRole('admin'), getAlerts);
router.get('/adapter-health', requireAuth, requireRole('admin'), getAdapterHealth);
router.get('/cache-stats', requireAuth, requireRole('admin'), getCacheStatistics);
router.get('/dashboard', requireAuth, requireRole('admin'), getDashboard);

export default router;
