import mongoose, { Schema, Document } from 'mongoose';
import { AIAnalysisType } from '../types';

export interface IAIAnalysis extends Document {
  type: AIAnalysisType;
  caseId: mongoose.Types.ObjectId;
  sightingId?: mongoose.Types.ObjectId;
  inputEvidenceIds: mongoose.Types.ObjectId[];
  result: Record<string, any>;
  confidence: number;
  limitations: string[];
  engineModel: string;
  isDemo: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    type: {
      type: String,
      enum: [
        'CASE_SUMMARY',
        'AGE_PROGRESSION_APPEARANCE',
        'SIGHTING_ANALYSIS',
        'RISK_ASSESSMENT',
        'MULTIMODAL_CONNECTION',
      ],
      required: true,
      index: true,
    },
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', required: true, index: true },
    sightingId: { type: Schema.Types.ObjectId, ref: 'Sighting', index: true },
    inputEvidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    result: { type: Schema.Types.Mixed, required: true },
    confidence: { type: Number, required: true },
    limitations: [{ type: String }],
    engineModel: { type: String, required: true },
    isDemo: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
