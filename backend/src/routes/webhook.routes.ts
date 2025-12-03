/**
 * Webhook Routes
 * Handles external service webhooks
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { handleWhopWebhook } from '../controllers/webhook.controller.js';

const router = Router();

/**
 * @route   POST /api/webhooks/whop
 * @desc    Handle Whop webhook events
 * @access  Public (verified by Whop signature)
 */
router.post('/whop', asyncHandler(handleWhopWebhook));

export default router;
