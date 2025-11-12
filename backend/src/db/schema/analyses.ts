import { pgTable, uuid, varchar, jsonb, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const analyses = pgTable(
  'analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Token Identification
    chain: varchar('chain', { length: 20 }).notNull(), // 'ethereum' | 'solana' | 'base' | 'bsc'
    token_address: varchar('token_address', { length: 100 }).notNull(), // Note: changed from contract_address
    token_name: varchar('token_name', { length: 100 }),
    token_symbol: varchar('token_symbol', { length: 20 }),

    // Analysis Results
    safety_score: integer('safety_score').notNull(), // 0-100
    risk_level: varchar('risk_level', { length: 20 }).notNull(), // 'SAFE' | 'CAUTION' | 'AVOID'
    data_completeness: integer('data_completeness').notNull(), // 0-100
    analysis_data: jsonb('analysis_data').notNull(), // Full TokenAnalysis object

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('analyses_user_id_idx').on(table.user_id),
    chainAddressIdx: index('analyses_chain_address_idx').on(table.chain, table.token_address),
    createdAtIdx: index('analyses_created_at_idx').on(table.created_at),
  })
);
