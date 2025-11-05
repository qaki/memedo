import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const api_logs = pgTable(
  'api_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Request Context
    analysis_id: uuid('analysis_id'), // References analyses.id (nullable if analysis failed)
    chain: varchar('chain', { length: 20 }).notNull(),
    contract_address: varchar('contract_address', { length: 100 }),

    // API Provider
    provider: varchar('provider', { length: 50 }).notNull(),
    endpoint: varchar('endpoint', { length: 255 }),

    // Performance & Status
    success: boolean('success').notNull(),
    response_time_ms: integer('response_time_ms').notNull(),
    http_status_code: integer('http_status_code'),

    // Error Details
    error_message: text('error_message'),
    error_type: varchar('error_type', { length: 50 }),

    // Fallback Tracking
    was_fallback: boolean('was_fallback').notNull().default(false),
    fallback_level: integer('fallback_level').default(0),

    // Metadata
    request_metadata: jsonb('request_metadata'),

    // Timestamp
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    providerIdx: index('api_logs_provider_idx').on(table.provider),
    successIdx: index('api_logs_success_idx').on(table.success),
    createdAtIdx: index('api_logs_created_at_idx').on(table.created_at),
    chainIdx: index('api_logs_chain_idx').on(table.chain),
  })
);
