/**
 * Token Analysis Service
 * Aggregates data from multiple adapters and calculates safety scores
 */

import { cafo } from './cafo.service.js';
import { getCached, setCached, CacheTTL, generateCacheKey } from './redis.service.js';
import {
  TokenAnalysis,
  TokenMetadata,
  SecurityScan,
  Chain,
  isValidAddress,
} from '../types/token-analysis.js';
import { db } from '../db/index.js';
import { analyses } from '../db/schema/index.js';

// Import adapters
import { heliusAdapter } from '../adapters/solana/helius.adapter.js';
import { etherscanAdapter } from '../adapters/evm/etherscan.adapter.js';
import { goPlusAdapter } from '../adapters/security/goplus.adapter.js';
import { rugCheckAdapter } from '../adapters/security/rugcheck.adapter.js';

export class AnalysisService {
  private initialized = false;

  /**
   * Initialize the service by registering all adapters with CAFO
   */
  initialize() {
    if (this.initialized) return;

    console.log('[AnalysisService] Initializing adapters...');

    // Register Solana adapters
    cafo.registerAdapter('solana', heliusAdapter);

    // Register EVM adapters
    cafo.registerAdapter('ethereum', etherscanAdapter);
    cafo.registerAdapter('bsc', etherscanAdapter);
    cafo.registerAdapter('polygon', etherscanAdapter);
    cafo.registerAdapter('avalanche', etherscanAdapter);
    cafo.registerAdapter('base', etherscanAdapter);

    // Register security adapters
    // GoPlus supports all chains (primary)
    ['ethereum', 'bsc', 'polygon', 'avalanche', 'base', 'solana'].forEach((chain) => {
      cafo.registerAdapter(chain, goPlusAdapter);
    });

    // RugCheck for Solana (fallback)
    cafo.registerAdapter('solana', rugCheckAdapter);

    this.initialized = true;
    console.log(
      '[AnalysisService] ✅ Initialized with',
      cafo.getSupportedChains().length,
      'chains'
    );
  }

  /**
   * Analyze a token
   * Main entry point - orchestrates all data collection and scoring
   */
  async analyzeToken(address: string, chain: Chain, userId?: string): Promise<TokenAnalysis> {
    this.initialize();

    // 1. Validate input
    if (!isValidAddress(address, chain)) {
      throw new Error(`Invalid address format for chain ${chain}`);
    }

    // 2. Check cache
    const cacheKey = generateCacheKey('analysis', chain, address);
    const cached = await getCached<TokenAnalysis>(cacheKey);
    if (cached) {
      console.log(`[AnalysisService] ✅ Cache hit for ${address}`);
      return cached;
    }

    console.log(`[AnalysisService] Analyzing ${address} on ${chain}...`);

    const startTime = Date.now();

    // 3. Fetch data from multiple sources in parallel using CAFO
    const [metadataResult, securityResult] = await Promise.allSettled([
      cafo.executeWithFallback<TokenMetadata>(chain, 'getMetadata', address, chain),
      cafo.executeWithFallback<SecurityScan>(chain, 'getSecurity', address, chain),
    ]);

    // 4. Extract data from results
    const metadata = metadataResult.status === 'fulfilled' ? metadataResult.value.data : null;
    const security = securityResult.status === 'fulfilled' ? securityResult.value.data : null;

    // 5. Calculate safety score
    const safetyScore = this.calculateSafetyScore({
      metadata,
      security,
    });

    // 6. Determine risk level
    const riskLevel = this.getRiskLevel(safetyScore);

    // 7. Generate red flags
    const redFlags = this.identifyRedFlags(security);

    // 8. Generate summary
    const summary = this.generateSummary(safetyScore, security, metadata);

    // 9. Calculate confidence and data completeness
    const confidence = this.calculateConfidence([metadataResult, securityResult]);
    const dataCompleteness = this.getDataCompleteness([metadataResult, securityResult]);

    // 10. Build analysis result
    const analysis: TokenAnalysis = {
      address,
      chain,
      metadata,
      security,
      holders: null, // To be implemented with more API integrations
      liquidity: null, // To be implemented with DEX APIs
      market: null, // To be implemented with price APIs
      transactions: null, // To be implemented with transaction APIs
      safetyScore,
      riskLevel,
      confidence,
      dataCompleteness,
      summary,
      redFlags,
      analyzedAt: new Date(),
      userId,
    };

    const duration = Date.now() - startTime;
    console.log(
      `[AnalysisService] ✅ Analysis complete in ${duration}ms - Safety: ${safetyScore}/100 (${riskLevel})`
    );

    // 11. Cache result for 15 minutes
    await setCached(cacheKey, analysis, CacheTTL.ANALYSIS_RESULT);

    // 12. Save to database for history (if user is logged in)
    if (userId) {
      try {
        await db.insert(analyses).values({
          user_id: userId,
          token_address: address,
          chain,
          safety_score: safetyScore,
          risk_level: riskLevel,
          data_completeness: dataCompleteness,
          analysis_data: analysis,
        });
      } catch (error) {
        console.error('[AnalysisService] Failed to save to database:', error);
        // Don't fail the request if database save fails
      }
    }

    return analysis;
  }

