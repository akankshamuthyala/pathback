import { Response } from 'express';
import { PatternCluster } from '../models/PatternCluster';
import { AuthenticatedRequest } from '../types';
import { PatternRecognitionEngine } from '../services/patterns/patternEngine';
import { createAuditLog } from '../utils/auditLogger';
import { updatePatternClusterSchema } from '../validators/reviewValidators';

export const getPatternClusters = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  const query: any = {};
  if (status) query.status = status;

  const clusters = await PatternCluster.find(query)
    .populate('caseIds', 'caseId personName title approximateLocation riskLevel status')
    .populate('sightingIds', 'sightingId approximateLocation date clothing reviewStatus photographs')
    .sort({ relevanceScore: -1 });

  res.json({
    success: true,
    count: clusters.length,
    clusters,
  });
};

export const getPatternClusterById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const cluster = await PatternCluster.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clusterId: id }],
  })
    .populate('caseIds')
    .populate('sightingIds')
    .populate('reviewedBy', 'name badgeNumber role');

  if (!cluster) {
    res.status(404).json({ success: false, message: 'Pattern cluster not found.' });
    return;
  }

  res.json({
    success: true,
    cluster,
  });
};

export const triggerCrossCaseAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  const clusters = await PatternRecognitionEngine.runCrossCasePatternAnalysis();

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'CROSS_CASE_PATTERN_ANALYSIS_EXECUTED',
    entityType: 'PatternCluster',
    reason: `Automated multi-signal pattern scan initiated across active cases and sightings`,
    metadata: { clustersDiscovered: clusters.length },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: `Cross-case pattern recognition scan completed. Evaluated ${clusters.length} active spatial and temporal clusters.`,
    clusters,
  });
};

export const reviewPatternCluster = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
    res.status(403).json({ success: false, message: 'Only authorized investigators can review pattern clusters.' });
    return;
  }

  const parsed = updatePatternClusterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
    return;
  }

  const cluster = await PatternCluster.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clusterId: id }],
  });

  if (!cluster) {
    res.status(404).json({ success: false, message: 'Pattern cluster not found.' });
    return;
  }

  cluster.status = parsed.data.status;
  cluster.investigatorNotes = parsed.data.investigatorNotes;
  cluster.reviewedBy = user.userId as any;
  cluster.reviewedAt = new Date();
  await cluster.save();

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'PATTERN_CLUSTER_REVIEWED',
    entityType: 'PatternCluster',
    entityId: cluster.clusterId,
    reason: parsed.data.investigatorNotes,
    metadata: {
      newStatus: cluster.status,
      clusterId: cluster.clusterId,
      relevanceScore: cluster.relevanceScore,
    },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: `Cluster review recorded. Status updated to: ${cluster.status}`,
    cluster,
  });
};
