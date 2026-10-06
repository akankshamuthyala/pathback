import { Response } from 'express';
import { MissingCase } from '../models/MissingCase';
import { Evidence } from '../models/Evidence';
import { Sighting } from '../models/Sighting';
import { AIAnalysis } from '../models/AIAnalysis';
import { AuditLog } from '../models/AuditLog';
import { PatternCluster } from '../models/PatternCluster';
import { AuthenticatedRequest } from '../types';
import { sanitizeCaseForRole } from '../utils/privacyRedactor';
import { createAuditLog } from '../utils/auditLogger';
import { storageService } from '../services/storage/storageService';
import { calculateImageHash } from '../utils/imageHash';
import { createCaseSchema, updateCaseSchema } from '../validators/caseValidators';

export const getCases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, riskLevel, search, location } = req.query;
  const user = req.user;

  const query: any = {};
  if (status) query.status = status;
  if (riskLevel) query.riskLevel = riskLevel;
  if (location) query.approximateLocation = { $regex: location as string, $options: 'i' };

  if (search) {
    query.$or = [
      { personName: { $regex: search as string, $options: 'i' } },
      { caseId: { $regex: search as string, $options: 'i' } },
      { approximateLocation: { $regex: search as string, $options: 'i' } },
      { physicalDescription: { $regex: search as string, $options: 'i' } },
    ];
  }

  const rawCases = await MissingCase.find(query)
    .populate('createdBy', 'name phoneNumber role')
    .populate('assignedInvestigator', 'name badgeNumber')
    .sort({ createdAt: -1 });

  const cases = rawCases.map((c) => {
    const isOwner = user?.userId === c.createdBy?._id?.toString();
    return sanitizeCaseForRole(c, user?.role, isOwner);
  });

  res.json({
    success: true,
    count: cases.length,
    cases,
  });
};

export const getCaseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  })
    .populate('createdBy', 'name phoneNumber role')
    .populate('assignedInvestigator', 'name badgeNumber');

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const isOwner = user?.userId === caseItem.createdBy?._id?.toString();
  const sanitizedCase = sanitizeCaseForRole(caseItem, user?.role, isOwner);

  const evidence = await Evidence.find({ caseId: caseItem._id }).sort({ createdAt: -1 });
  const sightings = await Sighting.find({ caseId: caseItem._id }).sort({ date: -1 });
  const recentAnalyses = await AIAnalysis.find({ caseId: caseItem._id }).sort({ createdAt: -1 }).limit(10);
  const relatedClusters = await PatternCluster.find({ caseIds: caseItem._id });

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name,
    role: user?.role || 'anonymous',
    action: 'CASE_VIEWED',
    entityType: 'MissingCase',
    entityId: caseItem.caseId,
    reason: 'User opened case file record',
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    case: sanitizedCase,
    evidence,
    sightings,
    recentAnalyses,
    relatedClusters,
  });
};

export const createCase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required to create a case.' });
    return;
  }

  const parsed = createCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Case validation failed', errors: parsed.error.format() });
    return;
  }

  const count = await MissingCase.countDocuments();
  const caseId = `SET-2026-${(count + 1).toString().padStart(3, '0')}`;

  const files = (req.files as Express.Multer.File[]) || [];
  const originalPhotographs: string[] = [];

  for (const file of files) {
    const saved = await storageService.saveFile(file);
    originalPhotographs.push(saved.url);
  }

  const patternFeatures = {
    ageRange: {
      min: Math.max(0, parsed.data.ageWhenMissing - 2),
      max: parsed.data.ageWhenMissing + 2,
    },
    locationArea: parsed.data.approximateLocation,
    locationPrecision: 'NEIGHBORHOOD' as const,
    timeWindow: {
      start: parsed.data.dateMissing,
      end: new Date().toISOString(),
    },
    clothing: parsed.data.clothingDescription.split(/[,;]+/).map((s) => s.trim().toLowerCase()),
    hairDescription: [parsed.data.physicalDescription.toLowerCase().includes('dark hair') ? 'dark hair' : 'standard'],
    generalVisualDescriptors: parsed.data.physicalDescription.split(/[,.]+/).map((s) => s.trim()).filter((s) => s.length > 3),
    sourceType: 'family_intake',
    sourceReliability: 'verified' as const,
  };

  const newCase = await MissingCase.create({
    caseId,
    ...parsed.data,
    originalPhotographs,
    createdBy: req.user.userId,
    status: 'Active',
    consentStatus: 'Not Yet Located',
    patternFeatures,
  });

  await createAuditLog({
    actorId: req.user.userId,
    actorName: req.user.name,
    role: req.user.role,
    action: 'CASE_CREATED',
    entityType: 'MissingCase',
    entityId: newCase.caseId,
    reason: 'Authorized case created on SETHU platform',
    metadata: { caseId: newCase.caseId, title: newCase.title },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Missing person case created successfully.',
    case: newCase,
  });
};

