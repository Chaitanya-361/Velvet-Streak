import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';
import { RestDay } from '../models/RestDay';

// GET /api/habits
export async function getHabits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habits = await Habit.find({ userId: req.user!._id }).sort({ sortOrder: 1 });
    res.json({ success: true, data: habits });
  } catch (err) { next(err); }
}

// GET /api/habits/:id
export async function getHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit || habit.userId.toString() !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// POST /api/habits
export async function createHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const {
      name, icon, color, category, description, habitType,
      quantitative, schedule, restDayConfig, startDate,
    } = req.body;

    const existingHabitsCount = await Habit.countDocuments({ userId });
    const now = new Date().toISOString();

    const habit = new Habit({
      userId,
      name,
      icon: icon || '🎯',
      color: color || '#00838F',
      category: category || 'Other',
      description: description || '',
      habitType: habitType || 'binary',
      quantitative: habitType === 'quantitative' ? quantitative : null,
      schedule: {
        type: schedule?.type || 'daily',
        days: schedule?.days || [],
        timesPerDay: schedule?.timesPerDay || 1,
        timeWindows: schedule?.timeWindows || [],
        intervalDays: schedule?.intervalDays || null,
        timesPerWeek: schedule?.timesPerWeek || null,
        timesPerMonth: schedule?.timesPerMonth || null,
      },
      restDayConfig: {
        allowed: restDayConfig?.allowed ?? false,
        maxPerWeek: restDayConfig?.maxPerWeek ?? null,
      },
      sortOrder: existingHabitsCount,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInLogicalDate: null,
      createdAt: now,
      updatedAt: now,
    });

    await habit.save();
    res.status(201).json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// PATCH /api/habits/:id
export async function updateHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit || habit.userId.toString() !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const allowed = ['name', 'icon', 'color', 'category', 'description', 'schedule', 'restDayConfig', 'quantitative'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (habit as any)[key] = req.body[key];
        habit.markModified(key); // Just in case it's nested
      }
    }
    habit.updatedAt = new Date().toISOString();
    await habit.save();

    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// DELETE /api/habits/:id
export async function deleteHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit || habit.userId.toString() !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    
    // Cascade delete
    await CheckIn.deleteMany({ habitId: habit._id.toString() });
    await RestDay.deleteMany({ habitId: habit._id.toString() });
    await Habit.findByIdAndDelete(habit._id);

    res.json({ success: true, data: { message: 'Habit deleted' } });
  } catch (err) { next(err); }
}

// PATCH /api/habits/reorder
export async function reorderHabits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { order } = req.body; // [{ habitId, sortOrder }]
    if (!Array.isArray(order)) throw new AppError('VALIDATION_ERROR', 422, 'order must be an array');

    const bulkOps = order.map(({ habitId, sortOrder }) => ({
      updateOne: {
        filter: { _id: habitId, userId: req.user!._id },
        update: { $set: { sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await Habit.bulkWrite(bulkOps);
    }

    const habits = await Habit.find({ userId: req.user!._id }).sort({ sortOrder: 1 });
    res.json({ success: true, data: habits });
  } catch (err) { next(err); }
}

// GET /api/habits/:id/calendar?month=2026-05
export async function getHabitCalendar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit || habit.userId.toString() !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const regex = new RegExp(`^${month}`);

    const checkIns = await CheckIn.find({ habitId: habit._id.toString(), logicalDate: { $regex: regex } });
    const restDays = await RestDay.find({ habitId: habit._id.toString(), logicalDate: { $regex: regex } });

    const checkedDates = new Set(checkIns.map(c => c.logicalDate));
    const restDates = new Set(restDays.map(r => r.logicalDate));

    res.json({
      success: true,
      data: {
        month,
        checkInDates: [...checkedDates],
        restDayDates: [...restDates],
        checkIns,
        restDays,
      },
    });
  } catch (err) { next(err); }
}
