import { z } from 'zod';
import type { ApiError } from '../schemas/api.schema';

/**
 * Validates data against a Zod schema and returns parsed data or throws an error
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error('Validation failed');
  }
}

/**
 * Validates data against a Zod schema and returns success/error result
 */
export function safeValidateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Formats Zod validation errors into API error format
 */
export function formatValidationErrors(error: z.ZodError): ApiError {
  const firstError = error.errors[0];
  
  return {
    code: 'VALIDATION_ERROR',
    message: firstError.message,
    field: firstError.path.join('.'),
    details: {
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    },
  };
}

/**
 * Checks if a string is a valid Ethereum-like address (0x + 40 hex chars)
 */
export function isEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Checks if a string is a valid Solana address (base58, 32-44 chars)
 */
export function isSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Normalizes contract address to lowercase for Ethereum-like chains
 */
export function normalizeAddress(address: string, chain: string): string {
  if (chain === 'solana') {
    return address; // Solana addresses are case-sensitive
  }
  return address.toLowerCase(); // Ethereum-like chains
}

