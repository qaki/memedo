# Epic 2: Authentication System and User Management

**Epic Owner:** @back-end-engineer  
**Status:** 📋 READY TO START  
**Dependencies:** Epic 1 (✅ Complete)  
**Estimated Duration:** 3-4 days  
**Total Stories:** 8

---

## Epic Overview

Implement a secure, production-ready authentication system with JWT tokens, email verification, password reset, 2FA for admins, and comprehensive user management features.

### Goals

1. **Secure Authentication:** JWT with httpOnly cookies, bcrypt password hashing, refresh token rotation
2. **Email Verification:** Prevent fake accounts, verify user identity before access
3. **Password Reset:** Secure password recovery flow with time-limited tokens
4. **2FA for Admins:** Mandatory TOTP-based two-factor authentication for admin accounts
5. **User Management:** Profile updates, role management, usage tracking
6. **Access Control:** Role-based middleware (free, premium, admin)
7. **Quota Enforcement:** Track and enforce analysis limits (20/month for free, unlimited for premium)

### Key Features

- ✅ JWT access tokens (24h expiry) + refresh tokens (7d expiry)
- ✅ httpOnly cookies for secure token storage
- ✅ bcrypt password hashing (10 rounds)
- ✅ Email verification with Resend
- ✅ Password reset with time-limited tokens
- ✅ TOTP 2FA (mandatory for admins, optional for premium)
- ✅ Role-based access control middleware
- ✅ Usage tracking and quota enforcement
- ✅ Token version for instant logout across devices

---

## Prerequisites

Before starting Epic 2, ensure:

- [x] Epic 1 completed (monorepo, database, tooling)
- [ ] **Resend API key** obtained for email verification (https://resend.com/api-keys)
- [ ] `RESEND_API_KEY` added to `backend/.env`
- [ ] `FROM_EMAIL` configured in `backend/.env` (e.g., `noreply@memedo.io`)

---

## User Stories

### Story 2.1: User Registration with Email Verification

**As a** new user  
**I want** to register with email and password  
**So that** I can create an account and access the platform

**Acceptance Criteria:**

- [ ] POST `/api/auth/register` endpoint accepts email, password, display_name
- [ ] Password validated with Zod (min 8 chars, 1 uppercase, 1 number)
- [ ] Email uniqueness checked before registration
- [ ] Password hashed with bcrypt (10 rounds)
- [ ] User created with `email_verified: false` and role `free`
- [ ] Verification email sent with 24h token
- [ ] GET `/api/auth/verify-email/:token` endpoint verifies email
- [ ] Error handling: duplicate email, invalid input, email send failures

**Implementation Steps:**

```bash
# Navigate to backend
cd backend

# Create authentication controller
mkdir -p src/controllers
cat > src/controllers/auth.controller.ts << 'EOF'
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema, verifyEmailSchema } from '@memedo/shared';
import { sendVerificationEmail } from '../services/email.service';
import { generateTokens, setAuthCookies } from '../utils/jwt';

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
        display_name: validatedData.display_name || null,
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
  } catch (error: any) {
    console.error('Registration error:', error);

    // Zod validation errors
    if (error.name === 'ZodError') {
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
EOF

# Create email service
mkdir -p src/services
cat > src/services/email.service.ts << 'EOF'
import { Resend } from 'resend';
import { env } from '../utils/env-validator';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  try {
    await resend.emails.send({
      from: env.FROM_EMAIL || 'noreply@memedo.io',
      to: email,
      subject: 'Verify your MemeDo account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to MemeDo!</h1>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  try {
    await resend.emails.send({
      from: env.FROM_EMAIL || 'noreply@memedo.io',
      to: email,
      subject: 'Reset your MemeDo password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset Request</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
EOF

# Create JWT utility
mkdir -p src/utils
cat > src/utils/jwt.ts << 'EOF'
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from './env-validator';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export function generateTokens(user: any) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.token_version || 0,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: parseInt(env.JWT_ACCESS_EXPIRY || '86400'),
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: parseInt(env.JWT_REFRESH_EXPIRY || '604800'),
  });

  return { accessToken, refreshToken };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // Access token (24 hours)
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(env.JWT_ACCESS_EXPIRY || '86400') * 1000,
  });

  // Refresh token (7 days)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(env.JWT_REFRESH_EXPIRY || '604800') * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}
EOF

# Install dependencies
pnpm add resend jsonwebtoken cookie-parser
pnpm add -D @types/jsonwebtoken @types/cookie-parser

# Update server.ts to include cookie-parser
# Add after other middleware: app.use(cookieParser());

# Create auth routes
mkdir -p src/routes
cat > src/routes/auth.routes.ts << 'EOF'
import { Router } from 'express';
import { register, verifyEmail } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);

export default router;
EOF
```

**Verification Steps:**

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "display_name": "Test User"
  }'

