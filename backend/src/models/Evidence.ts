import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  caseId: mongoose.Types.ObjectId;
  sightingId?: mongoose.Types.ObjectId;
  type: 'image' | 'document' | 'voice' | 'video';
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  extractedText?: string;
  extractedMetadata?: Record<string, any>;
  accessLevel: 'investigator_only' | 'family_viewable' | 'public_redacted';
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', required: true, index: true },
    sightingId: { type: Schema.Types.ObjectId, ref: 'Sighting', index: true },
    type: {
      type: String,
      enum: ['image', 'document', 'voice', 'video'],
      required: true,
      index: true,
    },
    storageKey: { type: String, required: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    extractedText: { type: String },
    extractedMetadata: { type: Schema.Types.Mixed, default: {} },
    accessLevel: {
      type: String,
      enum: ['investigator_only', 'family_viewable', 'public_redacted'],
      default: 'investigator_only',
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
