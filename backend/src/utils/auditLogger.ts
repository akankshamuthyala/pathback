import { AuditLog } from '../models/AuditLog';
import { UserRole } from '../types';

interface AuditLogOptions {
  actorId?: string;
  actorName?: string;
  role?: UserRole | 'system' | 'anonymous';
  action: string;
  entityType: string;
  entityId?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export const createAuditLog = async (options: AuditLogOptions): Promise<void> => {
  try {
    await AuditLog.create({
      actorId: options.actorId,
      actorName: options.actorName || 'System',
      role: options.role || 'system',
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      reason: options.reason,
      metadata: options.metadata || {},
      ipAddress: options.ipAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
  }
};