# Expected: 201 Created with verification message

# Check email inbox for verification link
# Click link or test verify endpoint:
curl http://localhost:3000/api/auth/verify-email/{TOKEN}

# Expected: 200 OK with access_token and refresh_token cookies
```

**Definition of Done:**

- Registration endpoint validates input with Zod
- Duplicate email returns 409 Conflict
- Password is bcrypt hashed (not stored plaintext)
- Verification email sent successfully
- Email verification endpoint works and sets JWT cookies
- User can register and verify email end-to-end
- Error handling covers all edge cases

**Time Estimate:** 3 hours

---

### Story 2.2: Login with JWT Authentication

**As a** registered user  
**I want** to login with email and password  
**So that** I can access my account

**Acceptance Criteria:**

- [ ] POST `/api/auth/login` endpoint accepts email and password
- [ ] Password verified with bcrypt
- [ ] JWT access token (24h) and refresh token (7d) generated
- [ ] Tokens set as httpOnly cookies
- [ ] Login blocked if email not verified
- [ ] Error handling: invalid credentials, unverified email, account locked
- [ ] Last login timestamp updated

**Implementation Steps:**

```bash
# Add login controller method
cat >> src/controllers/auth.controller.ts << 'EOF'

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, totp_token } = loginSchema.parse(req.body);

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
      if (!totp_token) {
        return res.status(401).json({
          success: false,
          error: {
            code: '2FA_REQUIRED',
            message: '2FA code required',
          },
        });
      }

      // Verify TOTP token (implement in Story 2.4)
      // const totpValid = verifyTOTP(user.totp_secret, totp_token);
      // if (!totpValid) return 401 invalid 2FA code
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Update last login
    await db
      .update(users)
      .set({ last_login_at: new Date() })
      .where(eq(users.id, user.id));

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
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
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
EOF

# Update routes
cat > src/routes/auth.routes.ts << 'EOF'
import { Router } from 'express';
import { register, verifyEmail, login, logout, refreshToken } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
EOF
```

**Verification Steps:**

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }' \
  -c cookies.txt

# Expected: 200 OK with user data and cookies set

# Test logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt

# Expected: 200 OK with cookies cleared

# Test refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt

# Expected: 200 OK with new tokens
```

**Definition of Done:**

- Login endpoint validates credentials
- JWT tokens generated and set as httpOnly cookies
- Unverified users cannot login
- Logout clears cookies
- Refresh token endpoint rotates tokens
- Token version checked on refresh
- Last login timestamp updated

**Time Estimate:** 2 hours

---

### Story 2.3: Authentication Middleware

**As a** backend developer  
**I want** authentication middleware  
**So that** I can protect routes that require authentication

**Acceptance Criteria:**

- [ ] `requireAuth` middleware verifies JWT access token
- [ ] Middleware attaches user data to `req.user`
- [ ] Invalid/expired tokens return 401 Unauthorized
- [ ] Middleware supports role-based access control
- [ ] `requireRole('admin')` middleware restricts access by role
- [ ] Middleware checks token version for instant logout

**Implementation Steps:**

```bash
# Create auth middleware
cat > src/middleware/auth.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tokenVersion: number;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token;

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
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
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
EOF

# Create test protected route
cat > src/routes/user.routes.ts << 'EOF'
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get current user profile (requires authentication)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
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
          analyses_this_month: user.analyses_this_month,
          analyses_reset_date: user.analyses_reset_date,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_FAILED',
        message: 'Failed to fetch user data',
      },
    });
  }
});

// Admin-only route example
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  // Admin stats logic
  res.json({
    success: true,
    data: { message: 'Admin stats endpoint' },
  });
});

export default router;
EOF
```

