import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '../utils/jwt.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept token from either cookies OR Authorization header (for cross-domain support)
    let token = req.cookies.access_token;

    // If no cookie, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user from database to verify token version
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Check token version (for instant logout across devices)
    if (user.token_version !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Token has been revoked. Please login again.',
        },
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.token_version,
    };

    next();
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    ) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
      },
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
};

export const requireEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
      },
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

  if (!user || !user.email_verified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email verification required',
      },
    });
  }

  next();
};
