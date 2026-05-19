import { Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate } from '../services/dayBoundary.service';
import { isHabitScheduledForDate } from '../services/scheduling.service';
import { awardXP, checkBadges } from '../services/gamification.service';

const BASE_CHECKIN_XP = 10;

// POST /api/checkins
export function createCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = store.findUserById(userId)!;
    const { habitId, slotIndex, amount, note } = req.body;

    const habit = store.findHabitById(habitId);
    if (!habit || habit.userId !== userId) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const logicalDate = getCurrentLogicalDate(user.preferences);

    // Check not already checked in for this slot
    const existing = store.findCheckIns({ habitId, logicalDate });
    const slotIdx = slotIndex || 0;
    if (existing.some(c => c.slotIndex === slotIdx)) {
      throw new AppError('CONFLICT', 409, 'Already checked in for this slot today');
    }

    // Ensure scheduled
    if (!isHabitScheduledForDate(habit, logicalDate)) {
      throw new AppError('BAD_REQUEST', 400, 'Habit is not scheduled for today');
    }

    // Create check-in
    const checkIn = {
      _id: uuid(),
      userId,
      habitId,
      logicalDate,
      slotIndex: slotIdx,
      amount: habit.habitType === 'quantitative' ? (amount ?? null) : null,
      note: note || null,
      xpAwarded: BASE_CHECKIN_XP,
      createdAt: new Date().toISOString(),
    };

    store.checkIns.push(checkIn);

    // Update habit stats
    habit.totalCheckIns++;
    habit.lastCheckInLogicalDate = logicalDate;
    habit.updatedAt = new Date().toISOString();

    // Update streak (simplified)
    if (!habit.lastCheckInLogicalDate || logicalDate >= habit.lastCheckInLogicalDate) {
      habit.currentStreak++;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    }

    // Award XP
    const xpResult = awardXP(userId, BASE_CHECKIN_XP);
    const newBadges = checkBadges(userId);

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
export function getCheckIns(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    let results = store.checkIns.filter(c => c.userId === userId);

    if (req.query.habitId) {
      results = results.filter(c => c.habitId === req.query.habitId);
    }
    if (req.query.from) {
      results = results.filter(c => c.logicalDate >= (req.query.from as string));
    }
    if (req.query.to) {
      results = results.filter(c => c.logicalDate <= (req.query.to as string));
    }

    results.sort((a, b) => b.logicalDate.localeCompare(a.logicalDate));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}

// PATCH /api/checkins/:id/note
export function updateNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const checkIn = store.checkIns.find(c => c._id === req.params.id && c.userId === req.user!._id);
    if (!checkIn) throw new AppError('NOT_FOUND', 404, 'Check-in not found');

    checkIn.note = req.body.note || null;
    res.json({ success: true, data: checkIn });
  } catch (err) { next(err); }
}

// DELETE /api/checkins/:id  (undo)
export function undoCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const idx = store.checkIns.findIndex(c => c._id === req.params.id && c.userId === userId);
    if (idx === -1) throw new AppError('NOT_FOUND', 404, 'Check-in not found');

    const checkIn = store.checkIns[idx];

    // Remove XP
    const user = store.findUserById(userId)!;
    user.xp = Math.max(0, user.xp - checkIn.xpAwarded);

    // Decrement habit stats
    const habit = store.findHabitById(checkIn.habitId);
    if (habit) {
      habit.totalCheckIns = Math.max(0, habit.totalCheckIns - 1);
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    }

    store.checkIns.splice(idx, 1);
    res.json({ success: true, data: { message: 'Check-in undone' } });
  } catch (err) { next(err); }
}
