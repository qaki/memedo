/**
 * Analysis Controller
 * Handles token analysis requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { analysisService } from '../services/analysis.service';
import { Chain, CHAIN_CONFIGS } from '../types/token-analysis';

// Request validation schemas
const analyzeRequestSchema = z.object({
  address: z.string().min(1, 'Token address is required'),
  chain: z.enum(['ethereum', 'solana', 'bsc', 'base', 'polygon', 'avalanche']),
});

/**
 * POST /api/analysis/analyze
 * Analyze a token
 */
export const analyzeToken = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { address, chain } = analyzeRequestSchema.parse(req.body);

    // Perform analysis
    const analysis = await analysisService.analyzeToken(address, chain as Chain, req.user?.id);

    res.json({
      success: true,
      data: { analysis },
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

    res.json({
      success: true,
      data: { history },
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

    res.json({
      success: true,
      data: { analysis },
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