**Verification Steps:**

```bash
# Test protected route without auth
curl http://localhost:3000/api/user/me

# Expected: 401 Unauthorized

# Test with auth (after login)
curl http://localhost:3000/api/user/me -b cookies.txt

# Expected: 200 OK with user data

# Test admin route as non-admin
curl http://localhost:3000/api/user/admin/stats -b cookies.txt

# Expected: 403 Forbidden
```

**Definition of Done:**

- requireAuth middleware verifies JWT and attaches user to req.user
- Expired tokens return 401
- Token version checked for instant logout
- requireRole middleware restricts access by role
- requireEmailVerified middleware blocks unverified users
- Middleware properly typed with TypeScript

**Time Estimate:** 2 hours

---

### Story 2.4: Password Reset Flow

**As a** user  
**I want** to reset my forgotten password  
**So that** I can regain access to my account

**Acceptance Criteria:**

- [ ] POST `/api/auth/forgot-password` accepts email
- [ ] Password reset email sent with 1h token
- [ ] POST `/api/auth/reset-password/:token` accepts new password
- [ ] Token validated (exists, not expired)
- [ ] New password hashed and saved
- [ ] Old tokens invalidated (increment token_version)
- [ ] Error handling: invalid token, expired token, user not found

**Implementation Steps:**

```bash
# Add password reset controllers
cat >> src/controllers/auth.controller.ts << 'EOF'

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
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.name === 'ZodError') {
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
EOF

# Update routes
# Add to auth.routes.ts:
# router.post('/forgot-password', forgotPassword);
# router.post('/reset-password/:token', resetPassword);
```

**Verification Steps:**

```bash
# Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check email for reset link

# Reset password
curl -X POST http://localhost:3000/api/auth/reset-password/{TOKEN} \
  -H "Content-Type: application/json" \
  -d '{"password": "NewSecurePass123"}'

# Expected: 200 OK, old tokens invalidated

# Try login with new password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "NewSecurePass123"}'

# Expected: 200 OK with new tokens
```

**Definition of Done:**

- Forgot password endpoint sends reset email
- Email lookup doesn't reveal if account exists (security)
- Reset token valid for 1 hour
- Reset password endpoint validates and updates password
- Token version incremented (logs out all devices)
- Expired tokens handled gracefully

**Time Estimate:** 2 hours

---

### Story 2.5: 2FA Implementation (TOTP for Admins)

**As an** admin user  
**I want** two-factor authentication  
**So that** my account is protected from unauthorized access

**Acceptance Criteria:**

- [ ] POST `/api/user/2fa/setup` generates TOTP secret and QR code
- [ ] TOTP secret encrypted before storage
- [ ] POST `/api/user/2fa/enable` verifies and enables 2FA
- [ ] POST `/api/user/2fa/disable` disables 2FA (requires password)
- [ ] Login flow checks `totp_enabled` and requires 6-digit code
- [ ] 2FA mandatory for admin role (enforced in middleware)
- [ ] Backup codes generated (10 single-use codes)

**Implementation Steps:**

