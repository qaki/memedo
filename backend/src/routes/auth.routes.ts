import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
