import { pgTable, uuid, varchar, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Provider Information
  provider: varchar('provider', { length: 20 }).notNull(), // 'stripe' | 'lemon_squeezy'
  provider_subscription_id: varchar('provider_subscription_id', { length: 255 }).notNull().unique(),
  provider_customer_id: varchar('provider_customer_id', { length: 255 }).notNull(),
  
  // Subscription Details
  status: varchar('status', { length: 20 }).notNull(), // 'active' | 'canceled' | 'past_due' | 'expired'
  plan_name: varchar('plan_name', { length: 50 }).notNull(),
  amount_cents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  // Billing Cycle
  current_period_start: timestamp('current_period_start').notNull(),
  current_period_end: timestamp('current_period_end').notNull(),
  cancel_at_period_end: boolean('cancel_at_period_end').notNull().default(false),
  canceled_at: timestamp('canceled_at'),
  
  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.user_id),
  providerSubIdIdx: index('subscriptions_provider_sub_id_idx').on(table.provider_subscription_id),
  statusIdx: index('subscriptions_status_idx').on(table.status),
}));

