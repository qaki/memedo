import { pgTable, uuid, varchar, jsonb, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Token Identification
  chain: varchar('chain', { length: 20 }).notNull(), // 'ethereum' | 'solana' | 'base' | 'bsc'
  contract_address: varchar('contract_address', { length: 100 }).notNull(),
  token_name: varchar('token_name', { length: 100 }),
  token_symbol: varchar('token_symbol', { length: 20 }),
  
  // Analysis Results (JSONB for flexibility)
  results: jsonb('results').notNull(),
  
  // Data Quality Metrics
  completeness_score: integer('completeness_score').notNull(), // 0-100
  sources_used: jsonb('sources_used').notNull(),
  sources_failed: jsonb('sources_failed'),
  
  // Performance Metrics
  analysis_duration_ms: integer('analysis_duration_ms').notNull(),
  cache_hit: boolean('cache_hit').notNull().default(false),
  
  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  expires_at: timestamp('expires_at').notNull(), // Cache expiry
}, (table) => ({
  userIdIdx: index('analyses_user_id_idx').on(table.user_id),
  chainAddressIdx: index('analyses_chain_address_idx').on(table.chain, table.contract_address),
  createdAtIdx: index('analyses_created_at_idx').on(table.created_at),
  expiresAtIdx: index('analyses_expires_at_idx').on(table.expires_at),
}));

