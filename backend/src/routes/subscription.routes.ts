/**
 * Subscription Management Routes
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import {
  getSubscriptionStatus,
  createCheckoutSession,
  getCustomerPortal,
  verifySubscription,
  getSubscriptionUsage,
} from '../controllers/subscription.controller.js';

const router = Router();

// All subscription routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/subscription/status
 * @desc    Get current user's subscription status
 * @access  Private
 */
router.get('/status', asyncHandler(getSubscriptionStatus));

/**
 * @route   GET /api/subscription/usage
 * @desc    Get subscription usage and limits
 * @access  Private
 */
router.get('/usage', asyncHandler(getSubscriptionUsage));

/**
 * @route   POST /api/subscription/checkout
 * @desc    Create a checkout session for subscription purchase
 * @access  Private
 * @body    { plan: 'monthly' | 'yearly' }
 */
router.post('/checkout', asyncHandler(createCheckoutSession));

/**
 * @route   GET /api/subscription/portal
 * @desc    Get Whop customer portal URL for managing subscription
 * @access  Private
 */
router.get('/portal', asyncHandler(getCustomerPortal));

/**
 * @route   POST /api/subscription/verify
 * @desc    Verify subscription status with Whop API (manual sync)
 * @access  Private
 */
router.post('/verify', asyncHandler(verifySubscription));

export default router;
