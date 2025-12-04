/**
 * Subscription Management Controller (Whop)
 * Handles user subscription operations via Whop
 */

import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { whopService } from '../services/whop.service.js';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        email: users.email,
        subscription_status: users.subscription_status,
        subscription_plan: users.subscription_plan,
        subscription_period_start: users.subscription_period_start,
        subscription_period_end: users.subscription_period_end,
        subscription_cancel_at_period_end: users.subscription_cancel_at_period_end,
        whop_membership_id: users.whop_membership_id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify with Whop API for most up-to-date status
    let membership = null;
    if (user.whop_membership_id) {
      membership = await whopService.getMembership(user.whop_membership_id);
    }

    res.json({
      status: user.subscription_status || 'free',
      plan: user.subscription_plan || 'free',
      periodStart: user.subscription_period_start,
      periodEnd: user.subscription_period_end,
      cancelAtPeriodEnd: user.subscription_cancel_at_period_end || false,
      whopMembershipId: user.whop_membership_id,
      membership: membership
        ? {
            id: membership.id,
            status: membership.status,
            valid: membership.valid,
            planName: membership.plan.name,
            price: membership.plan.price,
            interval: membership.plan.interval,
          }
        : null,
    });
  } catch (error) {
    logger.error('[Subscription] Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription purchase
 * Two-step dynamic checkout flow:
 * 1. Frontend calls this endpoint
 * 2. Backend generates secure Whop checkout URL with metadata
 * 3. Frontend redirects user to that URL
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { plan } = req.body as { plan?: string };

    const [user] = await db
      .select({
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Generate dynamic checkout URL via Whop API
    // This embeds the user ID in metadata for webhook reconciliation
    const checkoutUrl = await whopService.generateCheckoutSession(userId, user.email, plan);

    logger.info(`[Subscription] Generated dynamic checkout URL for user ${userId}`);

    res.json({
      checkoutUrl,
      plan: plan || 'default',
      userId, // Return for debugging
    });
  } catch (error) {
    logger.error('[Subscription] Failed to create checkout session:', error);
    throw error;
  }
};

/**
 * Get customer portal URL for managing subscription on Whop
 */
export const getCustomerPortal = async (req: Request, res: Response) => {
  try {
    const portalUrl = whopService.getCustomerPortalUrl();

    res.json({
      portalUrl,
    });
  } catch (error) {
    logger.error('[Subscription] Failed to get customer portal:', error);
    throw error;
  }
};

/**
 * Verify user's subscription with Whop API
 * Useful for manual sync/refresh
 */
export const verifySubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db
      .select({
        email: users.email,
        whop_membership_id: users.whop_membership_id,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify with Whop API
    const verification = await whopService.verifySubscription(user.email);

    // Update local database if status changed
    if (verification.membership) {
      await db
        .update(users)
        .set({
          subscription_status: verification.membership.status,
          subscription_plan: verification.plan,
          subscription_period_start: new Date(verification.membership.renewal_period_start),
          subscription_period_end: new Date(verification.membership.renewal_period_end),
          subscription_cancel_at_period_end: verification.membership.cancel_at_period_end,
          whop_membership_id: verification.membership.id,
          role: verification.plan,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId));

      logger.info(`[Subscription] Synced subscription status for user ${userId}`);
    }

    res.json({
      hasActiveSubscription: verification.hasActiveSubscription,
      plan: verification.plan,
      membership: verification.membership,
    });
  } catch (error) {
    logger.error('[Subscription] Failed to verify subscription:', error);
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
        role: users.role,
        analyses_this_month: users.analyses_this_month,
        analyses_reset_date: users.analyses_reset_date,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Define limits based on plan
    const isPremium = user.role === 'premium';
    const limits = {
      maxAnalysesPerDay: isPremium ? 999999 : 10, // Unlimited for premium
      canUseAdvancedFilters: isPremium,
      canUseWatchlist: isPremium,
      canUseAlerts: isPremium,
    };

    res.json({
      plan: user.subscription_plan || 'free',
      analysesUsed: user.analyses_this_month || 0,
      analysesLimit: limits.maxAnalysesPerDay,
      resetDate: user.analyses_reset_date,
      limits,
    });
  } catch (error) {
    logger.error('[Subscription] Failed to get subscription usage:', error);
    throw error;
  }
};
