import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Ensures database schema is up-to-date by running DDL commands directly.
 * This bypasses Drizzle's migration tracker which may skip migrations.
 */
export async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🔧 Ensuring database schema is up-to-date...');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Add subscription management fields to users table
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free'
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free'
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS fastspring_subscription_id VARCHAR(255)
    `;

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS fastspring_account_id VARCHAR(255)
    `;

    console.log('✅ Subscription columns added/verified');

    // Create indices for subscription queries
    await sql`
      CREATE INDEX IF NOT EXISTS users_subscription_status_idx 
      ON users(subscription_status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS users_fastspring_subscription_id_idx 
      ON users(fastspring_subscription_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS users_fastspring_account_id_idx 
      ON users(fastspring_account_id)
    `;

    console.log('✅ Subscription indices created/verified');

    // Auto-verify all existing users (email service not configured initially)
    const result = await sql`
      UPDATE users 
      SET 
        email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL
      WHERE 
        email_verified = false
    `;

    if (result.count && result.count > 0) {
      console.log(`✅ Auto-verified ${result.count} existing user(s)`);
    } else {
      console.log('✅ All users already verified');
    }

    console.log('🎉 Database schema is up-to-date!');
  } catch (error) {
    console.error('❌ Failed to ensure database schema:', error);
    throw error;
  }
}
