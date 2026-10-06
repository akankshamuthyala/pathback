import { Router } from 'express';
import {
  runCaseSummary,
  runAppearanceAnalysis,
  runSightingAnalysis,
  runRiskAssessment,
  runEvidenceConnection,
  getAnalysisById,
} from '../controllers/aiController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// AI endpoints are restricted to authenticated authorized users (Investigators, Admins, and authorized Family members for summaries)
router.post('/cases/:id/summary', authenticateJwt, runCaseSummary);
router.post('/cases/:id/appearance-analysis', authenticateJwt, requireRole('investigator', 'admin'), runAppearanceAnalysis);
router.post('/cases/:id/risk-assessment', authenticateJwt, requireRole('investigator', 'admin'), runRiskAssessment);
router.post('/cases/:id/multimodal-connection', authenticateJwt, requireRole('investigator', 'admin'), runEvidenceConnection);
router.post('/sightings/:id/analyze', authenticateJwt, requireRole('investigator', 'admin'), runSightingAnalysis);
router.get('/analyses/:id', authenticateJwt, getAnalysisById);

export default router;
