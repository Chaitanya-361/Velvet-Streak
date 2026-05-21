import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate, formatDate, getISOWeekLabel, getDayOfWeek } from '../services/dayBoundary.service';
import { isHabitScheduledForDate } from '../services/scheduling.service';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';
import { RestDay } from '../models/RestDay';

// GET /api/stats/dashboard
export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    
    const logicalDate = getCurrentLogicalDate(user.preferences);
    const habits = await Habit.find({ userId });
    
    const checkIns = await CheckIn.find({ userId, logicalDate });
    const restDays = await RestDay.find({ userId, logicalDate });

    // Determine today's status for each habit
    const habitStatuses = habits.map(habit => {
      const isScheduled = isHabitScheduledForDate(habit.toObject() as any, logicalDate);
      const todayCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());
      const todayRestDay = restDays.some(r => r.habitId.toString() === habit._id.toString());

      let todayStatus: string;
      if (!isScheduled) {
        todayStatus = 'not_scheduled';
      } else if (todayRestDay) {
        todayStatus = 'rest_day';
      } else if (todayCheckIns.length > 0) {
        todayStatus = 'completed';
      } else {
        todayStatus = 'pending';
      }

      // We need weekly check-ins for quantitative progress. 
      // This is a naive way for now, ideally fetch in bulk before mapping.
      // We will leave weeklyProgress to be fetched separately if needed or just return 0 for now to optimize,
      // but let's fetch week checkins if quantitative.
      return {
        ...habit.toObject(),
        todayStatus,
        todayProgress: todayCheckIns.length,
        weeklyProgress: 0, // Simplified to avoid N+1 queries. Can be enhanced later.
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

// GET /api/stats/weekly?weekOffset=0
export async function getWeeklyStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    const weekOffset = parseInt((req.query.weekOffset as string) || '0', 10);

    // Calculate the week start date
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - (7 * weekOffset));
    const targetLogical = formatDate(targetDate);
    const targetWeek = getISOWeekLabel(targetLogical);

    const habits = await Habit.find({ userId });
    // This requires a full table scan or index on logicalDate since we map it in code. 
    // We can use a regex for the week or just fetch all for the user and filter.
    const allCheckIns = await CheckIn.find({ userId });
    const weekCheckIns = allCheckIns.filter(c => getISOWeekLabel(c.logicalDate) === targetWeek);

    let totalExpected = 0;
    let totalCompleted = 0;

    const perHabit = habits.map(habit => {
      // Count expected check-ins for this week (simplified: based on schedule type)
      let expected = 0;
      switch (habit.schedule.type) {
        case 'daily': expected = 7; break;
        case 'specific_days': expected = habit.schedule.days.length; break;
        case 'times_per_week': expected = habit.schedule.timesPerWeek || 3; break;
        case 'times_per_day': expected = 7 * habit.schedule.timesPerDay; break;
        default: expected = 7;
      }

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

    // Previous week for comparison
    const prevDate = new Date(targetDate);
    prevDate.setDate(prevDate.getDate() - 7);
    const prevWeek = getISOWeekLabel(formatDate(prevDate));
    const prevCheckIns = allCheckIns.filter(c => getISOWeekLabel(c.logicalDate) === prevWeek);
    const prevCompleted = Math.min(prevCheckIns.length, totalExpected);
    const prevScore = totalExpected > 0 ? Math.round((prevCompleted / totalExpected) * 100) : 0;

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

    const regex = new RegExp(`^${year}`);
    const yearCheckIns = await CheckIn.find({ userId, logicalDate: { $regex: regex } });

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
