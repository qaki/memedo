import { z } from 'zod';

/**
 * Supported blockchain chains
 */
export const chainSchema = z.enum(['ethereum', 'solana', 'base', 'bsc'], {
  errorMap: () => ({ message: 'Chain must be one of: ethereum, solana, base, bsc' }),
});

/**
 * Contract address validation
 * - Ethereum/Base/BSC: 42 characters (0x + 40 hex chars)
 * - Solana: 32-44 characters (base58)
 */
export const contractAddressSchema = z
  .string()
  .trim()
  .min(32, 'Invalid contract address')
  .max(44, 'Invalid contract address')
  .refine(
    (address) => {
      // Ethereum-like chains (starts with 0x)
      if (address.startsWith('0x')) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      }
      // Solana (base58)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    },
    { message: 'Invalid contract address format' }
  );

/**
 * Token analysis request schema
 */
export const analyzeTokenSchema = z.object({
  contractAddress: contractAddressSchema,
  chain: chainSchema,
});

/**
 * Risk level enum
 */
export const riskLevelSchema = z.enum(['safe', 'caution', 'avoid']);

/**
 * Confidence score (0-100)
 */
export const confidenceScoreSchema = z.number().min(0).max(100);

/**
 * Risk flag schema (used in analysis results)
 */
export const riskFlagSchema = z.object({
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string(),
  details: z.string().optional(),
});

/**
 * API provider status schema
 */
export const providerStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['success', 'fallback', 'failed']),
  latency_ms: z.number().optional(),
  error: z.string().optional(),
});

/**
 * Analysis metadata schema
 */
export const analysisMetadataSchema = z.object({
  analysis_duration_ms: z.number(),
  completeness_score: z.number().min(0).max(100),
  providers_used: z.array(providerStatusSchema),
  cached: z.boolean(),
  cache_age_seconds: z.number().optional(),
});

/**
 * Token analysis response schema (simplified for MVP)
 */
export const tokenAnalysisResultSchema = z.object({
  contractAddress: contractAddressSchema,
  chain: chainSchema,
  riskLevel: riskLevelSchema,
  confidenceScore: confidenceScoreSchema,
  riskFlags: z.array(riskFlagSchema),
  summary: z.string(),
  metadata: analysisMetadataSchema,
  createdAt: z.string().datetime(),
});

// Export inferred types
export type Chain = z.infer<typeof chainSchema>;
export type ContractAddress = z.infer<typeof contractAddressSchema>;
export type AnalyzeTokenInput = z.infer<typeof analyzeTokenSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type ConfidenceScore = z.infer<typeof confidenceScoreSchema>;
export type RiskFlag = z.infer<typeof riskFlagSchema>;
export type ProviderStatus = z.infer<typeof providerStatusSchema>;
export type AnalysisMetadata = z.infer<typeof analysisMetadataSchema>;
export type TokenAnalysisResult = z.infer<typeof tokenAnalysisResultSchema>;
