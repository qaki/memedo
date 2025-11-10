import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { setup2FA, enable2FA, disable2FA } from '../controllers/2fa.controller';

const router = Router();

router.post('/setup', requireAuth, setup2FA);
router.post('/enable', requireAuth, enable2FA);
router.post('/disable', requireAuth, disable2FA);

export default router;
