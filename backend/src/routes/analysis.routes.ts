import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { checkQuota, incrementUsage } from '../middleware/quota.middleware';
import {
  analyzeToken,
  getAnalysisHistory,
  getAnalysisById,
  getSupportedChains,
  getAdapterHealth,
} from '../controllers/analysis.controller';

const router = Router();

// Public routes
router.get('/supported-chains', getSupportedChains);
router.get('/health', getAdapterHealth);

// Protected routes (require authentication + quota)
// Note: incrementUsage is called after successful analysis
router.post('/analyze', requireAuth, checkQuota, async (req, res, next) => {
  try {
    await analyzeToken(req, res);
    // Increment usage after successful analysis
    if (res.statusCode === 200) {
      await incrementUsage(req.user!.id);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/history', requireAuth, getAnalysisHistory);
router.get('/:id', requireAuth, getAnalysisById);

export default router;