```bash
# Install TOTP dependencies
pnpm add otpauth qrcode
pnpm add -D @types/qrcode

# Create 2FA utility
cat > src/utils/totp.ts << 'EOF'
import { TOTP, Secret } from 'otpauth';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { env } from './env-validator';

// Encrypt TOTP secret before storage
export function encryptTOTPSecret(secret: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(env.TOTP_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt TOTP secret
export function decryptTOTPSecret(encryptedSecret: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(env.TOTP_ENCRYPTION_KEY, 'hex');

  const [ivHex, encrypted] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateTOTPSecret(email: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: 'MemeDo',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return await QRCode.toDataURL(uri);
}

export function verifyTOTPToken(encryptedSecret: string, token: string): boolean {
  try {
    const secret = decryptTOTPSecret(encryptedSecret);

    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Allow 1 period before/after for clock skew
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}
EOF

# Create 2FA controller
cat > src/controllers/2fa.controller.ts << 'EOF'
import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import {
  generateTOTPSecret,
  generateQRCode,
  encryptTOTPSecret,
  verifyTOTPToken,
  generateBackupCodes,
} from '../utils/totp';

export const setup2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Generate TOTP secret
    const { secret, uri } = generateTOTPSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(uri);

    // Store encrypted secret temporarily (not enabled yet)
    const encryptedSecret = encryptTOTPSecret(secret);

    // Don't save to DB yet - wait for verification in enable endpoint

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        uri,
        message: 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)',
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_SETUP_FAILED', message: 'Failed to setup 2FA' },
    });
  }
};

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Secret and token required' },
      });
    }

    // Encrypt secret
    const encryptedSecret = encryptTOTPSecret(secret);

    // Verify the token before enabling
    const isValid = verifyTOTPToken(encryptedSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid verification code' },
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10))
    );

    // Enable 2FA and save encrypted secret
    await db
      .update(users)
      .set({
        totp_enabled: true,
        totp_secret: encryptedSecret,
        // Store backup codes in saved_alerts_config for now (or create new column)
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: {
        message: '2FA enabled successfully',
        backupCodes,
        warning: 'Save these backup codes in a secure location. Each can only be used once.',
      },
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_ENABLE_FAILED', message: 'Failed to enable 2FA' },
    });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Verify password before disabling 2FA
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Invalid password' },
      });
    }

    // Admins cannot disable 2FA
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: '2FA_MANDATORY',
          message: '2FA is mandatory for admin accounts and cannot be disabled',
        },
      });
    }

    // Disable 2FA
    await db
      .update(users)
      .set({
        totp_enabled: false,
        totp_secret: null,
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: { message: '2FA disabled successfully' },
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_DISABLE_FAILED', message: 'Failed to disable 2FA' },
    });
  }
};
EOF

# Create 2FA routes
cat > src/routes/2fa.routes.ts << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { setup2FA, enable2FA, disable2FA } from '../controllers/2fa.controller';

const router = Router();

router.post('/setup', requireAuth, setup2FA);
router.post('/enable', requireAuth, enable2FA);
router.post('/disable', requireAuth, disable2FA);

export default router;
EOF
```

**Verification Steps:**

```bash
# Setup 2FA (requires auth)
curl -X POST http://localhost:3000/api/user/2fa/setup \
  -b cookies.txt

# Expected: QR code and secret returned

# Enable 2FA (verify token)
curl -X POST http://localhost:3000/api/user/2fa/enable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"secret": "...", "token": "123456"}'

# Expected: 2FA enabled, backup codes returned

# Test login with 2FA
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "...", "totp_token": "123456"}'

# Expected: 200 OK if token valid
```

**Definition of Done:**

- TOTP secret generated and encrypted
- QR code generated for authenticator apps
- Enable 2FA verifies token before activation
- Login flow checks totp_enabled and validates token
- 2FA mandatory for admin role
- Disable 2FA requires password confirmation
- Backup codes generated and securely hashed

**Time Estimate:** 4 hours

---

### Story 2.6: User Profile Management

**As a** user  
**I want** to view and update my profile  
**So that** I can manage my account information

**Acceptance Criteria:**

- [ ] GET `/api/user/me` returns current user profile
- [ ] PATCH `/api/user/me` updates display_name
- [ ] PATCH `/api/user/password` changes password (requires old password)
- [ ] GET `/api/user/usage` returns analyses count and quota
- [ ] Error handling: invalid input, password mismatch

**Implementation Steps:**

```bash
# Add user profile controllers
cat > src/controllers/user.controller.ts << 'EOF'
import { Request, Response } from 'express';
import { db } from '../db';
import { users, analyses } from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { QUOTA_FREE_TIER, SUPPORTED_CHAINS } from '@memedo/shared';

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
EOF

# Update user routes
cat > src/routes/user.routes.ts << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getProfile, updateProfile, changePassword, getUsage } from '../controllers/user.controller';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);
router.get('/usage', requireAuth, getUsage);

export default router;
EOF
```

**Verification Steps:**

