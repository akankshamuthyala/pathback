import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  name: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  isPhoneVerified: boolean;
  status: 'active' | 'suspended' | 'flagged';
  organizationName?: string;
  badgeNumber?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['public_reporter', 'family_member', 'investigator', 'verified_org', 'admin'],
      default: 'public_reporter',
      required: true,
      index: true,
    },
    isPhoneVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'suspended', 'flagged'],
      default: 'active',
      index: true,
    },
    organizationName: { type: String, trim: true },
    badgeNumber: { type: String, trim: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
