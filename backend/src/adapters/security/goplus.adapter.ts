/**
 * GoPlus Security API Adapter
 * Provides comprehensive security scanning for tokens across multiple chains
 * Documentation: https://docs.gopluslabs.io/
 */

import axios from 'axios';
import { Adapter } from '../../services/cafo.service';
import { getCached, setCached, CacheTTL } from '../../services/redis.service';
import { SecurityScan, Chain, GOPLUS_CHAIN_MAP } from '../../types/token-analysis';

interface GoPlusResponse {
  code: number; // 1 = success
  message: string;
  result: {
    [address: string]: {
      is_honeypot?: string; // '0' or '1'
      honeypot_with_same_creator?: string;
      is_mintable?: string;
      can_take_back_ownership?: string;
      is_blacklisted?: string;
      blacklist_function?: string;
      is_whitelisted?: string;
      whitelist_function?: string;
      is_proxy?: string;
      hidden_owner?: string;
      trading_cooldown?: string;
      can_be_paused?: string;
      buy_tax?: string; // e.g., '0.05' for 5%
      sell_tax?: string;
      owner_balance?: string;
      owner_percent?: string; // e.g., '0.1' for 10%
      creator_balance?: string;
      creator_percent?: string;
      holder_count?: string;
      lp_holder_count?: string;
      lp_total_supply?: string;
      is_true_token?: string;
      is_airdrop_scam?: string;
    };
  };
}

export class GoPlusAdapter implements Adapter<SecurityScan> {
  id = 'goplus';
  name = 'GoPlus Security';
  chains = ['ethereum', 'bsc', 'polygon', 'avalanche', 'base', 'solana'];
  priority = 0; // Primary security adapter

  /**
   * Execute security scan for a token
   */
  async execute(address: string, chain: Chain): Promise<SecurityScan> {
    // Check cache first
    const cacheKey = `security:${chain}:${address}`;
    const cached = await getCached<SecurityScan>(cacheKey);
    if (cached) return cached;

    // Get GoPlus chain ID
    const chainId = GOPLUS_CHAIN_MAP[chain];
    if (!chainId) {
      throw new Error(`Chain ${chain} not supported by GoPlus`);
    }

    console.log(`[GoPlus] Scanning ${address} on ${chain} (chainId: ${chainId})...`);

    // Call GoPlus REST API directly
    const response = await axios.get<GoPlusResponse>(
      `https://api.gopluslabs.io/api/v1/token_security/${chainId}`,
      {
        params: {
          contract_addresses: address,
        },
        timeout: 30000, // 30 seconds
        headers: {
          accept: 'application/json',
        },
      }
    );

    if (response.data.code !== 1) {
      throw new Error(`GoPlus API error: ${response.data.message}`);
    }

    const data = response.data.result[address.toLowerCase()];
    if (!data) {
      throw new Error(`No security data found for ${address}`);
    }

    // Parse security data
    const securityScan: SecurityScan = {
      isHoneypot: data.is_honeypot === '1' || data.honeypot_with_same_creator === '1',
      isMintable: data.is_mintable === '1',
      canTakeBackOwnership: data.can_take_back_ownership === '1',
      hasBlacklist: data.is_blacklisted === '1' || data.blacklist_function === '1',
      hasWhitelist: data.is_whitelisted === '1' || data.whitelist_function === '1',
      hasProxy: data.is_proxy === '1',
      hasHiddenOwner: data.hidden_owner === '1',
      hasTradingCooldown: data.trading_cooldown === '1',
      canBePaused: data.can_be_paused === '1',
      hasTaxes: Boolean(
        (data.buy_tax && parseFloat(data.buy_tax) > 0) ||
          (data.sell_tax && parseFloat(data.sell_tax) > 0)
      ),
      buyTaxPercentage: data.buy_tax ? parseFloat(data.buy_tax) * 100 : undefined,
      sellTaxPercentage: data.sell_tax ? parseFloat(data.sell_tax) * 100 : undefined,
      ownerBalance: data.owner_balance,
      ownerPercentage: data.owner_percent ? parseFloat(data.owner_percent) * 100 : undefined,
      creatorBalance: data.creator_balance,
      creatorPercentage: data.creator_percent ? parseFloat(data.creator_percent) * 100 : undefined,
      risks: [],
    };

    // Generate risk list with severity levels
    const risks = [];

    // Critical risks (-40 points each)
    if (securityScan.isHoneypot) {
      risks.push({
        level: 'critical' as const,
        name: 'Honeypot Detected',
        description: 'This token cannot be sold. This is a scam.',
        score: -40,
      });
    }

    if (securityScan.hasHiddenOwner) {
      risks.push({
        level: 'critical' as const,
        name: 'Hidden Owner',
        description: 'Contract has hidden ownership mechanisms.',
        score: -40,
      });
    }

    // High risks (-20 points each)
    if (securityScan.isMintable) {
      risks.push({
        level: 'high' as const,
        name: 'Mintable',
        description: 'Owner can mint unlimited tokens, diluting holders.',
        score: -20,
      });
    }

    if (securityScan.canTakeBackOwnership) {
      risks.push({
        level: 'high' as const,
        name: 'Can Take Back Ownership',
        description: 'Ownership can be reclaimed even after renouncement.',
        score: -20,
      });
    }

    if (securityScan.hasBlacklist) {
      risks.push({
        level: 'high' as const,
        name: 'Blacklist Function',
        description: 'Owner can block specific addresses from trading.',
        score: -20,
      });
    }

    if (securityScan.hasProxy) {
      risks.push({
        level: 'high' as const,
        name: 'Proxy Contract',
        description: 'Contract can be upgraded, potentially adding malicious code.',
        score: -15,
      });
    }

    // Medium risks (-10 points each)
    if (securityScan.hasTradingCooldown) {
      risks.push({
        level: 'medium' as const,
        name: 'Trading Cooldown',
        description: 'Cooldown period between trades may limit selling.',
        score: -10,
      });
    }

    if (securityScan.canBePaused) {
      risks.push({
        level: 'medium' as const,
        name: 'Pausable',
        description: 'Trading can be paused by owner.',
        score: -10,
      });
    }

    if (securityScan.ownerPercentage && securityScan.ownerPercentage > 10) {
      risks.push({
        level: 'medium' as const,
        name: 'High Owner Balance',
        description: `Owner holds ${securityScan.ownerPercentage.toFixed(1)}% of supply.`,
        score: -10,
      });
    }

    // Low risks (-5 points each)
    if (securityScan.buyTaxPercentage && securityScan.buyTaxPercentage > 10) {
      risks.push({
        level: 'low' as const,
        name: 'High Buy Tax',
        description: `Buy tax is ${securityScan.buyTaxPercentage.toFixed(1)}%.`,
        score: -5,
      });
    }

    if (securityScan.sellTaxPercentage && securityScan.sellTaxPercentage > 10) {
      risks.push({
        level: 'low' as const,
        name: 'High Sell Tax',
        description: `Sell tax is ${securityScan.sellTaxPercentage.toFixed(1)}%.`,
        score: -5,
      });
    }

    securityScan.risks = risks;

    // Cache result for 15 minutes
    await setCached(cacheKey, securityScan, CacheTTL.TRENDING_DATA);

    console.log(
      `[GoPlus] ✅ Security scan complete: ${risks.length} risks found (Honeypot: ${securityScan.isHoneypot})`
    );

    return securityScan;
  }
}

// Singleton instance
export const goPlusAdapter = new GoPlusAdapter();
