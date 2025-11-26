-- Migration: Auto-verify all existing users
-- Reason: Email verification service was not configured initially
-- Impact: Allows all existing users to log in

UPDATE users 
SET 
  email_verified = true,
  email_verification_token = NULL,
  email_verification_expires = NULL
WHERE 
  email_verified = false;

