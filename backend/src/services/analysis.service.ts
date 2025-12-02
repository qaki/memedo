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
  MarketData,
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
import { birdeyeAdapter } from '../adapters/market/birdeye.adapter.js';

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

    // Register market data adapter (BirdEye)
    ['ethereum', 'bsc', 'polygon', 'avalanche', 'base', 'solana'].forEach((chain) => {
      cafo.registerAdapter(chain, birdeyeAdapter);
    });

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
    const [metadataResult, securityResult, marketHealthResult] = await Promise.allSettled([
      cafo.executeWithFallback<TokenMetadata>(chain, 'getMetadata', address, chain),
      cafo.executeWithFallback<SecurityScan>(chain, 'getSecurity', address, chain),
      cafo.executeWithFallback(chain, 'getMarketHealth', address, chain),
    ]);

    // 4. Extract data from results
    const metadata = metadataResult.status === 'fulfilled' ? metadataResult.value.data : null;
    const security = securityResult.status === 'fulfilled' ? securityResult.value.data : null;
    const marketHealth =
      marketHealthResult.status === 'fulfilled' ? marketHealthResult.value.data : null;

    // 5. Build market data from BirdEye health metrics
    const market = marketHealth ? this.buildMarketData(marketHealth) : null;

    // 6. Calculate safety score (now includes market health)
    const safetyScore = this.calculateSafetyScore({
      metadata,
      security,
      market,
    });

    // 7. Determine risk level
    const riskLevel = this.getRiskLevel(safetyScore);

    // 8. Generate red flags (now includes market risks)
    const redFlags = this.identifyRedFlags(security, market);

    // 9. Generate summary
    const summary = this.generateSummary(safetyScore, security, metadata, market);

    // 10. Calculate confidence and data completeness
    const confidence = this.calculateConfidence([
      metadataResult,
      securityResult,
      marketHealthResult,
    ]);
    const dataCompleteness = this.getDataCompleteness([
      metadataResult,
      securityResult,
      marketHealthResult,
    ]);

    // 11. Build analysis result
    const analysis: TokenAnalysis = {
      address,
      chain,
      metadata,
      security,
      holders: null, // To be implemented with more API integrations
      liquidity: null, // To be implemented with DEX APIs
      market, // NOW POPULATED from BirdEye!
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

    // 12. Cache result for 15 minutes
    await setCached(cacheKey, analysis, CacheTTL.ANALYSIS_RESULT);

    // 13. Save to database for history (if user is logged in)
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
   * NOW INCLUDES MARKET HEALTH METRICS!
   */
  private calculateSafetyScore(data: {
    metadata: TokenMetadata | null;
    security: SecurityScan | null;
    market: MarketData | null;
  }): number {
    let score = 100;

    // If no data, return neutral score
    if (!data.security && !data.market) {
      return 50;
    }

    const security = data.security;
    const market = data.market;

    // === SECURITY RISKS ===
    if (security) {
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

      // Bonus for renounced ownership (+10 points)
      if (security.isOwnershipRenounced) score += 10;
    }

    // === MARKET HEALTH RISKS (NEW!) ===
    if (market) {
      // Critical: No liquidity (-30 points)
      if (market.isLowLiquidity) {
        score -= 30;
      }

      // High: Low volume (-20 points)
      if (market.isLowVolume) {
        score -= 20;
      }

      // High: High concentration (-20 points)
      if (market.isHighConcentration) {
        score -= 20;
      }

      // Medium: Top 10 holders > 50% (-15 extra points)
      if (market.top10HolderPercentage > 50) {
        score -= 15;
      }

      // Bonus for good liquidity (+5 points)
      if (market.totalLiquidityUSD > 500000) {
        score += 5;
      }

      // Bonus for good volume (+5 points)
      if (market.volume24h > 100000) {
        score += 5;
      }
    }

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
   * NOW INCLUDES MARKET HEALTH FLAGS!
   */
  private identifyRedFlags(security: SecurityScan | null, market: MarketData | null): string[] {
    const flags: string[] = [];

    // Security flags
    if (security) {
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
      if (security.buyTaxPercentage && security.buyTaxPercentage > 10)
        flags.push(`⚠️ High buy tax: ${security.buyTaxPercentage.toFixed(1)}%`);
    }

    // Market health flags (NEW!)
    if (market) {
      if (market.isLowLiquidity) {
        flags.push(
          `🚨 LOW LIQUIDITY: $${market.totalLiquidityUSD.toLocaleString()} - High slippage risk`
        );
      }
      if (market.isLowVolume) {
        flags.push(
          `⚠️ LOW VOLUME: $${market.volume24h.toLocaleString()}/24h - Token may be inactive`
        );
      }
      if (market.isHighConcentration) {
        flags.push(
          `⚠️ HIGH CONCENTRATION: Top 10 hold ${market.top10HolderPercentage.toFixed(1)}% - Whale risk`
        );
      }
      if (market.top10HolderPercentage > 50) {
        flags.push(
          `🚨 EXTREME CONCENTRATION: Top 10 hold ${market.top10HolderPercentage.toFixed(1)}% - Critical risk`
        );
      }
    }

    if (flags.length === 0 && !security && !market) {
      flags.push('⚠️ Limited data available - Unable to perform full analysis');
    }

    return flags;
  }

  /**
   * Generate natural language summary
   * NOW INCLUDES MARKET HEALTH!
   */
  private generateSummary(
    safetyScore: number,
    security: SecurityScan | null,
    metadata: TokenMetadata | null,
    market: MarketData | null
  ): string {
    const tokenName = metadata?.name || 'This token';
    const riskCount = security?.risks.length || 0;

    // Add market context
    let marketContext = '';
    if (market) {
      const liqStr =
        market.totalLiquidityUSD > 0
          ? `$${(market.totalLiquidityUSD / 1000).toFixed(0)}K liquidity`
          : 'No liquidity';
      const volStr =
        market.volume24h > 0 ? `$${(market.volume24h / 1000).toFixed(0)}K volume/24h` : 'No volume';
      marketContext = ` Market: ${liqStr}, ${volStr}.`;
    }

    if (safetyScore >= 80) {
      return `${tokenName} appears relatively safe with a score of ${safetyScore}/100. ${riskCount} minor issues detected.${marketContext} Always do your own research.`;
    }

    if (safetyScore >= 50) {
      return `${tokenName} has some concerns (${safetyScore}/100). ${riskCount} risks identified.${marketContext} Proceed with caution and verify all information.`;
    }

    return `${tokenName} shows significant red flags (${safetyScore}/100). ${riskCount} risks detected.${marketContext} High risk - avoid or invest only what you can afford to lose.`;
  }

  /**
   * Build MarketData from BirdEye MarketHealthMetrics
   */
  private buildMarketData(marketHealth: any): MarketData {
    return {
      // Basic metrics
      priceUSD: marketHealth.priceUSD || 0,
      volume24h: marketHealth.volume24hUSD || 0,
      marketCap: marketHealth.marketCapUSD || 0,
      priceChange24h: marketHealth.volume24hChangePercent || 0,
      holders: marketHealth.totalHolders || 0,
      transactions24h: 0, // Not provided by BirdEye yet

      // NEW: Critical market health metrics
      totalLiquidityUSD: marketHealth.totalLiquidityUSD || 0,
      volumeBuy24hUSD: marketHealth.volumeBuy24hUSD,
      volumeSell24hUSD: marketHealth.volumeSell24hUSD,
      totalSupply: marketHealth.totalSupply || 0,

      // NEW: Holder distribution
      top10HolderPercentage: marketHealth.top10HolderPercentage || 0,
      top10Holders: marketHealth.top10Holders || [],

      // NEW: Risk flags
      isLowLiquidity: marketHealth.isLowLiquidity || false,
      isLowVolume: marketHealth.isLowVolume || false,
      isHighConcentration: marketHealth.isHighConcentration || false,
    };
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
