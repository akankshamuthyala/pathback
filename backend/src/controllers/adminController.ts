import { Response } from 'express';
import { User } from '../models/User';
import { MissingCase } from '../models/MissingCase';
import { Sighting } from '../models/Sighting';
import { PatternCluster } from '../models/PatternCluster';
import { FraudFlag } from '../models/FraudFlag';
import { LeadReview } from '../models/LeadReview';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../types';
import { createAuditLog } from '../utils/auditLogger';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({
    success: true,
    count: users.length,
    users,
  });
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role, status } = req.body;
  const admin = req.user;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const prevRole = user.role;
  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();

  await createAuditLog({
    actorId: admin?.userId,
    actorName: admin?.name,
    role: admin?.role || 'admin',
    action: 'ADMIN_ROLE_UPDATED',
    entityType: 'User',
    entityId: user._id.toString(),
    reason: `Admin updated role from ${prevRole} to ${role || prevRole}, status to ${status || user.status}`,
    metadata: { userId: user._id, newRole: role, newStatus: status },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'User credentials and authorization updated.',
    user: {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
    },
  });
};

export const getFraudFlags = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const flags = await FraudFlag.find()
    .populate('userId', 'name phoneNumber role')
    .populate('caseId', 'caseId personName')
    .populate('sightingId', 'sightingId approximateLocation')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: flags.length,
    flags,
  });
};

export const updateFraudFlag = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, resolutionReason } = req.body;
  const admin = req.user;

  const flag = await FraudFlag.findById(id);
  if (!flag) {
    res.status(404).json({ success: false, message: 'Fraud flag record not found.' });
    return;
  }

  flag.status = status;
  flag.reviewedBy = admin?.userId as any;
  await flag.save();

  await createAuditLog({
    actorId: admin?.userId,
    actorName: admin?.name,
    role: admin?.role || 'admin',
    action: 'FRAUD_FLAG_RESOLVED',
    entityType: 'FraudFlag',
    entityId: flag._id.toString(),
    reason: resolutionReason || `Admin marked fraud flag as ${status}`,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Fraud flag updated.',
    flag,
  });
};

export const getPlatformAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const totalUsers = await User.countDocuments();
  const totalCases = await MissingCase.countDocuments();
  const totalSightings = await Sighting.countDocuments();
  const totalClusters = await PatternCluster.countDocuments();
  const pendingReviews = await Sighting.countDocuments({ reviewStatus: { $in: ['Pending Review', 'Under Review', 'Potential Lead'] } });
  const pendingFlags = await FraudFlag.countDocuments({ status: 'pending' });

  // Cases by status
  const casesByStatus = await MissingCase.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  // Cases by risk level
  const casesByRisk = await MissingCase.aggregate([
    { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    { $project: { risk: '$_id', count: 1, _id: 0 } },
  ]);

  // Lead review outcomes
  const reviewOutcomes = await LeadReview.aggregate([
    { $group: { _id: '$decision', count: { $sum: 1 } } },
    { $project: { decision: '$_id', count: 1, _id: 0 } },
  ]);

  // Sightings timeline distribution
  const sightingsByMonth = await Sighting.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: '$_id', count: 1, _id: 0 } },
  ]);

  res.json({
    success: true,
    summary: {
      totalUsers,
      totalCases,
      totalSightings,
      totalClusters,
      pendingReviews,
      pendingFlags,
    },
    charts: {
      casesByStatus,
      casesByRisk,
      reviewOutcomes,
      sightingsByMonth,
    },
  });
};
