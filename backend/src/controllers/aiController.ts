import { Response } from 'express';
import { MissingCase } from '../models/MissingCase';
import { Sighting } from '../models/Sighting';
import { Evidence } from '../models/Evidence';
import { AIAnalysis } from '../models/AIAnalysis';
import { AuthenticatedRequest } from '../types';
import { createAuditLog } from '../utils/auditLogger';
import { generateCaseSummary } from '../services/ai/caseSummaryEngine';
import { generateAppearanceAnalysis } from '../services/ai/appearanceEngine';
import { analyzeSighting } from '../services/ai/sightingAnalysisEngine';
import { assessRisk } from '../services/ai/riskAssessmentEngine';
import { connectEvidenceAcrossSources } from '../services/ai/evidenceConnectionEngine';

export const runCaseSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const evidence = await Evidence.find({ caseId: caseItem._id });
  const { result, isDemo, model } = await generateCaseSummary(caseItem, evidence);

  const analysis = await AIAnalysis.create({
    type: 'CASE_SUMMARY',
    caseId: caseItem._id,
    inputEvidenceIds: evidence.map((e) => e._id),
    result,
    confidence: isDemo ? 85 : 92,
    limitations: [
      'Summary generated solely from ingested records and witness submissions.',
      'All timelines and action recommendations require verification by assigned investigator.',
    ],
    engineModel: model,
    isDemo,
    createdBy: user?.userId || caseItem.createdBy,
  });

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'AI_CASE_SUMMARY_GENERATED',
    entityType: 'AIAnalysis',
    entityId: analysis._id.toString(),
    reason: `Generated AI Case Summary for case ${caseItem.caseId}`,
    metadata: { caseId: caseItem.caseId, isDemo, model },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'AI Case Summary generated successfully.',
    analysis,
  });
};

export const runAppearanceAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const { result, isDemo, model } = await generateAppearanceAnalysis(caseItem);

  const analysis = await AIAnalysis.create({
    type: 'AGE_PROGRESSION_APPEARANCE',
    caseId: caseItem._id,
    result,
    confidence: isDemo ? 78 : 84,
    limitations: [
      'Age-Aware Appearance Analysis represents probabilistic biological modeling.',
      'Visual progressions and morphological profiles must NEVER be treated as conclusive proof of identity.',
      'Human investigator verification and physical corroborating evidence are required.',
    ],
    engineModel: model,
    isDemo,
    createdBy: user?.userId || caseItem.createdBy,
  });

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'AI_APPEARANCE_ANALYSIS_GENERATED',
    entityType: 'AIAnalysis',
    entityId: analysis._id.toString(),
    reason: `Generated Age-Aware Appearance Analysis for ${caseItem.caseId}`,
    metadata: { caseId: caseItem.caseId, isDemo, model },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Age-Aware Appearance Analysis generated successfully.',
    analysis,
  });
};

export const runSightingAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const sighting = await Sighting.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sightingId: id }],
  }).populate('caseId');

  if (!sighting) {
    res.status(404).json({ success: false, message: 'Sighting record not found.' });
    return;
  }

  if (!sighting.caseId) {
    res.status(400).json({ success: false, message: 'Sighting must be linked to a case record to run comparative lead analysis.' });
    return;
  }

  const caseItem = sighting.caseId as any;
  const { result, isDemo, model } = await analyzeSighting(caseItem, sighting);

  const analysis = await AIAnalysis.create({
    type: 'SIGHTING_ANALYSIS',
    caseId: caseItem._id,
    sightingId: sighting._id,
    result,
    confidence: result.leadScore,
    limitations: [
      'Sighting analysis scores are mathematical correlation aids, not proof of identity.',
      'Responsible AI Protocol prohibits automated identity confirmation.',
      'Human verification by an authorized investigator is required before taking operational steps.',
    ],
    engineModel: model,
    isDemo,
    createdBy: user?.userId || caseItem.createdBy,
  });

  // Update sighting review status if high relevance
  if (result.leadScore >= 70 && sighting.reviewStatus === 'Pending Review') {
    sighting.reviewStatus = 'Potential Lead';
    await sighting.save();
  }

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'AI_SIGHTING_ANALYSIS_GENERATED',
    entityType: 'AIAnalysis',
    entityId: analysis._id.toString(),
    reason: `Ran sighting analysis on ${sighting.sightingId} for case ${caseItem.caseId}`,
    metadata: {
      sightingId: sighting.sightingId,
      caseId: caseItem.caseId,
      leadScore: result.leadScore,
      leadStatus: result.potentialLeadStatus,
    },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Sighting comparative analysis completed.',
    analysis,
  });
};

export const runRiskAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const { result, isDemo, model } = await assessRisk(caseItem);

  const analysis = await AIAnalysis.create({
    type: 'RISK_ASSESSMENT',
    caseId: caseItem._id,
    result,
    confidence: result.priorityScore,
    limitations: [
      'Algorithmic risk evaluation does not constitute a statutory, medical, or law-enforcement ruling.',
      'Human investigators possess full authority to override risk triage with a documented justification.',
    ],
    engineModel: model,
    isDemo,
    createdBy: user?.userId || caseItem.createdBy,
  });

  // Automatically update case risk level if not explicitly overridden
  if (!caseItem.riskOverrideReason) {
    caseItem.riskLevel = result.riskLevel;
    await caseItem.save();
  }

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'AI_RISK_ASSESSMENT_GENERATED',
    entityType: 'AIAnalysis',
    entityId: analysis._id.toString(),
    reason: `Calculated risk priority for ${caseItem.caseId}: ${result.riskLevel} (${result.priorityScore}/100)`,
    metadata: { caseId: caseItem.caseId, riskLevel: result.riskLevel, priorityScore: result.priorityScore },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Risk assessment completed.',
    analysis,
    updatedRiskLevel: caseItem.riskLevel,
  });
};

export const runEvidenceConnection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const sightings = await Sighting.find({ caseId: caseItem._id });
  const evidence = await Evidence.find({ caseId: caseItem._id });

  const { result, isDemo, model } = await connectEvidenceAcrossSources(caseItem, sightings, evidence);

  const analysis = await AIAnalysis.create({
    type: 'MULTIMODAL_CONNECTION',
    caseId: caseItem._id,
    result,
    confidence: 82,
    limitations: [
      'Multimodal connections detect statistical correlations across disparate records.',
      'Contradictions and leads require investigator field verification.',
    ],
    engineModel: model,
    isDemo,
    createdBy: user?.userId || caseItem.createdBy,
  });

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'investigator',
    action: 'AI_MULTIMODAL_CONNECTION_GENERATED',
    entityType: 'AIAnalysis',
    entityId: analysis._id.toString(),
    reason: `Ran multimodal cross-evidence connection analysis for case ${caseItem.caseId}`,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Multimodal cross-evidence connection analysis completed.',
    analysis,
  });
};

export const getAnalysisById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const analysis = await AIAnalysis.findById(id).populate('caseId sightingId');
  if (!analysis) {
    res.status(404).json({ success: false, message: 'Analysis record not found.' });
    return;
  }

  res.json({
    success: true,
    analysis,
  });
};
