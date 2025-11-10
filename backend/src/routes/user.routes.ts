import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUsage,
} from '../controllers/user.controller';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);
router.get('/usage', requireAuth, getUsage);

// Admin-only route example
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  // Admin stats logic (to be implemented in future epic)
  res.json({
    success: true,
    data: { message: 'Admin stats endpoint' },
  });
});

export default router;
