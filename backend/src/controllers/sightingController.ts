import { Response } from 'express';
import { Sighting } from '../models/Sighting';
import { MissingCase } from '../models/MissingCase';
import { Evidence } from '../models/Evidence';
import { AuthenticatedRequest } from '../types';
import { sanitizeSightingForRole } from '../utils/privacyRedactor';
import { createAuditLog } from '../utils/auditLogger';
import { storageService } from '../services/storage/storageService';
import { calculateImageHash } from '../utils/imageHash';
import { FraudDetector } from '../services/fraud/fraudDetector';
import { PatternRecognitionEngine } from '../services/patterns/patternEngine';
import { createSightingSchema } from '../validators/sightingValidators';

export const submitSighting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = createSightingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid sighting payload', errors: parsed.error.format() });
    return;
  }

  const user = req.user;
  const files = (req.files as Express.Multer.File[]) || [];
  const photographs: string[] = [];
  let duplicateImageHash: string | undefined;

  for (const file of files) {
    const saved = await storageService.saveFile(file);
    photographs.push(saved.url);

    if (file.mimetype.startsWith('image/')) {
      const buf = await storageService.getFileBuffer(saved.storageKey);
      duplicateImageHash = await calculateImageHash(buf);
    }
  }

  const fraudCheck = await FraudDetector.evaluateSightingSubmission({
    userId: user?.userId,
    approximateLocation: parsed.data.approximateLocation,
    imageHash: duplicateImageHash,
    description: parsed.data.description,
  });

  const count = await Sighting.countDocuments();
  const sightingId = `S-${(100 + count + 1)}`;

  let caseObjId = undefined;
  if (parsed.data.caseId) {
    const matchedCase = await MissingCase.findOne({
      $or: [
        { _id: parsed.data.caseId.match(/^[0-9a-fA-F]{24}$/) ? parsed.data.caseId : null },
        { caseId: parsed.data.caseId },
      ],
    });
    if (matchedCase) {
      caseObjId = matchedCase._id;
    }
  }

  const patternFeatures = {
    ageRange: parsed.data.estimatedAge
      ? { min: Math.max(0, parsed.data.estimatedAge - 2), max: parsed.data.estimatedAge + 2 }
      : undefined,
    locationArea: parsed.data.approximateLocation,
    locationPrecision: 'NEIGHBORHOOD' as const,
    timeWindow: {
      start: parsed.data.date,
      end: parsed.data.date,
    },
    clothing: parsed.data.clothing ? parsed.data.clothing.split(/[,;]+/).map((s) => s.trim().toLowerCase()) : [],
    hairDescription: [],
    generalVisualDescriptors: [parsed.data.description.slice(0, 100)],
    sourceType: parsed.data.sourceType,
    sourceReliability: parsed.data.sourceReliability,
  };

  const newSighting = await Sighting.create({
    sightingId,
    caseId: caseObjId,
    description: parsed.data.description,
    location: parsed.data.location,
    approximateLocation: parsed.data.approximateLocation,
    date: new Date(parsed.data.date),
    time: parsed.data.time,
    clothing: parsed.data.clothing,
    estimatedAge: parsed.data.estimatedAge,
    sourceType: parsed.data.sourceType,
    sourceReliability: parsed.data.sourceReliability,
    photographs,
    voiceTranscript: parsed.data.voiceTranscript,
    isVoiceTranscribed: parsed.data.isVoiceTranscribed,
    duplicateImageHash,
    reviewStatus: fraudCheck.isDuplicate ? 'Duplicate' : 'Pending Review',
    createdBy: user?.userId || '000000000000000000000000',
    patternFeatures,
  });

  if (caseObjId && photographs.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await Evidence.create({
        caseId: caseObjId,
        sightingId: newSighting._id,
        type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.includes('audio') ? 'voice' : 'document',
        storageKey: file.filename,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        accessLevel: 'investigator_only',
        uploadedBy: user?.userId || '000000000000000000000000',
      });
    }
  }

  await createAuditLog({
    actorId: user?.userId,
    actorName: user?.name || 'Public Reporter',
    role: user?.role || 'public_reporter',
    action: 'SIGHTING_SUBMITTED',
    entityType: 'Sighting',
    entityId: newSighting.sightingId,
    reason: 'Sighting report ingested with multimodal evidence',
    metadata: {
      sightingId: newSighting.sightingId,
      hasPhotos: photographs.length > 0,
      isDuplicateFlagged: fraudCheck.isDuplicate,
    },
    ipAddress: req.ip,
  });

  PatternRecognitionEngine.runCrossCasePatternAnalysis().catch((err) =>
    console.error('Async pattern run failed:', err)
  );

  res.status(201).json({
    success: true,
    message: fraudCheck.isDuplicate
      ? 'Sighting recorded. Note: Perceptual hash matched an existing image upload and was flagged for investigator review.'
      : 'Sighting report submitted successfully for investigator verification.',
    sighting: newSighting,
    fraudWarning: fraudCheck.isDuplicate
      ? `Potential duplicate image matched report ${fraudCheck.duplicateSightingId}`
      : undefined,
  });
};

export const getSightings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { caseId, status, location } = req.query;
  const user = req.user;

  const query: any = {};
  if (status) query.reviewStatus = status;
  if (location) query.approximateLocation = { $regex: location as string, $options: 'i' };

  if (caseId) {
    const matchedCase = await MissingCase.findOne({
      $or: [
        { _id: (caseId as string).match(/^[0-9a-fA-F]{24}$/) ? caseId : null },
        { caseId: caseId as string },
      ],
    });
    if (matchedCase) {
      query.caseId = matchedCase._id;
    }
  }

  const rawSightings = await Sighting.find(query)
    .populate('caseId', 'caseId personName title status riskLevel approximateLocation')
    .sort({ date: -1 });

  const sightings = rawSightings.map((s) => {
    const isReporter = user?.userId === s.createdBy?.toString();
    return sanitizeSightingForRole(s, user?.role, isReporter);
  });

  res.json({
    success: true,
    count: sightings.length,
    sightings,
  });
};

export const getSightingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  const sighting = await Sighting.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sightingId: id }],
  }).populate('caseId');

  if (!sighting) {
    res.status(404).json({ success: false, message: 'Sighting record not found.' });
    return;
  }

  const isReporter = user?.userId === sighting.createdBy?.toString();
  const sanitized = sanitizeSightingForRole(sighting, user?.role, isReporter);

  res.json({
    success: true,
    sighting: sanitized,
  });
};

export const updateSightingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { reviewStatus, notes } = req.body;
  const user = req.user;

  if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
    res.status(403).json({ success: false, message: 'Only authorized investigators or administrators can update sighting status.' });
    return;
  }

  const sighting = await Sighting.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sightingId: id }],
  });

  if (!sighting) {
    res.status(404).json({ success: false, message: 'Sighting not found.' });
    return;
  }

  sighting.reviewStatus = reviewStatus;
  await sighting.save();

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'SIGHTING_REVIEW_UPDATED',
    entityType: 'Sighting',
    entityId: sighting.sightingId,
    reason: notes || `Investigator updated review status to ${reviewStatus}`,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Sighting status updated.',
    sighting,
  });
};
