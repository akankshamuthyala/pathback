import mongoose, { Schema, Document } from 'mongoose';
import { SightingReviewStatus, PatternFeatures } from '../types';

export interface ISighting extends Document {
  sightingId: string;
  caseId?: mongoose.Types.ObjectId;
  description: string;
  location: string;
  approximateLocation: string;
  date: Date;
  time?: string;
  clothing?: string;
  estimatedAge?: number;
  sourceType: string;
  sourceReliability: 'low' | 'medium' | 'high' | 'verified' | 'unknown';
  patternFeatures: PatternFeatures;
  duplicateImageHash?: string;
  patternClusterIds: string[];
  reviewStatus: SightingReviewStatus;
  photographs: string[];
  voiceTranscript?: string;
  isVoiceTranscribed?: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SightingSchema = new Schema<ISighting>(
  {
    sightingId: { type: String, required: true, unique: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', index: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    approximateLocation: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    time: { type: String },
    clothing: { type: String },
    estimatedAge: { type: Number },
    sourceType: { type: String, default: 'witness_report' },
    sourceReliability: {
      type: String,
      enum: ['low', 'medium', 'high', 'verified', 'unknown'],
      default: 'unknown',
    },
    patternFeatures: { type: Schema.Types.Mixed, default: {} },
    duplicateImageHash: { type: String, index: true },
    patternClusterIds: [{ type: String, index: true }],
    reviewStatus: {
      type: String,
      enum: [
        'Pending Review',
        'Under Review',
        'Potential Lead',
        'Verified Lead',
        'Rejected',
        'Duplicate',
        'Needs More Information',
      ],
      default: 'Pending Review',
      index: true,
    },
    photographs: [{ type: String }],
    voiceTranscript: { type: String },
    isVoiceTranscribed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Sighting = mongoose.model<ISighting>('Sighting', SightingSchema);
