/**
 * Analysis Controller
 * Handles token analysis requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { analysisService } from '../services/analysis.service.js';
import { Chain, CHAIN_CONFIGS } from '../types/token-analysis.js';

// Request validation schemas
const analyzeRequestSchema = z.object({
  address: z.string().min(1, 'Token address is required'),
  chain: z.enum(['ethereum', 'solana', 'bsc', 'base', 'polygon', 'avalanche']),
});

/**
 * POST /api/analysis/analyze
 * Analyze a token
 */
/**
 * Transform backend TokenAnalysis to frontend format
 */
const transformAnalysisForFrontend = (analysis: any) => {
  return {
    id: analysis.id || '',
    user_id: analysis.userId || '',
    chain: analysis.chain,
    token_address: analysis.address,
    safety_score: analysis.safetyScore,
    risk_level:
      analysis.riskLevel === 'SAFE' ? 'low' : analysis.riskLevel === 'CAUTION' ? 'medium' : 'high',
    data_completeness: analysis.dataCompleteness / 100,
    metadata: analysis.metadata
      ? {
          name: analysis.metadata.name,
          symbol: analysis.metadata.symbol,
          decimals: analysis.metadata.decimals,
          total_supply: analysis.metadata.totalSupply,
          description: analysis.metadata.description,
          logo: analysis.metadata.imageUrl,
          website: analysis.metadata.website,
          twitter: analysis.metadata.twitter,
          telegram: analysis.metadata.telegram,
          is_verified: analysis.metadata.verified,
        }
      : null,
    security_scan: analysis.security
      ? {
          is_honeypot: analysis.security.isHoneypot,
          is_open_source: analysis.security.isOpenSource,
          is_proxy: analysis.security.hasProxy,
          is_mintable: analysis.security.isMintable,
          can_take_back_ownership: analysis.security.canTakeBackOwnership,
          owner_change_balance: analysis.security.canChangeBalance,
          hidden_owner: analysis.security.hasHiddenOwner,
          selfdestruct: analysis.security.hasSelfDestruct,
          external_call: analysis.security.hasExternalCall,
          buy_tax: analysis.security.buyTaxPercentage?.toString(),
          sell_tax: analysis.security.sellTaxPercentage?.toString(),
          is_blacklisted: analysis.security.hasBlacklist,
          is_whitelisted: analysis.security.hasWhitelist,
          is_anti_whale: analysis.security.hasAntiWhale,
          trading_cooldown: analysis.security.hasTradingCooldown,
          personal_slippage_modifiable: analysis.security.canModifySlippage,
          cannot_sell_all: analysis.security.cannotSellAll,
          transfer_pausable: analysis.security.canBePaused,
          risks: analysis.security.risks || [],
        }
      : null,
    created_at: analysis.analyzedAt?.toISOString() || new Date().toISOString(),
    updated_at: analysis.analyzedAt?.toISOString() || new Date().toISOString(),
  };
};

export const analyzeToken = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { address, chain } = analyzeRequestSchema.parse(req.body);

    // Perform analysis
    const analysis = await analysisService.analyzeToken(address, chain as Chain, req.user?.id);

    // Transform to frontend format
    const transformedAnalysis = transformAnalysisForFrontend(analysis);

    res.json({
      success: true,
      data: { analysis: transformedAnalysis },
    });
  } catch (error: unknown) {
    console.error('Analysis error:', error);

    // Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as { errors?: unknown[] };
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: zodError.errors || [],
        },
      });
    }

    // Analysis errors
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during analysis',
      },
    });
  }
};

/**
 * Transform database analysis history to frontend format
 */
const transformHistoryForFrontend = (dbHistory: any[]) => {
  return dbHistory.map((item) => ({
    id: item.id,
    chain: item.chain,
    token_address: item.token_address,
    safety_score: item.safety_score,
    risk_level:
      item.risk_level === 'SAFE' ? 'low' : item.risk_level === 'CAUTION' ? 'medium' : 'high',
    created_at: item.created_at.toISOString(),
  }));
};

/**
 * GET /api/analysis/history
 * Get user's analysis history
 */
export const getAnalysisHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const history = await analysisService.getUserAnalysisHistory(req.user.id, limit);

    // Transform to frontend format
    const transformedHistory = transformHistoryForFrontend(history);

    res.json({
      success: true,
      data: { history: transformedHistory },
    });
  } catch (error: unknown) {
    console.error('Get history error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve analysis history',
      },
    });
  }
};

/**
 * GET /api/analysis/:id
 * Get a specific analysis by ID
 */
export const getAnalysisById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid analysis ID',
        },
      });
    }

    const analysis = await analysisService.getAnalysisById(id, req.user.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Analysis not found',
        },
      });
    }

    // Transform to frontend format
    const transformedAnalysis = transformAnalysisForFrontend(analysis);

    res.json({
      success: true,
      data: { analysis: transformedAnalysis },
    });
  } catch (error: unknown) {
    console.error('Get analysis error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve analysis',
      },
    });
  }
};

/**
 * GET /api/analysis/supported-chains
 * Get list of supported blockchain networks
 */
export const getSupportedChains = async (_req: Request, res: Response) => {
  try {
    const chains = Object.entries(CHAIN_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      explorerUrl: config.explorerUrl,
      nativeToken: config.nativeToken,
    }));

    res.json({
      success: true,
      data: { chains },
    });
  } catch (error: unknown) {
    console.error('Get supported chains error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve supported chains',
      },
    });
  }
};

/**
 * GET /api/analysis/health
 * Get adapter health status
 */
export const getAdapterHealth = async (_req: Request, res: Response) => {
  try {
    // This would use cafo.getAdapterHealth() but we need to export it first
    res.json({
      success: true,
      data: {
        status: 'operational',
        adapters: [],
        message: 'Adapter health monitoring to be implemented',
      },
    });
  } catch (error: unknown) {
    console.error('Get adapter health error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve adapter health',
      },
    });
  }
};
