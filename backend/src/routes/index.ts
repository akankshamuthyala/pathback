import { Router } from 'express';
import authRoutes from './authRoutes';
import caseRoutes from './caseRoutes';
import sightingRoutes from './sightingRoutes';
import aiRoutes from './aiRoutes';
import patternRoutes from './patternRoutes';
import reviewRoutes from './reviewRoutes';
import consentRoutes from './consentRoutes';
import auditRoutes from './auditRoutes';
import adminRoutes from './adminRoutes';

import { checkSupabaseStatus } from '../services/supabaseService';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/sightings', sightingRoutes);
router.use('/ai', aiRoutes);
router.use('/patterns', patternRoutes);
router.use('/reviews', reviewRoutes);
router.use('/consent', consentRoutes);
router.use('/communication', consentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/admin', adminRoutes);

router.get('/supabase/status', async (_req, res) => {
  const status = await checkSupabaseStatus();
  res.json({ success: true, ...status });
});

export default router;
