/**
 * Premium Feature Middleware
 * Controls access to premium features based on subscription status
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { fastspringService } from '../services/fastspring.service.js';
import { SubscriptionPlan } from '../types/fastspring.types.js';

/**
 * Require premium subscription to access endpoint
 */
export const requirePremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    const [user] = await db
      .select({
        subscription_status: users.subscription_status,
        subscription_plan: users.subscription_plan,
        subscription_period_end: users.subscription_period_end,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check if user has active premium subscription
    const isPremium = user.subscription_status === 'active' || user.subscription_status === 'trial';

    // Check if subscription hasn't expired
    const isExpired = user.subscription_period_end
      ? new Date(user.subscription_period_end) < new Date()
      : false;

    if (!isPremium || isExpired) {
      throw new ApiError('Premium subscription required to access this feature', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check usage limits and enforce rate limiting based on subscription tier
 */
export const checkUsageLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    const [user] = await db
      .select({
        subscription_plan: users.subscription_plan,
        analyses_this_month: users.analyses_this_month,
        analyses_reset_date: users.analyses_reset_date,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check if usage should reset (monthly)
    const resetDate = user.analyses_reset_date || new Date();
    const now = new Date();
    const shouldReset = now >= resetDate;

    if (shouldReset) {
      // Reset usage counter
      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);

      await db
        .update(users)
        .set({
          analyses_this_month: 1, // Current request counts as 1
          analyses_reset_date: nextResetDate,
          updated_at: new Date(),
        })
        .where(eq(users.id, req.user.id));

      logger.info(`Usage reset for user ${req.user.id}`);
      return next();
    }

    // Get subscription benefits
    const plan = (user.subscription_plan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const benefits = fastspringService.getSubscriptionBenefits(plan);

    // Check if user has exceeded limit
    const currentUsage = user.analyses_this_month || 0;
    if (currentUsage >= benefits.maxAnalysesPerDay) {
      throw new ApiError(
        `Analysis limit reached. Upgrade to premium for unlimited analyses. (${currentUsage}/${benefits.maxAnalysesPerDay})`,
        429
      );
    }

    // Increment usage counter
    await db
      .update(users)
      .set({
        analyses_this_month: currentUsage + 1,
        updated_at: new Date(),
      })
      .where(eq(users.id, req.user.id));

    // Add usage info to request for logging
    req.usageInfo = {
      used: currentUsage + 1,
      limit: benefits.maxAnalysesPerDay,
      plan,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can add more tokens to watchlist
 */
export const checkWatchlistLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    const [user] = await db
      .select({
        subscription_plan: users.subscription_plan,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const plan = (user.subscription_plan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const benefits = fastspringService.getSubscriptionBenefits(plan);

    // TODO: Check actual watchlist count from database
    // For now, just attach the limit to the request
    req.watchlistLimit = benefits.maxWatchlistTokens;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Extend Express Request type to include usage info
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usageInfo?: {
        used: number;
        limit: number;
        plan: SubscriptionPlan;
      };
      watchlistLimit?: number;
    }
  }
}
