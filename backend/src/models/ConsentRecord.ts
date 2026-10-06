import mongoose, { Schema, Document } from 'mongoose';
import { ConsentStatus } from '../types';

export interface IConsentRecord extends Document {
  caseId: mongoose.Types.ObjectId;
  status: ConsentStatus;
  sharedWith: string[];
  scope: string;
  reason: string;
  grantedBy?: string;
  consentFormStorageKey?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', required: true, index: true },
    status: {
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
      required: true,
      index: true,
    },
    sharedWith: [{ type: String }],
    scope: { type: String, required: true },
    reason: { type: String, required: true },
    grantedBy: { type: String },
    consentFormStorageKey: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ConsentRecord = mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
