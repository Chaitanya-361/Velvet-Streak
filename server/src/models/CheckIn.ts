import mongoose, { Schema, Document } from 'mongoose';
import { CheckIn as ICheckIn } from '../types';

export interface ICheckInDocument extends Omit<ICheckIn, '_id'>, Document {}

const CheckInSchema = new Schema<ICheckInDocument>(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: String, required: true, index: true },
    logicalDate: { type: String, required: true },
    slotIndex: { type: Number, required: true },
    amount: { type: Number, default: null },
    note: { type: String, default: null },
    xpAwarded: { type: Number, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const CheckIn = mongoose.model<ICheckInDocument>('CheckIn', CheckInSchema);
