/**
 * Whop Integration Service
 * https://docs.whop.com/
 *
 * Handles:
 * - Subscription status checking
 * - User validation via Whop API
 * - Webhook signature verification
 * - Plan management
 */

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const WHOP_API_KEY = process.env.WHOP_API_KEY || '';
const WHOP_PLAN_ID_PRO = process.env.WHOP_PLAN_ID_PRO || ''; // Your specific plan ID
const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || '';
const WHOP_API_BASE = 'https://api.whop.com/api/v2';

export interface WhopMembership {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  product: {
    id: string;
    name: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
  valid: boolean;
  cancel_at_period_end: boolean;
  renewal_period_start: string;
  renewal_period_end: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface WhopWebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
    action:
      | 'membership.created'
      | 'membership.updated'
      | 'membership.deleted'
      | 'payment.succeeded'
      | 'payment.failed';
    membership?: WhopMembership;
  };
  created_at: string;
}

export class WhopService {
  private apiKey: string;
  private planIdPro: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = WHOP_API_KEY;
    this.planIdPro = WHOP_PLAN_ID_PRO;
    this.webhookSecret = WHOP_WEBHOOK_SECRET;

    if (!this.apiKey) {
      logger.warn('[Whop] API key not configured - subscription features will be limited');
    }
  }

  /**
   * Get Whop API headers
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Validate webhook signature
   * Whop uses HMAC SHA-256 for webhook verification
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      logger.warn('[Whop] Webhook secret not configured - skipping verification');
      return true; // Allow in development
    }

    try {
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const calculatedSignature = hmac.update(payload).digest('hex');

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
    } catch (error) {
      logger.error('[Whop] Webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Get membership by ID
   */
  async getMembership(membershipId: string): Promise<WhopMembership | null> {
    try {
      logger.info(`[Whop] Fetching membership: ${membershipId}`);

      const response = await axios.get(`${WHOP_API_BASE}/memberships/${membershipId}`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      logger.error('[Whop] Failed to fetch membership:', error);
      return null;
    }
  }

  /**
   * Get all memberships for a user by email
   */
  async getMembershipsByEmail(email: string): Promise<WhopMembership[]> {
    try {
      logger.info(`[Whop] Fetching memberships for email: ${email}`);

      const response = await axios.get(`${WHOP_API_BASE}/memberships`, {
        headers: this.getHeaders(),
        params: {
          email: email,
          // Filter by plan if available
          ...(this.planIdPro && { plan: this.planIdPro }),
        },
        timeout: 10000,
      });

      return response.data.data || [];
    } catch (error) {
      logger.error('[Whop] Failed to fetch memberships by email:', error);
      return [];
    }
  }

  /**
   * Verify if a user has an active subscription
   */
  async verifySubscription(email: string): Promise<{
    hasActiveSubscription: boolean;
    membership: WhopMembership | null;
    plan: 'free' | 'premium';
  }> {
    try {
      const memberships = await this.getMembershipsByEmail(email);

      // Find active membership
      const activeMembership = memberships.find(
        (m) => m.valid && (m.status === 'active' || m.status === 'trialing')
      );

      if (activeMembership) {
        logger.info(`[Whop] Active subscription found for ${email}`);
        return {
          hasActiveSubscription: true,
          membership: activeMembership,
          plan: 'premium',
        };
      }

      logger.info(`[Whop] No active subscription for ${email}`);
      return {
        hasActiveSubscription: false,
        membership: null,
        plan: 'free',
      };
    } catch (error) {
      logger.error('[Whop] Subscription verification failed:', error);
      return {
        hasActiveSubscription: false,
        membership: null,
        plan: 'free',
      };
    }
  }

  /**
   * Create a dynamic checkout session via Whop API
   * This generates a unique purchase URL with embedded metadata
   * @param userId - Your internal user ID (for tracking)
   * @param userEmail - User's email address
   * @param planId - Optional specific plan ID (defaults to configured Pro plan)
   */
  async generateCheckoutSession(
    userId: string,
    userEmail: string,
    planId?: string
  ): Promise<string> {
    try {
      // Use provided planId or default to configured plan
      const targetPlan = planId || this.planIdPro;

      logger.info(`[Whop] Generating checkout session for user ${userId}, email: ${userEmail}`);

      const response = await axios.post(
        `${WHOP_API_BASE}/checkout/sessions`,
        {
          plan_id: targetPlan,
          email: userEmail,
          metadata: {
            user_id: userId, // Embed user ID for webhook reconciliation
            source: 'memedo_frontend',
          },
          success_url: 'https://meme-go.com/dashboard?checkout=success',
          cancel_url: 'https://meme-go.com/pricing?checkout=cancelled',
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      const checkoutUrl = response.data.checkout_url || response.data.url;

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned from Whop API');
      }

      logger.info(`[Whop] Generated checkout URL for user ${userId}`);
      return checkoutUrl;
    } catch (error) {
      logger.error('[Whop] Failed to generate checkout session:', error);

      // Fallback to simple checkout URL if API fails
      logger.warn('[Whop] Falling back to basic checkout URL');
      return this.getBasicCheckoutUrl(userEmail, planId);
    }
  }

  /**
   * Fallback: Basic checkout URL (without API call)
   * Used when the dynamic checkout API fails
   */
  private getBasicCheckoutUrl(userEmail: string, planId?: string): string {
    const baseUrl = `https://whop.com/checkout`;
    const targetPlan = planId || this.planIdPro;

    const params = new URLSearchParams({
      plan: targetPlan,
      email: userEmail,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get customer portal URL for managing subscription
   */
  getCustomerPortalUrl(): string {
    return 'https://whop.com/hub/manage';
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: WhopWebhookEvent): Promise<{
    userId: string | null;
    action: string;
    membership: WhopMembership | null;
  }> {
    logger.info(`[Whop] Processing webhook event: ${event.data.action}`);

    const membership = event.data.membership;

    if (!membership) {
      logger.warn('[Whop] Webhook event has no membership data');
      return { userId: null, action: event.data.action, membership: null };
    }

    // Extract user email for database lookup
    const userEmail = membership.user.email;

    return {
      userId: userEmail, // Will be used to lookup user in database
      action: event.data.action,
      membership,
    };
  }

  /**
   * Map Whop plan to our plan types
   */
  mapWhopPlanToRole(membership: WhopMembership | null): 'free' | 'premium' {
    if (!membership) return 'free';

    if (membership.valid && (membership.status === 'active' || membership.status === 'trialing')) {
      return 'premium';
    }

    return 'free';
  }

  /**
   * Get subscription details for display
   */
  getSubscriptionDetails(membership: WhopMembership | null) {
    if (!membership) {
      return {
        plan: 'free',
        status: 'inactive',
        renewalDate: null,
        cancelAtPeriodEnd: false,
      };
    }

    return {
      plan: membership.plan.name,
      status: membership.status,
      renewalDate: membership.renewal_period_end,
      cancelAtPeriodEnd: membership.cancel_at_period_end,
      price: membership.plan.price,
      interval: membership.plan.interval,
    };
  }
}

// Export singleton instance
export const whopService = new WhopService();
