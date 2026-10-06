import { Router } from 'express';
import {
  getCaseConsent,
  updateCaseConsent,
  getCaseMessages,
  sendCaseMessage,
} from '../controllers/consentController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/cases/:id/consent', authenticateJwt, getCaseConsent);
router.patch('/cases/:id/consent', authenticateJwt, requireRole('investigator', 'admin'), updateCaseConsent);
router.get('/cases/:id/messages', authenticateJwt, getCaseMessages);
router.post('/messages', authenticateJwt, sendCaseMessage);

export default router;
