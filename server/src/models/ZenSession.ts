import mongoose, { Schema, Document } from 'mongoose';
import { ZenSession as IZenSession } from '../types';

export interface IZenSessionDocument extends Omit<IZenSession, '_id'>, Document {}

const ZenSessionSchema = new Schema<IZenSessionDocument>(
  {
    userId: { type: String, required: true, index: true },
    startedAt: { type: String, required: true },
    endedAt: { type: String, required: true },
    durationSeconds: { type: Number, required: true, min: 1 },
    logicalDate: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

// Compound index for efficient weekly queries
ZenSessionSchema.index({ userId: 1, logicalDate: 1 });

export const ZenSession = mongoose.model<IZenSessionDocument>('ZenSession', ZenSessionSchema);
