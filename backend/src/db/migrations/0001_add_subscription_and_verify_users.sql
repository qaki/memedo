-- Migration: Add subscription fields and auto-verify users
-- This migration adds FastSpring subscription management and fixes email verification

-- Add subscription management fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fastspring_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS fastspring_account_id VARCHAR(255);

-- Create indices for subscription queries
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON users(subscription_status);
CREATE INDEX IF NOT EXISTS users_fastspring_subscription_id_idx ON users(fastspring_subscription_id);
CREATE INDEX IF NOT EXISTS users_fastspring_account_id_idx ON users(fastspring_account_id);

-- Add comments
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: free, active, trial, canceled, overdue';
COMMENT ON COLUMN users.subscription_plan IS 'Current subscription plan: free, memego-pro-monthly, memego-pro-yearly';
COMMENT ON COLUMN users.fastspring_subscription_id IS 'FastSpring subscription ID for API calls';
COMMENT ON COLUMN users.fastspring_account_id IS 'FastSpring account ID for customer management';

-- Auto-verify all existing users (email service not configured initially)
UPDATE users 
SET 
  email_verified = true,
  email_verification_token = NULL,
  email_verification_expires = NULL
WHERE 
  email_verified = false;

