export type HabitType = 'binary' | 'quantitative';
export type HabitCategory = 'Fitness' | 'Creative' | 'Learning' | 'Wellness' | 'Social' | 'Other';
export type ScheduleType = 'daily' | 'specific_days' | 'times_per_week' | 'interval' | 'times_per_day' | 'times_per_month';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type TodoPriority = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  xp: number;
  level: number;
  badgesEarned: { badgeKey: string; earnedAt: string }[];
  preferences: {
    timezone: string;
    dayBoundaryTime: string;
    weekStartDay: 'MON' | 'SUN';
  };
  refreshTokens: { tokenHash: string; device: string; createdAt: string; expiresAt: string }[];
  isEmailVerified: boolean;
  emailVerifyToken: string | null;
  emailVerifyExpiry: string | null;
  passwordResetToken: string | null;
  passwordResetExpiry: string | null;
  deletionRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  type: ScheduleType;
  days: DayOfWeek[];
  timesPerDay: number;
  timeWindows: { label: string; windowStart: string; windowEnd: string }[];
  intervalDays: number | null;
  timesPerWeek: number | null;
  timesPerMonth: number | null;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  description: string;
  habitType: HabitType;
  quantitative: { targetUnit: string; weeklyTarget: number } | null;
  schedule: Schedule;
  restDayConfig: { allowed: boolean; maxPerWeek: number | null };
  sortOrder: number;
  startDate: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInLogicalDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  _id: string;
  userId: string;
  habitId: string;
  logicalDate: string;
  slotIndex: number;
  amount: number | null;
  note: string | null;
  xpAwarded: number;
  createdAt: string;
}

export interface RestDay {
  _id: string;
  userId: string;
  habitId: string;
  logicalDate: string;
  weekLabel: string;
  createdAt: string;
}

export interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string | null;
  deadline: string;
  priority: TodoPriority;
  category: string | null;
  subtasks: { id: string; title: string; isCompleted: boolean }[];
  isCompleted: boolean;
  completedAt: string | null;
  xpAwarded: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  triggerKey: string;
  xpReward: number;
}

export interface ZenSession {
  _id: string;
  userId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  logicalDate: string;
  createdAt: string;
}

// Express extension
import { Request } from 'express';
export interface AuthRequest extends Request {
  user?: { _id: string; email: string };
}

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: { field: string; issue: string }[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}
