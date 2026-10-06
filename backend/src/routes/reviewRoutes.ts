import { Router } from 'express';
import { getReviewQueue, submitLeadReview } from '../controllers/reviewController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/queue', authenticateJwt, requireRole('investigator', 'admin'), getReviewQueue);
router.post('/submit', authenticateJwt, requireRole('investigator', 'admin'), submitLeadReview);

export default router;
