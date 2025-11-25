/**
 * Subscription Schemas
 * Validation schemas for subscription-related operations
 */

import { z } from 'zod';

/**
 * Subscription status enum
 */
export const subscriptionStatusSchema = z.enum([
  'free',
  'active',
  'trial',
  'canceled',
  'overdue',
  'deactivated',
]);

/**
 * Subscription plan enum
 */
export const subscriptionPlanSchema = z.enum(['free', 'memego-pro-monthly', 'memego-pro-yearly']);

/**
 * Checkout plan selection
 */
export const checkoutPlanSchema = z.enum(['monthly', 'yearly']);

/**
 * Create checkout session request
 */
export const createCheckoutSessionSchema = z.object({
  plan: checkoutPlanSchema,
});

/**
 * Update subscription plan request
 */
export const updateSubscriptionPlanSchema = z.object({
  plan: checkoutPlanSchema,
});

/**
 * Subscription benefits
 */
export const subscriptionBenefitsSchema = z.object({
  maxAnalysesPerDay: z.number(),
  maxWatchlistTokens: z.number(),
  exportReports: z.boolean(),
  prioritySupport: z.boolean(),
  advancedAnalytics: z.boolean(),
});

/**
 * Subscription status response
 */
export const subscriptionStatusResponseSchema = z.object({
  status: subscriptionStatusSchema,
  plan: subscriptionPlanSchema,
  periodStart: z.string().datetime().nullable(),
  periodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  fastspringSubscriptionId: z.string().nullable(),
  fastspringAccountId: z.string().nullable(),
  benefits: subscriptionBenefitsSchema,
});

/**
 * Checkout session response
 */
export const checkoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  plan: subscriptionPlanSchema,
});

/**
 * Subscription usage response
 */
export const subscriptionUsageResponseSchema = z.object({
  plan: subscriptionPlanSchema,
  analysesUsed: z.number(),
  analysesLimit: z.number(),
  resetDate: z.string().datetime(),
  benefits: subscriptionBenefitsSchema,
});

// Export inferred types
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type CheckoutPlan = z.infer<typeof checkoutPlanSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>;
export type SubscriptionBenefits = z.infer<typeof subscriptionBenefitsSchema>;
export type SubscriptionStatusResponse = z.infer<typeof subscriptionStatusResponseSchema>;
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;
export type SubscriptionUsageResponse = z.infer<typeof subscriptionUsageResponseSchema>;
