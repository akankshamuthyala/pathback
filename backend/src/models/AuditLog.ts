import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorName?: string;
  role: UserRole | 'system' | 'anonymous';
  action: string;
  entityType: string;
  entityId?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    role: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, index: true },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
