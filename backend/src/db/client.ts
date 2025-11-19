/**
 * Database Client Configuration
 *
 * This file creates and exports the Drizzle ORM database client
 * using the Neon serverless Postgres driver.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

// Create Drizzle ORM client with schema
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export { schema };
