/**
 * FastSpring API Types
 * Documentation: https://docs.fastspring.com/
 */

export enum SubscriptionState {
  ACTIVE = 'active',
  TRIAL = 'trial',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  DEACTIVATED = 'deactivated',
}

export enum SubscriptionPlan {
  FREE = 'free',
  MONTHLY = 'memego-pro-monthly',
  YEARLY = 'memego-pro-yearly',
}

export interface FastSpringSubscription {
  id: string;
  subscription: string; // Subscription ID
  state: SubscriptionState;
  changed: number; // Unix timestamp
  changedInSeconds: number;
  live: boolean;
  currency: string;
  account: string;
  product: string; // Product path (memego-pro-monthly or memego-pro-yearly)
  sku: string;
  display: string;
  quantity: number;
  adherence: string;
  intervalUnit: 'month' | 'year';
  intervalLength: number;
  next: number; // Next billing date (Unix timestamp)
  nextInSeconds: number;
  end?: number; // End date if canceled (Unix timestamp)
  endInSeconds?: number;
  canceledDate?: number;
  canceledDateInSeconds?: number;
  deactivationDate?: number;
  deactivationDateInSeconds?: number;
  sequence: number;
  periods: number;
  remainingPeriods: number;
  begin: number; // Start date (Unix timestamp)
  beginInSeconds: number;
  autoRenew: boolean;
  price: number;
  priceDisplay: string;
  priceInPayoutCurrency: number;
  priceInPayoutCurrencyDisplay: string;
  discount: number;
  discountDisplay: string;
  subtotal: number;
  subtotalDisplay: string;
  subtotalInPayoutCurrency: number;
  subtotalInPayoutCurrencyDisplay: string;
  nextChargeCurrency: string;
  nextChargeDate: number;
  nextChargeDateInSeconds: number;
  nextChargePreTax: number;
  nextChargePreTaxDisplay: string;
  nextChargeTotal: number;
  nextChargeTotalDisplay: string;
  nextChargeInPayoutCurrency: number;
  nextChargeInPayoutCurrencyDisplay: string;
  nextNotificationType: string;
  nextNotificationDate: number;
  nextNotificationDateInSeconds: number;
  paymentReminder: boolean;
  paymentOverdue: boolean;
  cancellationSetting: string;
  fulfillments: Record<string, unknown>;
  instructions: unknown[];
}

export interface FastSpringWebhookEvent {
  id: string;
  processed: boolean;
  created: number;
  type: string;
  live: boolean;
  data: {
    id?: string;
    subscription?: string;
    customer?: string;
    account?: string;
    product?: string;
    sku?: string;
    changed?: number;
    changedInSeconds?: number;
    live?: boolean;
    [key: string]: unknown;
  };
}

export interface FastSpringAccount {
  id: string;
  account: string;
  contact: {
    first: string;
    last: string;
    email: string;
    company?: string;
    phone?: string;
  };
  language: string;
  country: string;
  lookup: {
    global: string;
  };
  url: string;
  subscriptions?: FastSpringSubscription[];
}

export interface FastSpringCreateSessionRequest {
  items: Array<{
    product: string; // Product path (memego-pro-monthly or memego-pro-yearly)
    quantity?: number;
  }>;
  account?: string; // Account ID for existing customer
  email?: string; // Email for new customer
  language?: string;
  country?: string;
  reset?: boolean;
}

export interface FastSpringSession {
  id: string;
  account: string;
  items: Array<{
    product: string;
    quantity: number;
  }>;
}

export interface SubscriptionMetadata {
  plan: SubscriptionPlan;
  status: SubscriptionState;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  fastspringSubscriptionId?: string;
  fastspringAccountId?: string;
}
