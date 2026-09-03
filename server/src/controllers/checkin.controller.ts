import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate, formatDate } from '../services/dayBoundary.service';
import { isHabitScheduledForDate } from '../services/scheduling.service';
import { awardXP, checkBadges } from '../services/gamification.service';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';

const BASE_CHECKIN_XP = 10;

// POST /api/checkins
export async function createCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const { habitId, amount, note } = req.body;

    const habit = await Habit.findById(habitId);
    if (!habit || habit.userId.toString() !== userId) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const logicalDate = getCurrentLogicalDate(user.preferences);

    // Check not already checked in today
    const existing = await CheckIn.findOne({ habitId, logicalDate });
    if (existing) {
      throw new AppError('CONFLICT', 409, 'Already checked in for today');
    }

    // Ensure scheduled
    if (!isHabitScheduledForDate(habit.toObject() as any, logicalDate)) {
      throw new AppError('BAD_REQUEST', 400, 'Habit is not scheduled for today');
    }

    // Create check-in
    const checkIn = new CheckIn({
      userId,
      habitId,
      logicalDate,
      amount: habit.habitType === 'quantitative' ? (amount ?? null) : null,
      note: note || null,
      xpAwarded: BASE_CHECKIN_XP,
      createdAt: new Date().toISOString(),
    });

    await checkIn.save();

    const prevLastCheckIn = habit.lastCheckInLogicalDate;

    // Update habit stats
    habit.totalCheckIns++;
    habit.updatedAt = new Date().toISOString();

    let streakBroken = false;
    let sameDay = false;

    if (prevLastCheckIn) {
      if (prevLastCheckIn === logicalDate) {
        sameDay = true;
      } else {
        const prevDate = new Date(prevLastCheckIn);
        const currDate = new Date(logicalDate);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays > 1) {
          let scheduledDayFound = false;
          for (let i = 1; i < diffDays; i++) {
            const d = new Date(prevDate.getTime() + i * 86400000);
            if (isHabitScheduledForDate(habit.toObject() as any, formatDate(d))) {
              scheduledDayFound = true;
              break;
            }
          }
          if (scheduledDayFound) {
            streakBroken = true;
          }
        }
      }
    }

    if (!prevLastCheckIn) {
      habit.currentStreak = 1;
    } else if (sameDay) {
      // do not increment streak again for multiple check-ins today
    } else if (streakBroken) {
      habit.currentStreak = 1;
    } else {
      habit.currentStreak++;
    }

    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }

    habit.lastCheckInLogicalDate = logicalDate;
    await habit.save();

    // Award XP
    const xpResult = await awardXP(userId, BASE_CHECKIN_XP);
    const newBadges = await checkBadges(userId);

    res.status(201).json({
      success: true,
      data: {
        checkIn,
        xpAwarded: BASE_CHECKIN_XP,
        levelledUp: xpResult.levelledUp,
        newLevel: xpResult.newLevel,
        newBadges,
        currentStreak: habit.currentStreak,
      },
    });
  } catch (err) { next(err); }
}

// GET /api/checkins?habitId=xxx&from=2026-05-01&to=2026-05-18
export async function getCheckIns(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const query: any = { userId };

    if (req.query.habitId) {
      query.habitId = req.query.habitId;
    }
    if (req.query.from || req.query.to) {
      query.logicalDate = {};
      if (req.query.from) query.logicalDate.$gte = req.query.from;
      if (req.query.to) query.logicalDate.$lte = req.query.to;
    }

    const results = await CheckIn.find(query).sort({ logicalDate: -1 });
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}

// PATCH /api/checkins/:id/note
export async function updateNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const checkIn = await CheckIn.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!checkIn) throw new AppError('NOT_FOUND', 404, 'Check-in not found');

    checkIn.note = req.body.note || null;
    await checkIn.save();
    res.json({ success: true, data: checkIn });
  } catch (err) { next(err); }
}

// DELETE /api/checkins/:id  (undo)
export async function undoCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    
    const checkIn = await CheckIn.findOne({ _id: req.params.id, userId });
    if (!checkIn) throw new AppError('NOT_FOUND', 404, 'Check-in not found');

    // Remove XP
    const user = await User.findById(userId);
    if (user) {
      user.xp = Math.max(0, user.xp - checkIn.xpAwarded);
      await user.save();
    }

    // Decrement habit stats
    const habit = await Habit.findById(checkIn.habitId);
    if (habit) {
      habit.totalCheckIns = Math.max(0, habit.totalCheckIns - 1);
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
      await habit.save();
    }

    await CheckIn.findByIdAndDelete(checkIn._id);
    res.json({ success: true, data: { message: 'Check-in undone' } });
  } catch (err) { next(err); }
}
