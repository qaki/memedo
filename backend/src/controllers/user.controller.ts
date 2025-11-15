import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const QUOTA_FREE_TIER = 20; // Free users get 20 analyses per month

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          email_verified: user.email_verified,
          totp_enabled: user.totp_enabled,
          analyses_this_month: user.analyses_this_month,
          analyses_reset_date: user.analyses_reset_date,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_PROFILE_FAILED', message: 'Failed to fetch profile' },
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { display_name } = req.body;

    // Validate display_name
    if (display_name && (display_name.length > 100 || display_name.length < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DISPLAY_NAME',
          message: 'Display name must be between 1 and 100 characters',
        },
      });
    }

    await db
      .update(users)
      .set({
        display_name,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: { message: 'Profile updated successfully' },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_PROFILE_FAILED', message: 'Failed to update profile' },
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { old_password, new_password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Verify old password
    const passwordMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
      });
    }

    // Validate new password
    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 8 characters with 1 uppercase and 1 number',
        },
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Update password and increment token version (logout all sessions)
    await db
      .update(users)
      .set({
        password_hash: passwordHash,
        token_version: user.token_version + 1,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: { message: 'Password changed successfully. Please login again.' },
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CHANGE_PASSWORD_FAILED', message: 'Failed to change password' },
    });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Calculate quota based on role
    const quota = user.role === 'free' ? QUOTA_FREE_TIER : -1; // -1 = unlimited

    res.json({
      success: true,
      data: {
        analyses_this_month: user.analyses_this_month,
        quota,
        remaining: user.role === 'free' ? Math.max(0, quota - user.analyses_this_month) : -1,
        reset_date: user.analyses_reset_date,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_USAGE_FAILED', message: 'Failed to fetch usage data' },
    });
  }
};
