import { Response } from 'express';
import { MissingCase } from '../models/MissingCase';
import { ConsentRecord } from '../models/ConsentRecord';
import { SecureMessage } from '../models/SecureMessage';
import { AuthenticatedRequest } from '../types';
import { createAuditLog } from '../utils/auditLogger';
import { redactSensitiveContactInfo } from '../utils/privacyRedactor';
import { updateConsentSchema, sendMessageSchema } from '../validators/reviewValidators';

export const getCaseConsent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case record not found.' });
    return;
  }

  const consentHistory = await ConsentRecord.find({ caseId: caseItem._id })
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    caseId: caseItem.caseId,
    currentConsentStatus: caseItem.consentStatus,
    history: consentHistory,
  });
};

export const updateCaseConsent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
    res.status(403).json({
      success: false,
      message: 'Only authorized investigators and administrators can modify consent protocols.',
    });
    return;
  }

  const parsed = updateConsentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Consent update validation failed', errors: parsed.error.format() });
    return;
  }

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const prevStatus = caseItem.consentStatus;
  caseItem.consentStatus = parsed.data.status;
  await caseItem.save();

  const record = await ConsentRecord.create({
    caseId: caseItem._id,
    status: parsed.data.status,
    scope: parsed.data.scope,
    reason: parsed.data.reason,
    grantedBy: parsed.data.grantedBy || 'Investigator on Record',
    sharedWith: parsed.data.sharedWith,
    createdBy: user.userId,
  });

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'CONSENT_STATUS_MODIFIED',
    entityType: 'ConsentRecord',
    entityId: caseItem.caseId,
    reason: `Consent status transitioned from "${prevStatus}" to "${parsed.data.status}". Justification: ${parsed.data.reason}`,
    metadata: {
      caseId: caseItem.caseId,
      previousStatus: prevStatus,
      newStatus: parsed.data.status,
      scope: parsed.data.scope,
    },
    ipAddress: req.ip,
  });

  res.status(200).json({
    success: true,
    message: `Consent protocol updated to: ${parsed.data.status}`,
    consentRecord: record,
    updatedCaseStatus: caseItem.consentStatus,
  });
};

export const getCaseMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseId: id }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case not found.' });
    return;
  }

  const query: any = { caseId: caseItem._id };
  if (user.role === 'family_member') {
    query.visibility = { $in: ['family_and_investigator', 'all_authorized'] };
  }

  const messages = await SecureMessage.find(query)
    .populate('senderId', 'name role organizationName')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    caseId: caseItem.caseId,
    messages,
  });
};

export const sendCaseMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
    return;
  }

  const caseItem = await MissingCase.findOne({
    $or: [{ _id: parsed.data.caseId.match(/^[0-9a-fA-F]{24}$/) ? parsed.data.caseId : null }, { caseId: parsed.data.caseId }],
  });

  if (!caseItem) {
    res.status(404).json({ success: false, message: 'Case record not found.' });
    return;
  }

  const { sanitized, hadRedactions } = redactSensitiveContactInfo(parsed.data.message);

  const messageDoc = await SecureMessage.create({
    caseId: caseItem._id,
    senderId: user.userId,
    recipientId: parsed.data.recipientId?.match(/^[0-9a-fA-F]{24}$/) ? parsed.data.recipientId : undefined,
    recipientRole: parsed.data.recipientRole,
    message: sanitized,
    visibility: parsed.data.visibility,
    hasRedactedContactInfo: hadRedactions,
  });

  const populated = await SecureMessage.findById(messageDoc._id).populate('senderId', 'name role organizationName');

  await createAuditLog({
    actorId: user.userId,
    actorName: user.name,
    role: user.role,
    action: 'SECURE_MESSAGE_TRANSMITTED',
    entityType: 'SecureMessage',
    entityId: messageDoc._id.toString(),
    reason: 'Controlled mediated case communication logged',
    metadata: {
      caseId: caseItem.caseId,
      hadRedactions,
      visibility: parsed.data.visibility,
    },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: hadRedactions
      ? 'Message transmitted. Note: Direct personal contact details were redacted according to SETHU privacy protection policies.'
      : 'Secure message dispatched successfully.',
    messageDoc: populated,
    hadRedactions,
  });
};