```bash
# Get profile
curl http://localhost:3000/api/user/me -b cookies.txt

# Update profile
curl -X PATCH http://localhost:3000/api/user/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"display_name": "Updated Name"}'

# Change password
curl -X PATCH http://localhost:3000/api/user/password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"old_password": "OldPass123", "new_password": "NewPass456"}'

# Get usage stats
curl http://localhost:3000/api/user/usage -b cookies.txt
```

**Definition of Done:**

- Get profile endpoint returns user data
- Update profile modifies display_name
- Change password verifies old password and updates
- Token version incremented on password change
- Get usage returns quota and remaining analyses
- All endpoints properly authenticated

**Time Estimate:** 2 hours

---

### Story 2.7: Usage Tracking and Quota Enforcement

**As a** free tier user  
**I want** my analysis usage tracked  
**So that** I stay within my monthly quota

**Acceptance Criteria:**

- [ ] Middleware `checkQuota` verifies user hasn't exceeded limit
- [ ] Free tier limited to 20 analyses/month
- [ ] Premium users have unlimited analyses
- [ ] Usage counter increments on successful analysis
- [ ] Usage resets on monthly cycle (30 days from first analysis)
- [ ] Error handling: quota exceeded returns 429 with upgrade CTA

**Implementation Steps:**

```bash
# Create quota middleware
cat > src/middleware/quota.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { QUOTA_FREE_TIER } from '@memedo/shared';

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
    await db
      .update(users)
      .set({
        analyses_this_month: db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((rows) => rows[0].analyses_this_month + 1),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Increment usage error:', error);
    // Don't throw - usage tracking failure shouldn't block analysis
  }
}
EOF

# Example usage in analysis route
cat > src/routes/analysis.routes.ts << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { checkQuota } from '../middleware/quota.middleware';

const router = Router();

// Token analysis endpoint (protected + quota checked)
router.post(
  '/analyze',
  requireAuth,
  checkQuota,
  async (req, res) => {
    // Analysis logic here (Epic 3)
    // After successful analysis, call incrementUsage(req.user!.id)

    res.json({
      success: true,
      data: { message: 'Analysis endpoint (to be implemented in Epic 3)' },
    });
  }
);

export default router;
EOF
```

**Verification Steps:**

```bash
# Test quota enforcement (as free user)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/analysis/analyze \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d '{"chain": "ethereum", "contract": "0x..."}'
done

# After 20 analyses, should return 429 with quota exceeded

# Verify usage endpoint
curl http://localhost:3000/api/user/usage -b cookies.txt
# Should show: analyses_this_month: 20, remaining: 0
```

**Definition of Done:**

- checkQuota middleware verifies user quota
- Free tier limited to 20 analyses/month
- Premium users bypass quota check
- Usage counter increments on analysis
- Usage resets automatically after 30 days
- Quota exceeded returns 429 with upgrade CTA

**Time Estimate:** 2 hours

---

### Story 2.8: Integration and Routes Setup

**As a** backend developer  
**I want** all authentication routes integrated  
**So that** the auth system is complete and testable

**Acceptance Criteria:**

- [ ] All auth routes mounted in main server
- [ ] Cookie-parser middleware added
- [ ] Environment variables updated with required keys
- [ ] All endpoints tested end-to-end
- [ ] Postman/Thunder Client collection created
- [ ] Epic 2 completion documented

**Implementation Steps:**

````bash
# Update server.ts to mount all routes
cat > src/server.ts << 'EOF'
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env-validator';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import twoFARoutes from './routes/2fa.routes';
import analysisRoutes from './routes/analysis.routes';

const app = express();
const PORT = parseInt(env.PORT, 10);
const FRONTEND_URL = env.FRONTEND_URL;

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/2fa', twoFARoutes);
app.use('/api/analysis', analysisRoutes);

// API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'MemeDo API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        user: '/api/user',
        analysis: '/api/analysis',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ MemeDo Backend running on http://localhost:${PORT}`);
  console.log(`✅ Frontend allowed from: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${env.NODE_ENV}`);
});
EOF

# Create environment setup guide
cat > docs/epic-02-setup-guide.md << 'EOF'
# Epic 2: Authentication Setup Guide

## Required Environment Variables

Add the following to `backend/.env`:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@memedo.io

