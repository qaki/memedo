import { z } from 'zod';

/**
 * Password validation schema
 * Requirements: minimum 8 characters, at least one uppercase letter, one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

/**
 * Register request schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  totpToken: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 6, {
      message: '2FA token must be exactly 6 digits',
    }), // 2FA token (optional - empty string or 6 digits)
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset confirm schema
 */
export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Change password schema (for authenticated users)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

/**
 * 2FA setup schema (TOTP)
 */
export const totpSetupSchema = z.object({
  secret: z.string().min(1, 'TOTP secret is required'),
  token: z.string().length(6, 'TOTP token must be 6 digits'),
});

/**
 * 2FA verify schema
 */
export const totpVerifySchema = z.object({
  token: z.string().length(6, 'TOTP token must be 6 digits'),
});

// Export inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type TotpSetupInput = z.infer<typeof totpSetupSchema>;
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;
