/**
 * RugCheck API Adapter (Solana)
 * Free security scanning for Solana tokens
 * Documentation: https://rugcheck.xyz/docs
 */

import axios from 'axios';
import { Adapter } from '../../services/cafo.service.js';
import { getCached, setCached, CacheTTL } from '../../services/redis.service.js';
import { SecurityScan, Chain } from '../../types/token-analysis.js';

interface RugCheckResponse {
  tokenProgram?: string;
  tokenType?: string;
  risks: Array<{
    name: string;
    description: string;
    level: string;
    score: number;
    value?: string;
  }>;
  score: number; // 0-1 (1 = safest)
  score_normalised: number; // 0-1
  lpLockedPct: number; // Liquidity locked percentage
  error?: string;
}

export class RugCheckAdapter implements Adapter<SecurityScan> {
  id = 'rugcheck';
  name = 'RugCheck';
  chains = ['solana'];
  priority = 1; // Fallback for Solana (after GoPlus)

  private readonly BASE_URL = 'https://api.rugcheck.xyz/v1';

  /**
   * Execute security scan for a Solana token
   */
  async execute(address: string, chain: Chain): Promise<SecurityScan> {
    if (chain !== 'solana') {
      throw new Error('RugCheck only supports Solana');
    }

    // Check cache first
    const cacheKey = `security:rugcheck:${chain}:${address}`;
    const cached = await getCached<SecurityScan>(cacheKey);
    if (cached) return cached;

    console.log(`[RugCheck] Scanning ${address} on Solana...`);

    try {
      // Call RugCheck API (no auth required!)
      const response = await axios.get<RugCheckResponse>(
        `${this.BASE_URL}/tokens/${address}/report/summary`,
        {
          timeout: 10000,
          headers: {
            accept: 'application/json',
          },
        }
      );

      const data = response.data;

      if (data.error) {
        throw new Error(`RugCheck API error: ${data.error}`);
      }

      // Parse security data
      const securityScan: SecurityScan = {
        isHoneypot: false, // RugCheck doesn't explicitly check honeypots
        isMintable: false,
        canTakeBackOwnership: false,
        hasBlacklist: false,
        hasWhitelist: false,
        hasProxy: false,
        hasHiddenOwner: false,
        hasTradingCooldown: false,
        canBePaused: false,
        hasTaxes: false,
        isOwnershipRenounced: false, // Will be set based on mint/update authority
        risks: [],
      };

      // Parse RugCheck-specific risks
      const risks = data.risks.map((risk) => {
        // Map RugCheck levels to our severity levels
        let level: 'critical' | 'high' | 'medium' | 'low' = 'low';
        let score = -5;

        if (
          risk.level.toLowerCase().includes('critical') ||
          risk.level.toLowerCase() === 'danger'
        ) {
          level = 'critical';
          score = -40;
        } else if (
          risk.level.toLowerCase().includes('high') ||
          risk.level.toLowerCase() === 'warn'
        ) {
          level = 'high';
          score = -20;
        } else if (
          risk.level.toLowerCase().includes('medium') ||
          risk.level.toLowerCase() === 'info'
        ) {
          level = 'medium';
          score = -10;
        }

        // Update security flags based on risk names
        const riskName = risk.name.toLowerCase();
        if (riskName.includes('mint') && riskName.includes('authority')) {
          // Check if mint authority is DISABLED (revoked)
          if (
            riskName.includes('disabled') ||
            riskName.includes('revoked') ||
            riskName.includes('none')
          ) {
            securityScan.isOwnershipRenounced = true; // GOOD: Mint authority revoked!
          } else {
            securityScan.isMintable = true; // BAD: Can still mint
          }
        }
        if (riskName.includes('update') && riskName.includes('authority')) {
          // Check if update authority is DISABLED (revoked)
          if (
            riskName.includes('disabled') ||
            riskName.includes('revoked') ||
            riskName.includes('none')
          ) {
            securityScan.isOwnershipRenounced = true; // GOOD: Update authority revoked!
          }
        }
        if (riskName.includes('freeze')) {
          securityScan.hasBlacklist = true; // Solana freeze = blacklist equivalent
        }
        if (riskName.includes('mutable') || riskName.includes('metadata')) {
          securityScan.hasProxy = true; // Mutable metadata = proxy equivalent
        }

        return {
          level,
          name: risk.name,
          description: risk.description,
          score,
        };
      });

      securityScan.risks = risks;

      // Add liquidity lock info as a positive signal
      if (data.lpLockedPct > 0) {
        console.log(`[RugCheck] Liquidity locked: ${data.lpLockedPct.toFixed(1)}%`);
      }

      // Cache result for 15 minutes
      await setCached(cacheKey, securityScan, CacheTTL.TRENDING_DATA);

      console.log(
        `[RugCheck] ✅ Security scan complete: ${risks.length} risks found (Score: ${data.score.toFixed(2)})`
      );

      return securityScan;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Token not found on RugCheck');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid token address');
        }
        throw new Error(`RugCheck API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
export const rugCheckAdapter = new RugCheckAdapter();
