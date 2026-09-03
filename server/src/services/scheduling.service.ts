import type { Habit } from '../types';
import { getDayOfWeek } from './dayBoundary.service';

/**
 * Determines if a habit is scheduled on a given logical date.
 */
export function isHabitScheduledForDate(habit: Habit, logicalDate: string): boolean {
  const dayOfWeek = getDayOfWeek(logicalDate);

  // Ensure the date is on or after the habit start date
  if (logicalDate < habit.startDate) return false;

  switch (habit.schedule.type) {
    case 'daily':
      return true;

    case 'specific_days':
      return habit.schedule.days.includes(dayOfWeek as any);

    case 'times_per_week':
      return true; // Flexible — every day is potentially schedulable

    default:
      return false;
  }
}
