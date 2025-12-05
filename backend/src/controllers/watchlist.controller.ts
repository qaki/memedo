/**
 * Watchlist Controller
 *
 * Handles HTTP requests for watchlist management.
 */

import { Request, Response } from 'express';
import { watchlistService } from '../services/watchlist.service.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Add a token to user's watchlist
 */
export const addToWatchlist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { tokenAddress, chain, tokenName, tokenSymbol } = req.body;

  if (!tokenAddress || !chain) {
    throw new ApiError('Token address and chain are required', 400);
  }

  await watchlistService.addToWatchlist({
    userId,
    tokenAddress,
    chain,
    tokenName,
    tokenSymbol,
  });

  res.status(201).json({
    success: true,
    message: 'Token added to watchlist',
  });
};

/**
 * Get user's watchlist
 */
export const getWatchlist = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const watchlist = await watchlistService.getWatchlist(userId);

  res.json({
    success: true,
    data: watchlist,
    count: watchlist.length,
  });
};

/**
 * Remove token from watchlist
 */
export const removeFromWatchlist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  if (!id) {
    throw new ApiError('Watchlist item ID is required', 400);
  }

  await watchlistService.removeFromWatchlist(userId, id);

  res.json({
    success: true,
    message: 'Token removed from watchlist',
  });
};

/**
 * Check if token is in watchlist
 */
export const checkWatchlistStatus = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { tokenAddress, chain } = req.params;

  if (!tokenAddress || !chain) {
    throw new ApiError('Token address and chain are required', 400);
  }

  const isInWatchlist = await watchlistService.isInWatchlist(userId, tokenAddress, chain);

  res.json({
    success: true,
    isInWatchlist,
  });
};
