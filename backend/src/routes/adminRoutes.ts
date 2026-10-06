import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  getFraudFlags,
  updateFraudFlag,
  getPlatformAnalytics,
} from '../controllers/adminController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt, requireRole('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/fraud-flags', getFraudFlags);
router.patch('/fraud-flags/:id', updateFraudFlag);
router.get('/analytics', getPlatformAnalytics);

export default router;
