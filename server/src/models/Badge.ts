import mongoose, { Schema, Document } from 'mongoose';
import { Badge as IBadge } from '../types';

export interface IBadgeDocument extends IBadge, Document {}

const BadgeSchema = new Schema<IBadgeDocument>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    unlockCondition: { type: String, required: true },
    triggerKey: { type: String, required: true },
    xpReward: { type: Number, required: true },
  },
  { timestamps: false }
);

export const Badge = mongoose.model<IBadgeDocument>('Badge', BadgeSchema);
