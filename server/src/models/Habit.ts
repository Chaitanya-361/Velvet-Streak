import mongoose, { Schema, Document } from 'mongoose';
import { Habit as IHabit } from '../types';

export interface IHabitDocument extends Omit<IHabit, '_id'>, Document {}

const HabitSchema = new Schema<IHabitDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    category: {
      type: String,
      enum: ['Fitness', 'Creative', 'Learning', 'Wellness', 'Social', 'Other'],
      required: true,
    },
    description: { type: String, default: '' },
    habitType: { type: String, enum: ['binary', 'quantitative'], required: true },
    quantitative: {
      targetUnit: { type: String },
      weeklyTarget: { type: Number },
    },
    schedule: {
      type: {
        type: String,
        enum: ['daily', 'specific_days', 'times_per_week', 'interval', 'times_per_day', 'times_per_month'],
        required: true,
      },
      days: [{ type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] }],
      timesPerDay: { type: Number },
      timeWindows: [
        {
          label: { type: String },
          windowStart: { type: String },
          windowEnd: { type: String },
        },
      ],
      intervalDays: { type: Number, default: null },
      timesPerWeek: { type: Number, default: null },
      timesPerMonth: { type: Number, default: null },
    },
    restDayConfig: {
      allowed: { type: Boolean, required: true },
      maxPerWeek: { type: Number, default: null },
    },
    sortOrder: { type: Number, required: true },
    startDate: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    lastCheckInLogicalDate: { type: String, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const Habit = mongoose.model<IHabitDocument>('Habit', HabitSchema);
