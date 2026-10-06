import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpChallenge extends Document {
  phoneNumber: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  requestCount: number;
  verifiedAt?: Date;
  createdAt: Date;
}

const OtpChallengeSchema = new Schema<IOtpChallenge>(
  {
    phoneNumber: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-delete on expiry via TTL index
    attempts: { type: Number, default: 0 },
    requestCount: { type: Number, default: 1 },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const OtpChallenge = mongoose.model<IOtpChallenge>('OtpChallenge', OtpChallengeSchema);
