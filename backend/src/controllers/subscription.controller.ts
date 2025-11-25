/**
 * Subscription Management Controller
 * Handles user subscription operations
 */

import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { fastspringService } from '../services/fastspring.service.js';
import { ApiError } from '@memedo/shared';
import { logger } from '../utils/logger.js';
import { SubscriptionPlan } from '../types/fastspring.types.js';

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        subscription_status: users.subscription_status,
        subscription_plan: users.subscription_plan,
        subscription_period_start: users.subscription_period_start,
        subscription_period_end: users.subscription_period_end,
        subscription_cancel_at_period_end: users.subscription_cancel_at_period_end,
        fastspring_subscription_id: users.fastspring_subscription_id,
        fastspring_account_id: users.fastspring_account_id,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Get benefits for current plan
    const plan = (user.subscription_plan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const benefits = fastspringService.getSubscriptionBenefits(plan);

    res.json({
      status: user.subscription_status || 'free',
      plan: user.subscription_plan || 'free',
      periodStart: user.subscription_period_start,
      periodEnd: user.subscription_period_end,
      cancelAtPeriodEnd: user.subscription_cancel_at_period_end || false,
      fastspringSubscriptionId: user.fastspring_subscription_id,
      fastspringAccountId: user.fastspring_account_id,
      benefits,
    });
  } catch (error) {
    logger.error('Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription purchase
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { plan } = req.body as { plan: 'monthly' | 'yearly' };

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      throw new ApiError('Invalid plan selected', 400);
    }

    const [user] = await db
      .select({
        email: users.email,
        fastspring_account_id: users.fastspring_account_id,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Map plan to FastSpring product path
    const product = plan === 'monthly' ? SubscriptionPlan.MONTHLY : SubscriptionPlan.YEARLY;

    // Generate checkout URL
    const checkoutUrl = fastspringService.getCheckoutUrl(product, {
      email: user.email,
      accountId: user.fastspring_account_id || undefined,
    });

    res.json({
      checkoutUrl,
      plan: product,
    });
  } catch (error) {
    logger.error('Failed to create checkout session:', error);
    throw error;
  }
};

/**
 * Cancel user's subscription (cancel at period end)
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        fastspring_subscription_id: users.fastspring_subscription_id,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.fastspring_subscription_id) {
      throw new ApiError('No active subscription found', 404);
    }

    // Cancel subscription in FastSpring
    await fastspringService.cancelSubscription(user.fastspring_subscription_id);

    // Update local database
    await db
      .update(users)
      .set({
        subscription_cancel_at_period_end: true,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Subscription canceled successfully',
      cancelAtPeriodEnd: true,
    });
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        fastspring_subscription_id: users.fastspring_subscription_id,
        subscription_cancel_at_period_end: users.subscription_cancel_at_period_end,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.fastspring_subscription_id) {
      throw new ApiError('No subscription found', 404);
    }

    if (!user.subscription_cancel_at_period_end) {
      throw new ApiError('Subscription is not canceled', 400);
    }

    // Reactivate in FastSpring
    await fastspringService.reactivateSubscription(user.fastspring_subscription_id);

    // Update local database
    await db
      .update(users)
      .set({
        subscription_cancel_at_period_end: false,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Subscription reactivated successfully',
      cancelAtPeriodEnd: false,
    });
  } catch (error) {
    logger.error('Failed to reactivate subscription:', error);
    throw error;
  }
};

/**
 * Update subscription plan (upgrade/downgrade)
 */
export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { plan } = req.body as { plan: 'monthly' | 'yearly' };

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      throw new ApiError('Invalid plan selected', 400);
    }

    const [user] = await db
      .select({
        fastspring_subscription_id: users.fastspring_subscription_id,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.fastspring_subscription_id) {
      throw new ApiError('No active subscription found', 404);
    }

    // Map plan to FastSpring product path
    const product = plan === 'monthly' ? SubscriptionPlan.MONTHLY : SubscriptionPlan.YEARLY;

    // Update in FastSpring
    await fastspringService.updateSubscriptionProduct(user.fastspring_subscription_id, product);

    // Update local database
    await db
      .update(users)
      .set({
        subscription_plan: product,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Subscription plan updated successfully',
      plan: product,
    });
  } catch (error) {
    logger.error('Failed to update subscription plan:', error);
    throw error;
  }
};

/**
 * Get subscription usage and limits
 */
export const getSubscriptionUsage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        subscription_plan: users.subscription_plan,
        analyses_this_month: users.analyses_this_month,
        analyses_reset_date: users.analyses_reset_date,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const plan = (user.subscription_plan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const benefits = fastspringService.getSubscriptionBenefits(plan);

    res.json({
      plan,
      analysesUsed: user.analyses_this_month || 0,
      analysesLimit: benefits.maxAnalysesPerDay,
      resetDate: user.analyses_reset_date,
      benefits,
    });
  } catch (error) {
    logger.error('Failed to get subscription usage:', error);
    throw error;
  }
};
