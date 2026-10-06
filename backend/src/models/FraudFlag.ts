import mongoose, { Schema, Document } from 'mongoose';

export interface IFraudFlag extends Document {
  type: 'DUPLICATE_IMAGE' | 'RAPID_SUBMISSIONS' | 'SUSPICIOUS_LOCATION' | 'REPEATED_OTP_FAILURE' | 'FALSE_REPORTING_ALERT';
  userId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  sightingId?: mongoose.Types.ObjectId;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  reason: string;
  evidenceMetadata?: Record<string, any>;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FraudFlagSchema = new Schema<IFraudFlag>(
  {
    type: {
      type: String,
      enum: ['DUPLICATE_IMAGE', 'RAPID_SUBMISSIONS', 'SUSPICIOUS_LOCATION', 'REPEATED_OTP_FAILURE', 'FALSE_REPORTING_ALERT'],
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase' },
    sightingId: { type: Schema.Types.ObjectId, ref: 'Sighting' },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
      index: true,
    },
    reason: { type: String, required: true },
    evidenceMetadata: { type: Schema.Types.Mixed, default: {} },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const FraudFlag = mongoose.model<IFraudFlag>('FraudFlag', FraudFlagSchema);
