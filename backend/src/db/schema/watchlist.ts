/**
 * Watchlist Schema
 *
 * Stores tokens that users want to track and monitor.
 * Users can save favorite tokens for quick access and re-analysis.
 */

import { pgTable, varchar, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const watchlist = pgTable(
  'watchlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Token Information
    tokenAddress: varchar('token_address', { length: 255 }).notNull(),
    chain: varchar('chain', { length: 50 }).notNull(),
    tokenName: varchar('token_name', { length: 255 }),
    tokenSymbol: varchar('token_symbol', { length: 50 }),

    // Metadata
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    // Composite index for quick lookups
    userIdIdx: index('watchlist_user_id_idx').on(table.userId),
    tokenChainIdx: index('watchlist_token_chain_idx').on(table.tokenAddress, table.chain),
    // Unique constraint: user can't add same token+chain twice
    userTokenChainIdx: index('watchlist_user_token_chain_idx').on(
      table.userId,
      table.tokenAddress,
      table.chain
    ),
  })
);

export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
