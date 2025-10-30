import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  
  // Profile
  display_name: varchar('display_name', { length: 100 }),
  
  // Role & Status
  role: varchar('role', { length: 20 }).notNull().default('free'), // 'free' | 'premium' | 'admin'
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_token: varchar('email_verification_token', { length: 255 }),
  email_verification_expires: timestamp('email_verification_expires'),
  
  // Password Reset
  password_reset_token: varchar('password_reset_token', { length: 255 }),
  password_reset_expires: timestamp('password_reset_expires'),
  
  // Usage Tracking (Free Tier)
  analyses_this_month: integer('analyses_this_month').notNull().default(0),
  analyses_reset_date: timestamp('analyses_reset_date').notNull().defaultNow(),
  
  // Premium Features (Phase 2)
  saved_alerts_config: jsonb('saved_alerts_config').notNull().default('{}'),
  
  // 2FA (Admin mandatory, Premium optional)
  totp_secret: text('totp_secret'), // Encrypted TOTP secret
  totp_enabled: boolean('totp_enabled').notNull().default(false),
  token_version: integer('token_version').notNull().default(0), // For JWT invalidation
  
  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  last_login_at: timestamp('last_login_at'),
  deleted_at: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

