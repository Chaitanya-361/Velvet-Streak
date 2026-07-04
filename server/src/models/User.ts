import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badgesEarned: [
      {
        badgeKey: { type: String, required: true },
        earnedAt: { type: String, required: true },
      },
    ],
    preferences: {
      timezone: { type: String, default: 'UTC' },
      dayBoundaryTime: { type: String, default: '00:00' },
      weekStartDay: { type: String, enum: ['MON', 'SUN'], default: 'MON' },
    },
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        device: { type: String, required: true },
        createdAt: { type: String, required: true },
        expiresAt: { type: String, required: true },
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpiry: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: String, default: null },
    deletionRequestedAt: { type: String, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const User = mongoose.model<IUserDocument>('User', UserSchema);
