import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const QUOTA_FREE_TIER = 20; // Free users get 20 analyses per month

export const checkQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Authentication required' },
      });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Premium users have unlimited quota
    if (user.role === 'premium' || user.role === 'admin') {
      return next();
    }

    // Check if reset date has passed (30 days)
    const resetDate = new Date(user.analyses_reset_date);
    const now = new Date();

    if (now > resetDate) {
      // Reset usage counter
      const newResetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

      await db
        .update(users)
        .set({
          analyses_this_month: 0,
          analyses_reset_date: newResetDate,
        })
        .where(eq(users.id, user.id));

      // User's quota is reset, allow analysis
      return next();
    }

    // Check if user has exceeded quota
    if (user.analyses_this_month >= QUOTA_FREE_TIER) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `You have reached your monthly limit of ${QUOTA_FREE_TIER} analyses. Upgrade to Premium for unlimited analyses.`,
          data: {
            current_usage: user.analyses_this_month,
            quota: QUOTA_FREE_TIER,
            reset_date: user.analyses_reset_date,
            upgrade_url: `${process.env.FRONTEND_URL}/pricing`,
          },
        },
      });
    }

    // User has quota remaining
    next();
  } catch (error) {
    console.error('Check quota error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'QUOTA_CHECK_FAILED', message: 'Failed to check usage quota' },
    });
  }
};

export async function incrementUsage(userId: string) {
  try {
    // Fetch current count first
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user) {
      await db
        .update(users)
        .set({
          analyses_this_month: user.analyses_this_month + 1,
        })
        .where(eq(users.id, userId));
    }
  } catch (error) {
    console.error('Increment usage error:', error);
    // Don't throw - usage tracking failure shouldn't block analysis
  }
}
