import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define required and optional environment variables
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  TOTP_ENCRYPTION_KEY: z.string().length(64, 'TOTP_ENCRYPTION_KEY must be 64 hex characters'),

  // JWT Expiry (optional with defaults)
  JWT_ACCESS_EXPIRY: z.string().default('86400'),
  JWT_REFRESH_EXPIRY: z.string().default('604800'),

  // External APIs (optional for MVP development)
  HELIUS_API_KEY: z.string().optional(),
  ETHERSCAN_API_KEY: z.string().optional(),
  GOPLUS_API_KEY: z.string().optional(),
  RUGCHECK_API_KEY: z.string().optional(),
  COVALENT_API_KEY: z.string().optional(),
  BIRDEYE_API_KEY: z.string().optional(),
  DEXSCREENER_API_KEY: z.string().optional(),

  // Payment (optional for initial setup)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  LEMON_SQUEEZY_API_KEY: z.string().optional(),

  // Email (optional for initial setup)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  SUPPORT_EMAIL: z.string().email().optional(),

  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),

  // Feature Flags (optional with defaults)
  ENABLE_RATE_LIMITING: z.string().default('true'),
  ENABLE_2FA: z.string().default('true'),
  ENABLE_API_LOGGING: z.string().default('true'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Environment validation failed:\n');
      error.errors.forEach((err) => {
        console.error(`  ❌ ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Check your .env file and .env.example for reference\n');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();