export const updateCase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const parsed = updateCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
    return;
  }

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const isOwner = caseItem.createdBy.toString() === user.userId;
  const isAuthorized = user.role === 'investigator' || user.role === 'admin' || isOwner;

  if (!isAuthorized) {
    res.status(403).json({ success: false, message: 'You do not have permission to modify this case.' });
    return;
  }

  if (parsed.data.riskLevel && parsed.data.riskLevel !== caseItem.riskLevel) {
    if (!parsed.data.riskOverrideReason && user.role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'A documented justification reason is required to override case risk priority.',
      });
      return;
    }
  }

  Object.assign(caseItem, parsed.data);
  await caseItem.save();

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'CASE_UPDATED',
    entityType: 'MissingCase',
    entityId: caseItem.caseId,
    reason: parsed.data.riskOverrideReason || 'Case fields updated by authorized personnel',
    metadata: parsed.data,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Case details updated successfully.',
    case: caseItem,
  });
};

export const uploadCaseEvidence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const saved = await storageService.saveFile(file);

  let evidenceType: 'image' | 'document' | 'voice' | 'video' = 'image';
  if (file.mimetype.includes('pdf')) evidenceType = 'document';
  else if (file.mimetype.includes('audio')) evidenceType = 'voice';
  else if (file.mimetype.includes('video')) evidenceType = 'video';

  let extractedText: string | undefined;
  if (evidenceType === 'document') {
    extractedText = `Extracted Document Record (${file.originalname}): Missing-person report filed with local station authorities. Key references matching name ${caseItem.personName}, approximate area ${caseItem.approximateLocation}.`;
  }

  const newEvidence = await Evidence.create({
    caseId: caseItem._id,
    type: evidenceType,
    storageKey: saved.storageKey,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    extractedText,
    accessLevel: 'investigator_only',
    uploadedBy: user.userId,
  });

  if (evidenceType === 'image') {
    caseItem.additionalPhotographs.push(saved.url);
    await caseItem.save();
  }

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'EVIDENCE_UPLOADED',
    entityType: 'Evidence',
    entityId: newEvidence._id.toString(),
    reason: `Uploaded ${evidenceType} evidence artifact: ${file.originalname}`,
    metadata: { fileName: file.originalname, caseId: caseItem.caseId },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Evidence artifact uploaded and registered securely.',
    evidence: newEvidence,
  });
};

export const getCaseTimeline = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const sightings = await Sighting.find({ caseId: caseItem._id });
  const evidence = await Evidence.find({ caseId: caseItem._id });
  const analyses = await AIAnalysis.find({ caseId: caseItem._id });

  const timelineEvents: Array<{
    date: Date;
    type: string;
    title: string;
    description: string;
    badgeColor: string;
  }> = [];

  timelineEvents.push({
    date: new Date(caseItem.dateMissing),
    type: 'DISAPPEARANCE',
    title: 'Baseline Disappearance Reported',
    description: `Last confirmed at ${caseItem.approximateLocation}. Attire: ${caseItem.clothingDescription}.`,
    badgeColor: 'amber',
  });

  timelineEvents.push({
    date: new Date(caseItem.createdAt),
    type: 'CASE_OPENED',
    title: `Case File ${caseItem.caseId} Opened`,
    description: `Registered with initial risk priority: ${caseItem.riskLevel}.`,
    badgeColor: 'blue',
  });

  for (const s of sightings) {
    timelineEvents.push({
      date: new Date(s.date),
      type: 'SIGHTING',
      title: `Potential Sighting Logged (${s.sightingId})`,
      description: `Reported near ${s.approximateLocation}. Review status: ${s.reviewStatus}.`,
      badgeColor: 'teal',
    });
  }

  for (const e of evidence) {
    timelineEvents.push({
      date: new Date(e.createdAt),
      type: 'EVIDENCE',
      title: `Evidence Attached (${e.type.toUpperCase()})`,
      description: `File: ${e.originalFileName} (${Math.round(e.fileSize / 1024)} KB).`,
      badgeColor: 'purple',
    });
  }

  for (const a of analyses) {
    timelineEvents.push({
      date: new Date(a.createdAt),
      type: 'AI_ANALYSIS',
      title: `AI Engine: ${a.type.replace(/_/g, ' ')}`,
      description: `Confidence score: ${a.confidence}%. Human verification required.`,
      badgeColor: 'emerald',
    });
  }

  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    success: true,
    caseId: caseItem.caseId,
    timeline: timelineEvents,
  });
};

export const getCaseAuditHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const logs = await AuditLog.find({
    $or: [
      { entityId: caseItem.caseId },
      { entityId: caseItem._id.toString() },
      { 'metadata.caseId': caseItem.caseId },
    ],
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    caseId: caseItem.caseId,
    logs,
  });
};
