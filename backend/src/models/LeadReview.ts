import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadReview extends Document {
  analysisId?: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  sightingId?: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  decision: 'approved' | 'rejected' | 'duplicate' | 'needs_more_info';
  priorityOverride?: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes: string;
  reason: string;
  reviewedAt: Date;
  createdAt: Date;
}

const LeadReviewSchema = new Schema<ILeadReview>(
  {
    analysisId: { type: Schema.Types.ObjectId, ref: 'AIAnalysis' },
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', required: true, index: true },
    sightingId: { type: Schema.Types.ObjectId, ref: 'Sighting', index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'duplicate', 'needs_more_info'],
      required: true,
      index: true,
    },
    priorityOverride: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'CRITICAL'],
    },
    notes: { type: String, required: true },
    reason: { type: String, required: true },
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LeadReview = mongoose.model<ILeadReview>('LeadReview', LeadReviewSchema);
