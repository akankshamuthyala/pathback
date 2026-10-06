import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'NEW_SIGHTING' | 'AI_LEAD_GENERATED' | 'LEAD_REVIEW_COMPLETED' | 'CONSENT_UPDATE' | 'SECURE_MESSAGE' | 'SECURITY_ALERT';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'NEW_SIGHTING',
        'AI_LEAD_GENERATED',
        'LEAD_REVIEW_COMPLETED',
        'CONSENT_UPDATE',
        'SECURE_MESSAGE',
        'SECURITY_ALERT',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
