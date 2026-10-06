import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/auditController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, requireRole('investigator', 'admin'), getAuditLogs);
router.get('/:id', authenticateJwt, requireRole('investigator', 'admin'), getAuditLogById);

export default router;
