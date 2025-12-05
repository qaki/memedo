/**
 * Watchlist Routes
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  checkWatchlistStatus,
} from '../controllers/watchlist.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Add token to watchlist
router.post('/', asyncHandler(addToWatchlist));

// Get user's watchlist
router.get('/', asyncHandler(getWatchlist));

// Remove token from watchlist
router.delete('/:id', asyncHandler(removeFromWatchlist));

// Check if token is in watchlist
router.get('/check/:tokenAddress/:chain', asyncHandler(checkWatchlistStatus));

export default router;
