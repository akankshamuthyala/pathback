import mongoose, { Schema, Document } from 'mongoose';

export interface ISecureMessage extends Document {
  caseId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  recipientRole?: string;
  message: string;
  visibility: 'investigator_only' | 'family_and_investigator' | 'all_authorized';
  hasRedactedContactInfo: boolean;
  createdAt: Date;
}

const SecureMessageSchema = new Schema<ISecureMessage>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'MissingCase', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String },
    message: { type: String, required: true },
    visibility: {
      type: String,
      enum: ['investigator_only', 'family_and_investigator', 'all_authorized'],
      default: 'family_and_investigator',
    },
    hasRedactedContactInfo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SecureMessage = mongoose.model<ISecureMessage>('SecureMessage', SecureMessageSchema);
