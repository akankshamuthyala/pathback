import mongoose, { Schema, Document } from 'mongoose';
import { ClusterStatus } from '../types';

export interface IPatternCluster extends Document {
  clusterId: string;
  title: string;
  description: string;
  caseIds: mongoose.Types.ObjectId[];
  sightingIds: mongoose.Types.ObjectId[];
  sharedArea: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  relevanceScore: number;
  scoreBreakdown: {
    geographicSimilarity: number;
    timelineSimilarity: number;
    descriptionSimilarity: number;
    coarseVisualSimilarity: number;
    clothingSimilarity: number;
    duplicateReportEvidence: number;
  };
  supportingFactors: string[];
  conflictingFactors: string[];
  limitations: string[];
  status: ClusterStatus;
  investigatorNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatternClusterSchema = new Schema<IPatternCluster>(
  {
    clusterId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    caseIds: [{ type: Schema.Types.ObjectId, ref: 'MissingCase', index: true }],
    sightingIds: [{ type: Schema.Types.ObjectId, ref: 'Sighting', index: true }],
    sharedArea: { type: String, required: true },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    relevanceScore: { type: Number, required: true },
    scoreBreakdown: {
      geographicSimilarity: { type: Number, default: 0 },
      timelineSimilarity: { type: Number, default: 0 },
      descriptionSimilarity: { type: Number, default: 0 },
      coarseVisualSimilarity: { type: Number, default: 0 },
      clothingSimilarity: { type: Number, default: 0 },
      duplicateReportEvidence: { type: Number, default: 0 },
    },
    supportingFactors: [{ type: String }],
    conflictingFactors: [{ type: String }],
    limitations: [{ type: String }],
    status: {
      type: String,
      enum: [
        'Suggested',
        'Under Review',
        'Confirmed Related by Investigator',
        'Dismissed',
        'Needs More Information',
      ],
      default: 'Suggested',
      index: true,
    },
    investigatorNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const PatternCluster = mongoose.model<IPatternCluster>('PatternCluster', PatternClusterSchema);
