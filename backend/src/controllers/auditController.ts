import { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../types';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { action, entityType, limit = 50, page = 1 } = req.query;

  const query: any = {};
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  const parsedLimit = Math.min(100, parseInt(limit as string, 10) || 50);
  const skip = (Math.max(1, parseInt(page as string, 10) || 1) - 1) * parsedLimit;

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('actorId', 'name phoneNumber role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  res.json({
    success: true,
    total,
    page: parseInt(page as string, 10) || 1,
    limit: parsedLimit,
    logs,
  });
};

export const getAuditLogById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const log = await AuditLog.findById(id).populate('actorId', 'name phoneNumber role');
  if (!log) {
    res.status(404).json({ success: false, message: 'Audit entry not found.' });
    return;
  }

  res.json({
    success: true,
    log,
  });
};
