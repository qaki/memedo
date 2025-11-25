/**
 * FastSpring API Service
 * Handles all communication with FastSpring API
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';
import {
  FastSpringSubscription,
  FastSpringAccount,
  FastSpringCreateSessionRequest,
  FastSpringSession,
  SubscriptionState,
  SubscriptionPlan,
} from '../types/fastspring.types.js';

class FastSpringService {
  private client: AxiosInstance;
  private username: string;
  private password: string;
  private baseURL = 'https://api.fastspring.com';

  constructor() {
    this.username = process.env.FASTSPRING_USERNAME || '';
    this.password = process.env.FASTSPRING_PASSWORD || '';

    if (!this.username || !this.password) {
      logger.warn('FastSpring credentials not configured');
    }

    // Create base64 encoded auth header
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        'User-Agent': 'MemeDo/1.0',
      },
      timeout: 30000,
    });

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      this.client.interceptors.request.use((config) => {
        logger.debug(`[FastSpring] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });
    }

    // Log errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('[FastSpring] API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Get all subscriptions for a specific account
   */
  async getAccountSubscriptions(accountId: string): Promise<FastSpringSubscription[]> {
    try {
      const response = await this.client.get<{ subscriptions: FastSpringSubscription[] }>(
        `/accounts/${accountId}/subscriptions`
      );
      return response.data.subscriptions || [];
    } catch (error) {
      logger.error(`Failed to get subscriptions for account ${accountId}:`, error);
      throw new Error('Failed to fetch subscriptions');
    }
  }

  /**
   * Get a specific subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<FastSpringSubscription> {
    try {
      const response = await this.client.get<FastSpringSubscription>(
        `/subscriptions/${subscriptionId}`
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to get subscription ${subscriptionId}:`, error);
      throw new Error('Failed to fetch subscription');
    }
  }

  /**
   * Get account details
   */
  async getAccount(accountId: string): Promise<FastSpringAccount> {
    try {
      const response = await this.client.get<FastSpringAccount>(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get account ${accountId}:`, error);
      throw new Error('Failed to fetch account');
    }
  }

  /**
   * Create a checkout session for subscription purchase
   */
  async createSession(request: FastSpringCreateSessionRequest): Promise<FastSpringSession> {
    try {
      const response = await this.client.post<FastSpringSession>('/sessions', request);
      return response.data;
    } catch (error) {
      logger.error('Failed to create FastSpring session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Cancel a subscription (cancel at period end)
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.client.delete(`/subscriptions/${subscriptionId}`, {
        params: { deactivation: 'automatic' }, // Cancel at end of billing period
      });
      logger.info(`Subscription ${subscriptionId} canceled (at period end)`);
    } catch (error) {
      logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Reactivate a canceled subscription (before it ends)
   */
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.client.post(`/subscriptions/${subscriptionId}/entries`, {
        // FastSpring specific reactivation logic
      });
      logger.info(`Subscription ${subscriptionId} reactivated`);
    } catch (error) {
      logger.error(`Failed to reactivate subscription ${subscriptionId}:`, error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  /**
   * Update subscription product (upgrade/downgrade)
   */
  async updateSubscriptionProduct(
    subscriptionId: string,
    newProduct: SubscriptionPlan
  ): Promise<void> {
    try {
      await this.client.put(`/subscriptions/${subscriptionId}`, {
        product: newProduct,
      });
      logger.info(`Subscription ${subscriptionId} updated to ${newProduct}`);
    } catch (error) {
      logger.error(`Failed to update subscription ${subscriptionId}:`, error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Get checkout URL for a product
   */
  getCheckoutUrl(
    product: SubscriptionPlan,
    options?: {
      email?: string;
      accountId?: string;
      reset?: boolean;
    }
  ): string {
    const storefront = process.env.FASTSPRING_STOREFRONT || 'memego';
    const params = new URLSearchParams();

    if (options?.email) {
      params.append('contact_email', options.email);
    }
    if (options?.accountId) {
      params.append('account', options.accountId);
    }
    if (options?.reset) {
      params.append('reset', 'true');
    }

    const queryString = params.toString();
    const url = `https://${storefront}.onfastspring.com/popup-${product}`;
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Validate webhook signature (if FastSpring sends signatures)
   */
  validateWebhookSignature(_payload: string, _signature: string): boolean {
    // FastSpring webhook validation logic
    // Note: FastSpring may not send signatures, in which case verify by IP
    return true; // Implement based on FastSpring's security model
  }

  /**
   * Map FastSpring plan to internal plan enum
   */
  mapProductToPlan(product: string): SubscriptionPlan {
    switch (product) {
      case 'memego-pro-monthly':
        return SubscriptionPlan.MONTHLY;
      case 'memego-pro-yearly':
        return SubscriptionPlan.YEARLY;
      default:
        return SubscriptionPlan.FREE;
    }
  }

  /**
   * Check if a subscription is active
   */
  isSubscriptionActive(state: SubscriptionState): boolean {
    return [SubscriptionState.ACTIVE, SubscriptionState.TRIAL].includes(state);
  }

  /**
   * Get subscription tier benefits
   */
  getSubscriptionBenefits(plan: SubscriptionPlan): {
    maxAnalysesPerDay: number;
    maxWatchlistTokens: number;
    exportReports: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  } {
    switch (plan) {
      case SubscriptionPlan.MONTHLY:
      case SubscriptionPlan.YEARLY:
        return {
          maxAnalysesPerDay: 100,
          maxWatchlistTokens: 50,
          exportReports: true,
          prioritySupport: true,
          advancedAnalytics: true,
        };
      case SubscriptionPlan.FREE:
      default:
        return {
          maxAnalysesPerDay: 5,
          maxWatchlistTokens: 5,
          exportReports: false,
          prioritySupport: false,
          advancedAnalytics: false,
        };
    }
  }
}

export const fastspringService = new FastSpringService();
