/**
 * FastSpring Webhook Handler
 * Processes subscription events from FastSpring
 */

import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { FastSpringWebhookEvent } from '../types/fastspring.types.js';
import { fastspringService } from '../services/fastspring.service.js';

/**
 * Handle FastSpring webhook events
 */
export const handleFastSpringWebhook = async (req: Request, res: Response) => {
  try {
    const events = req.body.events as FastSpringWebhookEvent[];

    if (!events || !Array.isArray(events)) {
      logger.error('Invalid webhook payload received');
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    logger.info(`Received ${events.length} webhook events from FastSpring`);

    for (const event of events) {
      try {
        await processWebhookEvent(event);
      } catch (error) {
        logger.error(`Failed to process webhook event ${event.id}:`, error);
        // Continue processing other events even if one fails
      }
    }

    // FastSpring expects a 200 response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Process individual webhook event
 */
async function processWebhookEvent(event: FastSpringWebhookEvent) {
  const { type, data } = event;

  logger.info(`Processing webhook event: ${type}`, {
    eventId: event.id,
    subscriptionId: data.subscription,
  });

  switch (type) {
    case 'subscription.activated':
      await handleSubscriptionActivated(data);
      break;

    case 'subscription.charge.completed':
      await handleSubscriptionCharged(data);
      break;

    case 'subscription.charge.failed':
      await handleSubscriptionChargeFailed(data);
      break;

    case 'subscription.canceled':
      await handleSubscriptionCanceled(data);
      break;

    case 'subscription.deactivated':
      await handleSubscriptionDeactivated(data);
      break;

    case 'subscription.updated':
      await handleSubscriptionUpdated(data);
      break;

    case 'subscription.payment.overdue':
      await handleSubscriptionOverdue(data);
      break;

    default:
      logger.info(`Unhandled webhook event type: ${type}`);
  }
}

/**
 * Handle subscription activation
 */
async function handleSubscriptionActivated(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId, account: accountId, product } = data;

  if (!subscriptionId || !accountId) {
    logger.error('Missing subscription or account ID in activation event');
    return;
  }

  try {
    // Get full subscription details from FastSpring
    const subscription = await fastspringService.getSubscription(subscriptionId);
    const plan = fastspringService.mapProductToPlan(product as string);

    // Find user by FastSpring account ID or email
    const account = await fastspringService.getAccount(accountId);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, account.contact.email))
      .limit(1);

    if (!user) {
      logger.error(`User not found for FastSpring account ${accountId}`);
      return;
    }

    // Update user subscription status
    await db
      .update(users)
      .set({
        subscription_status: subscription.state,
        subscription_plan: plan,
        subscription_period_start: new Date(subscription.begin * 1000),
        subscription_period_end: new Date(subscription.next * 1000),
        subscription_cancel_at_period_end: !subscription.autoRenew,
        fastspring_subscription_id: subscriptionId,
        fastspring_account_id: accountId,
        role: 'premium', // Upgrade role to premium
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`Subscription activated for user ${user.id}`);
  } catch (error) {
    logger.error('Failed to handle subscription activation:', error);
    throw error;
  }
}

/**
 * Handle successful subscription charge
 */
async function handleSubscriptionCharged(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId } = data;

  if (!subscriptionId) return;

  try {
    const subscription = await fastspringService.getSubscription(subscriptionId);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
      .limit(1);

    if (!user) {
      logger.error(`User not found for subscription ${subscriptionId}`);
      return;
    }

    // Update subscription period
    await db
      .update(users)
      .set({
        subscription_status: 'active',
        subscription_period_start: new Date(subscription.begin * 1000),
        subscription_period_end: new Date(subscription.next * 1000),
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`Subscription renewed for user ${user.id}`);
  } catch (error) {
    logger.error('Failed to handle subscription charge:', error);
  }
}

/**
 * Handle failed subscription charge
 */
async function handleSubscriptionChargeFailed(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId } = data;

  if (!subscriptionId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
      .limit(1);

    if (!user) return;

    // Update status to overdue
    await db
      .update(users)
      .set({
        subscription_status: 'overdue',
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.warn(`Subscription payment failed for user ${user.id}`);
  } catch (error) {
    logger.error('Failed to handle subscription charge failure:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId } = data;

  if (!subscriptionId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
      .limit(1);

    if (!user) return;

    await db
      .update(users)
      .set({
        subscription_status: 'canceled',
        subscription_cancel_at_period_end: true,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`Subscription canceled for user ${user.id}`);
  } catch (error) {
    logger.error('Failed to handle subscription cancellation:', error);
  }
}

/**
 * Handle subscription deactivation (end of billing period after cancel)
 */
async function handleSubscriptionDeactivated(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId } = data;

  if (!subscriptionId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
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

    logger.info(`Subscription deactivated for user ${user.id}, downgraded to free`);
  } catch (error) {
    logger.error('Failed to handle subscription deactivation:', error);
  }
}

/**
 * Handle subscription update (plan change)
 */
async function handleSubscriptionUpdated(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId, product } = data;

  if (!subscriptionId) return;

  try {
    const subscription = await fastspringService.getSubscription(subscriptionId);
    const plan = fastspringService.mapProductToPlan(product as string);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
      .limit(1);

    if (!user) return;

    await db
      .update(users)
      .set({
        subscription_plan: plan,
        subscription_period_end: new Date(subscription.next * 1000),
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info(`Subscription updated for user ${user.id} to plan ${plan}`);
  } catch (error) {
    logger.error('Failed to handle subscription update:', error);
  }
}

/**
 * Handle subscription payment overdue
 */
async function handleSubscriptionOverdue(data: FastSpringWebhookEvent['data']) {
  const { subscription: subscriptionId } = data;

  if (!subscriptionId) return;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.fastspring_subscription_id, subscriptionId))
      .limit(1);

    if (!user) return;

    await db
      .update(users)
      .set({
        subscription_status: 'overdue',
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.warn(`Subscription overdue for user ${user.id}`);
  } catch (error) {
    logger.error('Failed to handle subscription overdue:', error);
  }
}