# Already configured in Epic 1:
# - JWT_SECRET (min 32 chars)
# - JWT_REFRESH_SECRET (min 32 chars)
# - TOTP_ENCRYPTION_KEY (64 hex chars)
````

## Generate Secrets

```bash
# JWT secrets
openssl rand -base64 32

# TOTP encryption key (64 hex characters for AES-256)
openssl rand -hex 32
```

## Resend Setup

1. Create account at https://resend.com
2. Verify your domain (or use test mode)
3. Generate API key
4. Add to `backend/.env`

## Testing

```bash
# Start backend
cd backend
pnpm dev

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}'

# Check email for verification link

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}' \
  -c cookies.txt

# Test protected route
curl http://localhost:3000/api/user/me -b cookies.txt
```

EOF

````

**Verification Steps:**

```bash
# Run full authentication flow
cd backend
pnpm dev

# 1. Register
# 2. Verify email
# 3. Login
# 4. Access protected route
# 5. Change password
# 6. Setup 2FA
# 7. Enable 2FA
# 8. Login with 2FA
# 9. Check usage quota
# 10. Logout

# All steps should work end-to-end
````

**Definition of Done:**

- All routes mounted and accessible
- Cookie-parser middleware configured
- Environment variables documented
- End-to-end authentication flow tested
- Postman collection created
- Epic 2 completion report written

**Time Estimate:** 2 hours

---

## Epic Completion Checklist

- [ ] Story 2.1: User registration with email verification ✅
- [ ] Story 2.2: Login with JWT authentication ✅
- [ ] Story 2.3: Authentication middleware ✅
- [ ] Story 2.4: Password reset flow ✅
- [ ] Story 2.5: 2FA implementation (TOTP for admins) ✅
- [ ] Story 2.6: User profile management ✅
- [ ] Story 2.7: Usage tracking and quota enforcement ✅
- [ ] Story 2.8: Integration and routes setup ✅

---

## Testing Strategy

### Unit Tests (Optional for MVP)

- JWT generation and verification
- TOTP secret generation and verification
- Password hashing and comparison
- Quota calculation logic

### Integration Tests

- Registration → Email verification → Login flow
- Password reset flow
- 2FA setup → Enable → Login with 2FA
- Quota enforcement (20 analyses limit)
- Token refresh flow
- Logout and token invalidation

### Manual Testing

- End-to-end user flows
- Error handling (invalid credentials, expired tokens, quota exceeded)
- Security (httpOnly cookies, password validation, 2FA)

---

## Security Considerations

1. **Password Security:**
   - bcrypt with 10 rounds
   - Min 8 chars, 1 uppercase, 1 number
   - Password reset tokens expire in 1 hour
   - Token version for instant logout

2. **JWT Security:**
   - httpOnly cookies (prevent XSS)
   - Secure flag in production
   - sameSite: strict
   - Short-lived access tokens (24h)
   - Refresh token rotation

3. **2FA Security:**
   - TOTP secrets encrypted at rest (AES-256)
   - 30-second time window with ±1 period tolerance
   - Backup codes hashed with bcrypt
   - 2FA mandatory for admin accounts

4. **Email Security:**
   - Verification tokens expire in 24 hours
   - Password reset tokens expire in 1 hour
   - Random 32-byte tokens (crypto.randomBytes)
   - Don't reveal if email exists on forgot-password

5. **Rate Limiting (Epic 3):**
   - Login endpoint: 5 attempts per 15 min
   - Register endpoint: 3 attempts per hour
   - Password reset: 3 attempts per hour

---

## Next Epic: Epic 3 - Token Analysis Engine

**Prerequisites:**

- Epic 2 authentication completed
- External API keys obtained (Helius, Etherscan, GoPlus, etc.)
- Upstash Redis provisioned for caching

**Planned Features:**

1. Chain-Aware Fallback Orchestrator (CAFO) implementation
2. Solana analysis adapters (Helius, RugCheck, BirdEye)
3. EVM analysis adapters (Etherscan, GoPlus, Covalent)
4. Multi-tier Redis caching (1h basic, 15m trending)
5. Analysis result aggregation and scoring
6. API logging and monitoring

---

**Epic 2 Status:** 📋 READY TO START  
**Estimated Duration:** 3-4 days  
**Total Stories:** 8