  /**
   * Calculate composite safety score (0-100)
   * 100 = safest, 0 = most dangerous
   */
  private calculateSafetyScore(data: {
    metadata: TokenMetadata | null;
    security: SecurityScan | null;
  }): number {
    let score = 100;

    // If no data, return neutral score
    if (!data.security) {
      return 50;
    }

    const security = data.security;

    // Critical risks (-40 points each)
    if (security.isHoneypot) score -= 40;
    if (security.hasHiddenOwner) score -= 40;

    // High risks (-20 points each)
    if (security.isMintable) score -= 20;
    if (security.canTakeBackOwnership) score -= 20;
    if (security.hasBlacklist) score -= 20;

    // Medium risks (-15 points)
    if (security.hasProxy) score -= 15;

    // Medium risks (-10 points each)
    if (security.hasTradingCooldown) score -= 10;
    if (security.canBePaused) score -= 10;
    if (security.ownerPercentage && security.ownerPercentage > 10) score -= 10;
    if (security.ownerPercentage && security.ownerPercentage > 30) score -= 10; // Extra penalty for >30%

    // Low risks (-5 points each)
    if (security.buyTaxPercentage && security.buyTaxPercentage > 10) score -= 5;
    if (security.sellTaxPercentage && security.sellTaxPercentage > 10) score -= 5;
    if (security.sellTaxPercentage && security.sellTaxPercentage > 20) score -= 10; // Extra penalty for >20%

    // Bonus for verified contract (+5 points)
    if (data.metadata?.verified) score += 5;

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Map safety score to risk level
   */
  private getRiskLevel(safetyScore: number): 'SAFE' | 'CAUTION' | 'AVOID' {
    if (safetyScore >= 80) return 'SAFE';
    if (safetyScore >= 50) return 'CAUTION';
    return 'AVOID';
  }

  /**
   * Identify critical red flags
   */
  private identifyRedFlags(security: SecurityScan | null): string[] {
    if (!security) return ['Security data unavailable'];

    const flags: string[] = [];

    if (security.isHoneypot) flags.push('🚨 HONEYPOT DETECTED - Cannot sell this token');
    if (security.hasHiddenOwner) flags.push('🚨 Hidden owner detected');
    if (security.isMintable) flags.push('⚠️ Owner can mint unlimited tokens');
    if (security.canTakeBackOwnership)
      flags.push('⚠️ Ownership can be reclaimed after renouncement');
    if (security.hasBlacklist) flags.push('⚠️ Owner can blacklist addresses');
    if (security.hasProxy) flags.push('⚠️ Contract is upgradeable (proxy)');
    if (security.ownerPercentage && security.ownerPercentage > 30)
      flags.push(`⚠️ Owner holds ${security.ownerPercentage.toFixed(1)}% of supply`);
    if (security.sellTaxPercentage && security.sellTaxPercentage > 20)
      flags.push(`⚠️ High sell tax: ${security.sellTaxPercentage.toFixed(1)}%`);

    return flags;
  }

  /**
   * Generate natural language summary
   */
  private generateSummary(
    safetyScore: number,
    security: SecurityScan | null,
    metadata: TokenMetadata | null
  ): string {
    const tokenName = metadata?.name || 'This token';

    if (safetyScore >= 80) {
      return `${tokenName} appears relatively safe with a score of ${safetyScore}/100. ${security?.risks.length || 0} minor issues detected. Always do your own research.`;
    }

    if (safetyScore >= 50) {
      return `${tokenName} has some concerns (${safetyScore}/100). ${security?.risks.length || 0} risks identified. Proceed with caution and verify all information.`;
    }

    return `${tokenName} shows significant red flags (${safetyScore}/100). ${security?.risks.length || 0} risks detected. High risk - avoid or invest only what you can afford to lose.`;
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(results: Array<PromiseSettledResult<unknown>>): number {
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const total = results.length;
    return Math.round((successful / total) * 100);
  }

  /**
   * Calculate percentage of data successfully retrieved
   */
  private getDataCompleteness(results: Array<PromiseSettledResult<unknown>>): number {
    return this.calculateConfidence(results);
  }

  /**
   * Get analysis by ID from database
   */
  async getAnalysisById(id: string, userId: string): Promise<TokenAnalysis | null> {
    const result = await db.query.analyses.findFirst({
      where: (analyses, { eq, and }) => and(eq(analyses.id, id), eq(analyses.user_id, userId)),
    });

    return result?.analysis_data as TokenAnalysis | null;
  }

  /**
   * Get user's analysis history
   */
  async getUserAnalysisHistory(userId: string, limit = 20) {
    const results = await db.query.analyses.findMany({
      where: (analyses, { eq }) => eq(analyses.user_id, userId),
      orderBy: (analyses, { desc }) => [desc(analyses.created_at)],
      limit,
    });

    return results;
  }
}

// Singleton instance
export const analysisService = new AnalysisService();
