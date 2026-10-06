import { Router } from 'express';
import {
  requestOtp,
  verifyOtp,
  register,
  login,
  refreshToken,
  getMe,
} from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';
import {
  otpRequestLimiter,
  otpVerifyLimiter,
  loginLimiter,
} from '../middleware/rateLimiter';

const router = Router();

router.post('/request-otp', otpRequestLimiter, requestOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.get('/me', authenticateJwt, getMe);

export default router;
