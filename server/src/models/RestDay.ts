import mongoose, { Schema, Document } from 'mongoose';
import { RestDay as IRestDay } from '../types';

export interface IRestDayDocument extends Omit<IRestDay, '_id'>, Document {}

const RestDaySchema = new Schema<IRestDayDocument>(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: String, required: true, index: true },
    logicalDate: { type: String, required: true },
    weekLabel: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const RestDay = mongoose.model<IRestDayDocument>('RestDay', RestDaySchema);
