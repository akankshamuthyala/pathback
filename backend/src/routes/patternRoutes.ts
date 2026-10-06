import { Router } from 'express';
import {
  getPatternClusters,
  getPatternClusterById,
  triggerCrossCaseAnalysis,
  reviewPatternCluster,
} from '../controllers/patternController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getPatternClusters);
router.get('/:id', authenticateJwt, getPatternClusterById);
router.post('/run-analysis', authenticateJwt, requireRole('investigator', 'admin'), triggerCrossCaseAnalysis);
router.post('/:id/review', authenticateJwt, requireRole('investigator', 'admin'), reviewPatternCluster);

export default router;
