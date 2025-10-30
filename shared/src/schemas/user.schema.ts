import { z } from 'zod';
import { emailSchema } from './auth.schema';
import { chainSchema, contractAddressSchema } from './analysis.schema';

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['free', 'premium', 'admin']);

/**
 * User tier enum
 */
export const userTierSchema = z.enum(['free', 'premium']);

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  email: emailSchema.optional(),
  displayName: z.string().min(2).max(50).optional(),
});

/**
 * Watchlist item schema
 */
export const watchlistItemSchema = z.object({
  contractAddress: contractAddressSchema,
  chain: chainSchema,
  addedAt: z.string().datetime().optional(),
});

/**
 * Add to watchlist schema
 */
export const addToWatchlistSchema = z.object({
  contractAddress: contractAddressSchema,
  chain: chainSchema,
});

/**
 * Remove from watchlist params schema
 */
export const removeFromWatchlistSchema = z.object({
  contractAddress: contractAddressSchema,
  chain: chainSchema,
});

/**
 * User quota schema
 */
export const userQuotaSchema = z.object({
  tier: userTierSchema,
  analysesUsed: z.number().min(0),
  analysesLimit: z.number().min(0),
  resetDate: z.string().datetime(),
});

/**
 * User profile response schema
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  displayName: z.string().nullable(),
  role: userRoleSchema,
  tier: userTierSchema,
  createdAt: z.string().datetime(),
  hasTwoFactor: z.boolean(),
  quota: userQuotaSchema.optional(),
});

// Export inferred types
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserTier = z.infer<typeof userTierSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type WatchlistItem = z.infer<typeof watchlistItemSchema>;
export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type RemoveFromWatchlistInput = z.infer<typeof removeFromWatchlistSchema>;
export type UserQuota = z.infer<typeof userQuotaSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

