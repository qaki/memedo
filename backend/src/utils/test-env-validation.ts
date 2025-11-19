/**
 * Test script to demonstrate environment variable validation
 * Run with: pnpm tsx src/utils/test-env-validation.ts
 */

import { env } from './env-validator.js';

console.log('\n🧪 Environment Validation Test\n');
console.log('✅ All required environment variables are present and valid:');
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log(`   PORT: ${env.PORT}`);
console.log(`   FRONTEND_URL: ${env.FRONTEND_URL}`);
console.log(`   DATABASE_URL: ${env.DATABASE_URL.substring(0, 30)}... (truncated)`);
console.log(`   REDIS_URL: ${env.REDIS_URL ? env.REDIS_URL.substring(0, 20) + '...' : 'Not set'}`);
console.log(
  `   JWT_SECRET: ${env.JWT_SECRET.substring(0, 10)}... (length: ${env.JWT_SECRET.length})`
);
console.log(
  `   JWT_REFRESH_SECRET: ${env.JWT_REFRESH_SECRET.substring(0, 10)}... (length: ${env.JWT_REFRESH_SECRET.length})`
);
console.log(
  `   TOTP_ENCRYPTION_KEY: ${env.TOTP_ENCRYPTION_KEY.substring(0, 10)}... (length: ${env.TOTP_ENCRYPTION_KEY.length})`
);

console.log('\n📋 Optional API Keys Status:');
console.log(`   HELIUS_API_KEY: ${env.HELIUS_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   ETHERSCAN_API_KEY: ${env.ETHERSCAN_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   GOPLUS_API_KEY: ${env.GOPLUS_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   STRIPE_SECRET_KEY: ${env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   RESEND_API_KEY: ${env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`);

console.log('\n⚙️  Feature Flags:');
console.log(`   ENABLE_RATE_LIMITING: ${env.ENABLE_RATE_LIMITING}`);
console.log(`   ENABLE_2FA: ${env.ENABLE_2FA}`);
console.log(`   ENABLE_API_LOGGING: ${env.ENABLE_API_LOGGING}`);

console.log('\n🎉 Environment validation test PASSED!\n');
