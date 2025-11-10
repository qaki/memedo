import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema, loginSchema } from '@memedo/shared';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { generateTokens, setAuthCookies, clearAuthCookies, verifyRefreshToken } from '../utils/jwt';
import { verifyTOTPToken } from '../utils/totp';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input with Zod
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Generate email verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password_hash: passwordHash,
        display_name: null, // No display_name in registerSchema
        role: 'free',
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpiry,
      })
      .returning();

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      data: {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: newUser.id,
          email: newUser.email,
          display_name: newUser.display_name,
          email_verified: newUser.email_verified,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);

    // Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'An error occurred during registration',
      },
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email_verification_token, token))
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token',
        },
      });
    }

    // Check if token is expired
    if (user.email_verification_expires && user.email_verification_expires < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Verification token has expired. Please request a new one.',
        },
      });
    }

    // Mark email as verified and clear verification token
    await db
      .update(users)
      .set({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
      })
      .where(eq(users.id, user.id));

    // Generate JWT tokens and set cookies
    const tokens = generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        message: 'Email verified successfully. You are now logged in.',
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          email_verified: true,
        },
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: 'An error occurred during email verification',
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, totpToken } = loginSchema.parse(req.body);

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
        },
      });
    }

    // Check for 2FA (if enabled)
    if (user.totp_enabled) {
      if (!totpToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: '2FA_REQUIRED',
            message: '2FA code required',
          },
        });
      }

      // Verify TOTP token
      if (!user.totp_secret) {
        return res.status(500).json({
          success: false,
          error: {
            code: '2FA_NOT_CONFIGURED',
            message: '2FA is enabled but not properly configured',
          },
        });
      }

      const totpValid = verifyTOTPToken(user.totp_secret, totpToken);
      if (!totpValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_2FA_CODE',
            message: 'Invalid 2FA code',
          },
        });
      }
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Update last login
    await db.update(users).set({ last_login_at: new Date() }).where(eq(users.id, user.id));

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          email_verified: user.email_verified,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'An error occurred during login',
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token not provided',
        },
      });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Get user to check token version
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user || user.token_version !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or revoked refresh token',
        },
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      data: { message: 'Tokens refreshed successfully' },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'REFRESH_FAILED',
        message: 'Failed to refresh tokens',
      },
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.json({
        success: true,
        data: {
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // Save token to database
    await db
      .update(users)
      .set({
        password_reset_token: resetToken,
        password_reset_expires: resetExpiry,
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      data: {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_FAILED',
        message: 'An error occurred while processing your request',
      },
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate new password
    const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);
    passwordSchema.parse(password);

    // Find user with this reset token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.password_reset_token, token))
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token',
        },
      });
    }

    // Check if token is expired
    if (user.password_reset_expires && user.password_reset_expires < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Reset token has expired. Please request a new one.',
        },
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password, clear reset token, increment token version (logout all sessions)
    await db
      .update(users)
      .set({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
        token_version: user.token_version + 1, // Invalidate all existing tokens
      })
      .where(eq(users.id, user.id));

    res.json({
      success: true,
      data: {
        message: 'Password reset successfully. Please login with your new password.',
      },
    });
  } catch (error: unknown) {
    console.error('Reset password error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 8 characters with 1 uppercase and 1 number',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_FAILED',
        message: 'An error occurred while resetting your password',
      },
    });
  }
};
