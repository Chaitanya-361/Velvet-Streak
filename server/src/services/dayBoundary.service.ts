/**
 * Day boundary service — determines the "logical day" for a user
 * based on their configured boundary time and timezone.
 * 
 * For now: simplified implementation using UTC offsets.
 * When date-fns-tz is added, this will use proper timezone conversion.
 */

interface UserPrefs {
  timezone: string;
  dayBoundaryTime: string; // "HH:MM"
}

/**
 * Returns the current logical date label (YYYY-MM-DD) for a user.
 * A "logical day" starts at the user's dayBoundaryTime in their timezone.
 */
export function getCurrentLogicalDate(prefs: UserPrefs, nowUtc: Date = new Date()): string {
  // Simplified: assume server local time ≈ user timezone for dev
  // In production with MongoDB, this will use date-fns-tz properly
  const [boundaryHour, boundaryMin] = prefs.dayBoundaryTime.split(':').map(Number);
  const localNow = nowUtc;

  const todayBoundary = new Date(localNow);
  todayBoundary.setHours(boundaryHour, boundaryMin, 0, 0);

  let logicalDate: Date;
  if (localNow < todayBoundary) {
    // Before boundary → still "yesterday"
    logicalDate = new Date(localNow);
    logicalDate.setDate(logicalDate.getDate() - 1);
  } else {
    logicalDate = new Date(localNow);
  }

  return formatDate(logicalDate);
}

/**
 * Returns the logical day window [start, end) in UTC.
 */
export function getLogicalDayWindow(prefs: UserPrefs, nowUtc: Date = new Date()): { start: Date; end: Date } {
  const logicalDate = getCurrentLogicalDate(prefs, nowUtc);
  const [boundaryHour, boundaryMin] = prefs.dayBoundaryTime.split(':').map(Number);

  const start = new Date(logicalDate);
  start.setHours(boundaryHour, boundaryMin, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function getPreviousLogicalDate(prefs: UserPrefs, nowUtc: Date = new Date()): string {
  const current = getCurrentLogicalDate(prefs, nowUtc);
  const d = new Date(current);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getISOWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getDayOfWeek(dateStr: string): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(dateStr).getDay()];
}
