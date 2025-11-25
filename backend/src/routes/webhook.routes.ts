/**
 * Webhook Routes
 * Handles external service webhooks
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { handleFastSpringWebhook } from '../controllers/webhook.controller.js';

const router = Router();

/**
 * @route   POST /api/webhooks/fastspring
 * @desc    Handle FastSpring webhook events
 * @access  Public (verified by FastSpring)
 */
router.post('/fastspring', asyncHandler(handleFastSpringWebhook));

export default router;
