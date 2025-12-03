/**
 * Whop Webhook Handler
 * Processes subscription events from Whop
 */

import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { whopService, WhopWebhookEvent } from '../services/whop.service.js';

/**
 * Handle Whop webhook events
 */
export const handleWhopWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-whop-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!whopService.validateWebhookSignature(rawBody, signature || '')) {
      logger.error('[Whop] Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body as WhopWebhookEvent;

    if (!event || !event.data) {
      logger.error('[Whop] Invalid webhook payload received');
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    logger.info(`[Whop] Received webhook event: ${event.data.action}`);

    try {
      await processWebhookEvent(event);
    } catch (error) {
      logger.error(`[Whop] Failed to process webhook event ${event.id}:`, error);
      return res.status(500).json({ error: 'Event processing failed' });
    }

    // Whop expects a 200 response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('[Whop] Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Process individual webhook event
 */
async function processWebhookEvent(event: WhopWebhookEvent) {
  const { action } = event.data;

  logger.info(`[Whop] Processing webhook event: ${action}`, {
    eventId: event.id,
    membershipId: event.data.membership?.id,
  });

  switch (action) {
    case 'membership.created':
      await handleMembershipCreated(event.data.membership!);
      break;

    case 'membership.updated':
      await handleMembershipUpdated(event.data.membership!);
      break;

    case 'membership.deleted':
      await handleMembershipDeleted(event.data.membership!);
      break;

    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data.membership!);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.data.membership!);
      break;

    default:
      logger.info(`[Whop] Unhandled webhook event type: ${action}`);
  }
}

/**
 * Handle membership creation (new subscription)
 */
async function handleMembershipCreated(membership: any) {
  const userEmail = membership.user.email;

  if (!userEmail) {
    logger.error('[Whop] Missing user email in membership.created event');
    return;
  }

  try {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (!user) {
      logger.error(`[Whop] User not found for email ${userEmail}`);
      return;
    }

    // Update user subscription status
    const plan = whopService.mapWhopPlanToRole(membership);

    await db
      .update(users)
      .set({
        subscription_status: membership.status,
        subscription_plan: plan,
        subscription_period_start: new Date(membership.renewal_period_start),
        subscription_period_end: new Date(membership.renewal_period_end),
        subscription_cancel_at_period_end: membership.cancel_at_period_end,
        whop_membership_id: membership.id,
        role: plan, // Upgrade role to premium
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`[Whop] Membership created for user ${user.id}`);
  } catch (error) {
    logger.error('[Whop] Failed to handle membership creation:', error);
    throw error;
  }
}

/**
 * Handle membership update (renewal, plan change, etc.)
 */
async function handleMembershipUpdated(membership: any) {
  const membershipId = membership.id;

  if (!membershipId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whop_membership_id, membershipId))
      .limit(1);

    if (!user) {
      logger.error(`[Whop] User not found for membership ${membershipId}`);
      return;
    }

    // Update subscription details
    const plan = whopService.mapWhopPlanToRole(membership);

    await db
      .update(users)
      .set({
        subscription_status: membership.status,
        subscription_plan: plan,
        subscription_period_start: new Date(membership.renewal_period_start),
        subscription_period_end: new Date(membership.renewal_period_end),
        subscription_cancel_at_period_end: membership.cancel_at_period_end,
        role: plan,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`[Whop] Membership updated for user ${user.id}`);
  } catch (error) {
    logger.error('[Whop] Failed to handle membership update:', error);
  }
}

/**
 * Handle membership deletion (subscription canceled/expired)
 */
async function handleMembershipDeleted(membership: any) {
  const membershipId = membership.id;

  if (!membershipId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whop_membership_id, membershipId))
      .limit(1);

    if (!user) return;

    // Downgrade to free tier
    await db
      .update(users)
      .set({
        subscription_status: 'free',
        subscription_plan: 'free',
        subscription_cancel_at_period_end: false,
        role: 'free',
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`[Whop] Membership deleted for user ${user.id}, downgraded to free`);
  } catch (error) {
    logger.error('[Whop] Failed to handle membership deletion:', error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(membership: any) {
  const membershipId = membership.id;

  if (!membershipId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whop_membership_id, membershipId))
      .limit(1);

    if (!user) return;

    // Update status to active and update renewal period
    await db
      .update(users)
      .set({
        subscription_status: 'active',
        subscription_period_start: new Date(membership.renewal_period_start),
        subscription_period_end: new Date(membership.renewal_period_end),
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`[Whop] Payment succeeded for user ${user.id}`);
  } catch (error) {
    logger.error('[Whop] Failed to handle payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(membership: any) {
  const membershipId = membership.id;

  if (!membershipId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.whop_membership_id, membershipId))
      .limit(1);

    if (!user) return;

    // Update status to past_due
    await db
      .update(users)
      .set({
        subscription_status: 'past_due',
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.warn(`[Whop] Payment failed for user ${user.id}`);
  } catch (error) {
    logger.error('[Whop] Failed to handle payment failure:', error);
  }
}
