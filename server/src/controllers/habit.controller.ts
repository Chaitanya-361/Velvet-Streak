import { Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../data/store';
import { AppError, AuthRequest, Habit } from '../types';

// GET /api/habits
export function getHabits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habits = store.findHabitsByUser(req.user!._id);
    res.json({ success: true, data: habits });
  } catch (err) { next(err); }
}

// GET /api/habits/:id
export function getHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = store.findHabitById(req.params.id);
    if (!habit || habit.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// POST /api/habits
export function createHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const {
      name, icon, color, category, description, habitType,
      quantitative, schedule, restDayConfig, startDate,
    } = req.body;

    const existingHabits = store.findHabitsByUser(userId);
    const now = new Date().toISOString();

    const habit: Habit = {
      _id: uuid(),
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
      sortOrder: existingHabits.length,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInLogicalDate: null,
      createdAt: now,
      updatedAt: now,
    };

    store.habits.push(habit);
    res.status(201).json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// PATCH /api/habits/:id
export function updateHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = store.findHabitById(req.params.id);
    if (!habit || habit.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const allowed = ['name', 'icon', 'color', 'category', 'description', 'schedule', 'restDayConfig', 'quantitative'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (habit as any)[key] = req.body[key];
      }
    }
    habit.updatedAt = new Date().toISOString();

    res.json({ success: true, data: habit });
  } catch (err) { next(err); }
}

// DELETE /api/habits/:id
export function deleteHabit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = store.findHabitById(req.params.id);
    if (!habit || habit.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    store.deleteHabitCascade(habit._id);
    res.json({ success: true, data: { message: 'Habit deleted' } });
  } catch (err) { next(err); }
}

// PATCH /api/habits/reorder
export function reorderHabits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { order } = req.body; // [{ habitId, sortOrder }]
    if (!Array.isArray(order)) throw new AppError('VALIDATION_ERROR', 422, 'order must be an array');

    for (const { habitId, sortOrder } of order) {
      const habit = store.findHabitById(habitId);
      if (habit && habit.userId === req.user!._id) {
        habit.sortOrder = sortOrder;
      }
    }

    const habits = store.findHabitsByUser(req.user!._id);
    res.json({ success: true, data: habits });
  } catch (err) { next(err); }
}

// GET /api/habits/:id/calendar?month=2026-05
export function getHabitCalendar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const habit = store.findHabitById(req.params.id);
    if (!habit || habit.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const checkIns = store.findCheckIns({ habitId: habit._id })
      .filter(c => c.logicalDate.startsWith(month));
    const restDays = store.findRestDays({ habitId: habit._id })
      .filter(r => r.logicalDate.startsWith(month));

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
