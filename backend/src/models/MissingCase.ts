import mongoose, { Schema, Document } from 'mongoose';
import { CaseStatus, RiskLevel, ConsentStatus, PatternFeatures } from '../types';

export interface IMissingCase extends Document {
  caseId: string;
  title: string;
  personName: string;
  gender?: string;
  ageWhenMissing: number;
  estimatedCurrentAge: number;
  dateMissing: Date;
  lastKnownLocation: string; // Exact location (restricted)
  approximateLocation: string; // Public/neighborhood level (e.g. "Central Railway Station Area, District 4")
  locationVisibility: 'RESTRICTED_INVESTIGATOR' | 'PUBLIC_APPROXIMATE';
  physicalDescription: string;
  clothingDescription: string;
  vulnerabilityInformation?: string;
  circumstances: string;
  originalPhotographs: string[];
  additionalPhotographs: string[];
  status: CaseStatus;
  riskLevel: RiskLevel;
  riskOverrideReason?: string;
  consentStatus: ConsentStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedInvestigator?: mongoose.Types.ObjectId;
  patternFeatures: PatternFeatures;
  patternClusterIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MissingCaseSchema = new Schema<IMissingCase>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    personName: { type: String, required: true, trim: true },
    gender: { type: String, trim: true },
    ageWhenMissing: { type: Number, required: true },
    estimatedCurrentAge: { type: Number, required: true },
    dateMissing: { type: Date, required: true, index: true },
    lastKnownLocation: { type: String, required: true },
    approximateLocation: { type: String, required: true, index: true },
    locationVisibility: {
      type: String,
      enum: ['RESTRICTED_INVESTIGATOR', 'PUBLIC_APPROXIMATE'],
      default: 'RESTRICTED_INVESTIGATOR',
    },
    physicalDescription: { type: String, required: true },
    clothingDescription: { type: String, required: true },
    vulnerabilityInformation: { type: String },
    circumstances: { type: String, required: true },
    originalPhotographs: [{ type: String }],
    additionalPhotographs: [{ type: String }],
    status: {
      type: String,
      enum: [
        'Draft',
        'Active',
        'Under Review',
        'Potential Lead',
        'Human Verification',
        'Located',
        'Consent Pending',
        'Reunification Supported',
        'Closed',
        'Archived',
      ],
      default: 'Active',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
      index: true,
    },
    riskOverrideReason: { type: String },
    consentStatus: {
      type: String,
      enum: [
        'Not Yet Located',
        'Located, Identity Pending',
        'Identity Verified, Consent Pending',
        'Limited Disclosure Approved',
        'Family Contact Approved',
        'Restricted Disclosure',
        'Do Not Disclose',
        'Consent Withdrawn',
        'Reunification Supported',
      ],
      default: 'Not Yet Located',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedInvestigator: { type: Schema.Types.ObjectId, ref: 'User' },
    patternFeatures: { type: Schema.Types.Mixed, default: {} },
    patternClusterIds: [{ type: String, index: true }],
  },
  { timestamps: true }
);

export const MissingCase = mongoose.model<IMissingCase>('MissingCase', MissingCaseSchema);
