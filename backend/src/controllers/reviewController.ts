import { Response } from 'express';
import { LeadReview } from '../models/LeadReview';
import { Sighting } from '../models/Sighting';
import { MissingCase } from '../models/MissingCase';
import { AIAnalysis } from '../models/AIAnalysis';
import { AuthenticatedRequest } from '../types';
import { createAuditLog } from '../utils/auditLogger';
import { submitReviewSchema } from '../validators/reviewValidators';

export const getReviewQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pendingSightings = await Sighting.find({
    reviewStatus: { $in: ['Pending Review', 'Under Review', 'Potential Lead'] },
  })
    .populate('caseId', 'caseId personName title riskLevel approximateLocation')
    .sort({ createdAt: -1 });

  const recentReviews = await LeadReview.find()
    .populate('reviewerId', 'name badgeNumber role')
    .populate('caseId', 'caseId personName')
    .populate('sightingId', 'sightingId approximateLocation')
    .sort({ reviewedAt: -1 })
    .limit(20);

  res.json({
    success: true,
    queueCount: pendingSightings.length,
    pendingSightings,
    recentReviews,
  });
};

export const submitLeadReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
    res.status(403).json({ success: false, message: 'Only authorized investigators can record lead decisions.' });
    return;
  }

  const parsed = submitReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Review validation failed', errors: parsed.error.format() });
    return;
  }

  const { analysisId, caseId, sightingId, decision, priorityOverride, notes, reason } = parsed.data;

  // Resolve case and sighting
  const caseItem = await MissingCase.findOne({
    $or: [{ _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }, { caseId }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  let sightingObjId = undefined;
  if (sightingId) {
    const sighting = await Sighting.findOne({
      $or: [{ _id: sightingId.match(/^[0-9a-fA-F]{24}$/) ? sightingId : null }, { sightingId }],
    });
    if (sighting) {
      sightingObjId = sighting._id;

      // Update sighting review status
      if (decision === 'approved') sighting.reviewStatus = 'Verified Lead';
      else if (decision === 'rejected') sighting.reviewStatus = 'Rejected';
      else if (decision === 'duplicate') sighting.reviewStatus = 'Duplicate';
      else if (decision === 'needs_more_info') sighting.reviewStatus = 'Needs More Information';
      await sighting.save();
    }
  }

  // If priority override specified
  if (priorityOverride && priorityOverride !== caseItem.riskLevel) {
    caseItem.riskLevel = priorityOverride;
    caseItem.riskOverrideReason = reason;
    await caseItem.save();
  }

  const reviewRecord = await LeadReview.create({
    analysisId: analysisId?.match(/^[0-9a-fA-F]{24}$/) ? analysisId : undefined,
    caseId: caseItem._id,
    sightingId: sightingObjId,
    reviewerId: user.userId,
    decision,
    priorityOverride,
    notes,
    reason,
    reviewedAt: new Date(),
  });

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: `LEAD_REVIEW_${decision.toUpperCase()}`,
    entityType: 'LeadReview',
    entityId: reviewRecord._id.toString(),
    reason: `${reason} | Notes: ${notes}`,
    metadata: {
      caseId: caseItem.caseId,
      decision,
      priorityOverride,
    },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: `Human investigator decision recorded: ${decision}.`,
    review: reviewRecord,
  });
};
