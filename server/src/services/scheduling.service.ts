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

    case 'interval': {
      const startMs = new Date(habit.startDate).getTime();
      const dateMs = new Date(logicalDate).getTime();
      const diffDays = Math.round((dateMs - startMs) / 86400000);
      return diffDays >= 0 && (habit.schedule.intervalDays ? diffDays % habit.schedule.intervalDays === 0 : false);
    }

    case 'times_per_week':
    case 'times_per_month':
    case 'times_per_day':
      return true; // Flexible — every day is potentially schedulable

    default:
      return false;
  }
}
