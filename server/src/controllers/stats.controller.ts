import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate, formatDate, getISOWeekLabel, getDayOfWeek } from '../services/dayBoundary.service';
import { isHabitScheduledForDate } from '../services/scheduling.service';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';

// GET /api/stats/dashboard
export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    
    const logicalDate = getCurrentLogicalDate(user.preferences);
    const habits = await Habit.find({ userId });
    const checkIns = await CheckIn.find({ userId, logicalDate });

    // Determine today's status for each habit
    const habitStatuses = habits.map(habit => {
      const isScheduled = isHabitScheduledForDate(habit.toObject() as any, logicalDate);
      const todayCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());

      let todayStatus: string;
      if (!isScheduled) {
        todayStatus = 'not_scheduled';
      } else if (todayCheckIns.length > 0) {
        todayStatus = 'completed';
      } else {
        todayStatus = 'pending';
      }

      return {
        ...habit.toObject(),
        todayStatus,
        todayProgress: todayCheckIns.length,
        todayCheckInId: todayCheckIns.length > 0 ? todayCheckIns[0]._id : null,
        weeklyProgress: 0,
      };
    });

    res.json({
      success: true,
      data: {
        logicalDate,
        habits: habitStatuses,
        userXP: user.xp,
        userLevel: user.level,
      },
    });
  } catch (err) { next(err); }
}

/**
 * Returns the date range [startDate, endDate] for a given ISO week label.
 * The week starts on Monday.
 */
function getWeekDateRange(weekLabel: string): { start: string; end: string } {
  const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return { start: '', end: '' };
  
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  
  // Find the Monday of the given ISO week
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
}

/**
 * Returns the number of days a habit is expected to be completed in a week.
 */
function getWeeklyExpected(habit: any): number {
  switch (habit.schedule.type) {
    case 'daily':
      return 7;
    case 'specific_days':
      return habit.schedule.days?.length || 0;
    case 'times_per_week':
      return habit.schedule.timesPerWeek || 3;
    default:
      return 7;
  }
}

// GET /api/stats/weekly?weekOffset=0
export async function getWeeklyStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    const weekOffset = parseInt((req.query.weekOffset as string) || '0', 10);

    // Calculate the target week
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - (7 * weekOffset));
    const targetLogical = formatDate(targetDate);
    const targetWeek = getISOWeekLabel(targetLogical);

    // Get the date range for efficient querying
    const { start: weekStart, end: weekEnd } = getWeekDateRange(targetWeek);
    const prevWeek = getISOWeekLabel(formatDate(new Date(targetDate.getTime() - 7 * 86400000)));
    const { start: prevWeekStart, end: prevWeekEnd } = getWeekDateRange(prevWeek);

    const habits = await Habit.find({ userId });

    // Fetch only the check-ins we need (current + previous week)
    const relevantCheckIns = await CheckIn.find({
      userId,
      logicalDate: { $gte: prevWeekStart, $lte: weekEnd },
    });

    const weekCheckIns = relevantCheckIns.filter(c => c.logicalDate >= weekStart && c.logicalDate <= weekEnd);
    const prevCheckIns = relevantCheckIns.filter(c => c.logicalDate >= prevWeekStart && c.logicalDate <= prevWeekEnd);

    let totalExpected = 0;
    let totalCompleted = 0;

    const perHabit = habits.map(habit => {
      const expected = getWeeklyExpected(habit);
      const done = weekCheckIns.filter(c => c.habitId.toString() === habit._id.toString()).length;
      totalExpected += expected;
      totalCompleted += Math.min(done, expected);

      return {
        habitId: habit._id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        completionRate: expected > 0 ? Math.round((Math.min(done, expected) / expected) * 100) : 0,
        checkInsDone: done,
        checkInsExpected: expected,
      };
    });

    const consistencyScore = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
    const perfectHabits = perHabit.filter(h => h.completionRate >= 100).length;
    const totalXP = weekCheckIns.reduce((sum, c) => sum + c.xpAwarded, 0);

    // Previous week score
    let prevTotalExpected = 0;
    let prevTotalCompleted = 0;
    for (const habit of habits) {
      const expected = getWeeklyExpected(habit);
      const done = prevCheckIns.filter(c => c.habitId.toString() === habit._id.toString()).length;
      prevTotalExpected += expected;
      prevTotalCompleted += Math.min(done, expected);
    }
    const prevScore = prevTotalExpected > 0 ? Math.round((prevTotalCompleted / prevTotalExpected) * 100) : 0;

    res.json({
      success: true,
      data: {
        weekLabel: targetWeek,
        consistencyScore,
        prevScore,
        totalCheckIns: weekCheckIns.length,
        perfectHabits,
        totalXP,
        perHabit: perHabit.sort((a, b) => a.completionRate - b.completionRate),
      },
    });
  } catch (err) { next(err); }
}

// GET /api/stats/heatmap?year=2026
export async function getHeatmap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);

    // Use string range comparison — more reliable than regex and index-friendly
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year + 1}-01-01`;
    const yearCheckIns = await CheckIn.find({
      userId,
      logicalDate: { $gte: yearStart, $lt: yearEnd },
    });

    // Group by date
    const dateMap = new Map<string, number>();
    for (const ci of yearCheckIns) {
      dateMap.set(ci.logicalDate, (dateMap.get(ci.logicalDate) || 0) + 1);
    }

    const data = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data });
  } catch (err) { next(err); }
}
