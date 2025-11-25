/**
 * Subscription Management Routes
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import {
  getSubscriptionStatus,
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  updateSubscriptionPlan,
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
 * @route   POST /api/subscription/cancel
 * @desc    Cancel subscription (cancel at period end)
 * @access  Private
 */
router.post('/cancel', asyncHandler(cancelSubscription));

/**
 * @route   POST /api/subscription/reactivate
 * @desc    Reactivate a canceled subscription
 * @access  Private
 */
router.post('/reactivate', asyncHandler(reactivateSubscription));

/**
 * @route   PUT /api/subscription/plan
 * @desc    Update subscription plan (upgrade/downgrade)
 * @access  Private
 * @body    { plan: 'monthly' | 'yearly' }
 */
router.put('/plan', asyncHandler(updateSubscriptionPlan));

export default router;
