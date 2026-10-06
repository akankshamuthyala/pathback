import { Router } from 'express';
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  uploadCaseEvidence,
  getCaseTimeline,
  getCaseAuditHistory,
} from '../controllers/caseController';
import { authenticateJwt, optionalAuth, requireRole } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

router.get('/', optionalAuth, getCases);
router.post('/', authenticateJwt, uploadMiddleware.array('photographs', 5), createCase);
router.get('/:id', optionalAuth, getCaseById);
router.patch('/:id', authenticateJwt, updateCase);
router.post('/:id/evidence', authenticateJwt, uploadMiddleware.single('file'), uploadCaseEvidence);
router.get('/:id/timeline', optionalAuth, getCaseTimeline);
router.get('/:id/audit', authenticateJwt, requireRole('investigator', 'admin'), getCaseAuditHistory);

export default router;
