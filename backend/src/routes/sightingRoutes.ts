import { Router } from 'express';
import {
  submitSighting,
  getSightings,
  getSightingById,
  updateSightingStatus,
} from '../controllers/sightingController';
import { optionalAuth, authenticateJwt, requireRole } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

router.post('/', optionalAuth, uploadMiddleware.array('photographs', 4), submitSighting);
router.get('/', optionalAuth, getSightings);
router.get('/:id', optionalAuth, getSightingById);
router.patch('/:id', authenticateJwt, requireRole('investigator', 'admin'), updateSightingStatus);

export default router;
