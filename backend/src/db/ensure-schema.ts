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
      ADD COLUMN IF NOT EXISTS whop_membership_id VARCHAR(255)
    `;

    console.log('✅ Subscription columns added/verified');

    // Create indices for subscription queries
    await sql`
      CREATE INDEX IF NOT EXISTS users_subscription_status_idx 
      ON users(subscription_status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS users_whop_membership_id_idx 
      ON users(whop_membership_id)
    `;

    console.log('✅ Subscription indices created/verified');

    // ========================================
    // FIX ANALYSES TABLE SCHEMA
    // ========================================

    // 1. Rename contract_address to token_address (if needed)
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analyses' 
      AND column_name = 'contract_address'
    `;

    if (checkColumn.length > 0) {
      console.log('🔄 Renaming contract_address to token_address...');
      await sql`ALTER TABLE analyses RENAME COLUMN contract_address TO token_address`;
      console.log('✅ Column renamed');
    } else {
      console.log('✅ token_address already exists');
    }

    // 2. Add new required columns
    await sql`ALTER TABLE analyses ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 50`;
    await sql`ALTER TABLE analyses ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'CAUTION'`;
    await sql`ALTER TABLE analyses ADD COLUMN IF NOT EXISTS data_completeness INTEGER DEFAULT 0`;
    await sql`ALTER TABLE analyses ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT '{}'::jsonb`;
    await sql`ALTER TABLE analyses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;
    console.log('✅ Added missing columns to analyses table');

    // 3. Migrate data from old columns to new (if old columns exist)
    const checkOldColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analyses' 
      AND column_name IN ('results', 'completeness_score')
    `;

    if (checkOldColumns.length > 0) {
      console.log('🔄 Migrating data from old columns...');

      // Copy results -> analysis_data (if not already populated)
      await sql`
        UPDATE analyses 
        SET analysis_data = results 
        WHERE (analysis_data IS NULL OR analysis_data = '{}'::jsonb)
        AND results IS NOT NULL
      `;

      // Copy completeness_score -> data_completeness (if not already populated)
      await sql`
        UPDATE analyses 
        SET data_completeness = completeness_score 
        WHERE data_completeness = 0 
        AND completeness_score IS NOT NULL
      `;

      // Make old columns nullable so they don't block new inserts
      await sql`
        ALTER TABLE analyses 
        ALTER COLUMN results DROP NOT NULL
      `.catch(() => console.log("   (results column already nullable or doesn't exist)"));

      await sql`
        ALTER TABLE analyses 
        ALTER COLUMN completeness_score DROP NOT NULL
      `.catch(() =>
        console.log("   (completeness_score column already nullable or doesn't exist)")
      );

      console.log('✅ Data migration complete');
    } else {
      console.log('✅ No old columns to migrate');
    }

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

    // Result is an array for neon, length indicates rows affected
    if (result && result.length > 0) {
      console.log(`✅ Auto-verified ${result.length} existing user(s)`);
    } else {
      console.log('✅ All users already verified');
    }

    // Create watchlist table if it doesn't exist
    console.log('🔍 Creating watchlist table if needed...');
    await sql`
      CREATE TABLE IF NOT EXISTS watchlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_address VARCHAR(255) NOT NULL,
        chain VARCHAR(50) NOT NULL,
        token_name VARCHAR(255),
        token_symbol VARCHAR(50),
        added_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create indexes for watchlist
    await sql`
      CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS watchlist_token_chain_idx ON watchlist(token_address, chain)
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_token_chain_idx 
      ON watchlist(user_id, token_address, chain)
    `;

    console.log('✅ Watchlist table ready');

    console.log('🎉 Database schema is up-to-date!');
  } catch (error) {
    console.error('❌ Failed to ensure database schema:', error);
    throw error;
  }
}
