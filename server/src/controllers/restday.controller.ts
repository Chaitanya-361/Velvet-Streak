import { Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate, getISOWeekLabel } from '../services/dayBoundary.service';

// POST /api/restdays
export function createRestDay(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = store.findUserById(userId)!;
    const { habitId } = req.body;

    const habit = store.findHabitById(habitId);
    if (!habit || habit.userId !== userId) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    if (!habit.restDayConfig.allowed) {
      throw new AppError('BAD_REQUEST', 400, 'Rest days not allowed for this habit');
    }

    const logicalDate = getCurrentLogicalDate(user.preferences);
    const weekLabel = getISOWeekLabel(logicalDate);

    // Check weekly budget
    const weekRestDays = store.findRestDays({ habitId }).filter(r => r.weekLabel === weekLabel);
    if (habit.restDayConfig.maxPerWeek !== null && weekRestDays.length >= habit.restDayConfig.maxPerWeek) {
      throw new AppError('BAD_REQUEST', 400, `Rest day budget (${habit.restDayConfig.maxPerWeek}/week) exhausted`);
    }

    // Check no duplicate
    if (store.findRestDays({ habitId, logicalDate }).length > 0) {
      throw new AppError('CONFLICT', 409, 'Rest day already marked for today');
    }

    const restDay = {
      _id: uuid(),
      userId,
      habitId,
      logicalDate,
      weekLabel,
      createdAt: new Date().toISOString(),
    };

    store.restDays.push(restDay);

    res.status(201).json({
      success: true,
      data: {
        restDay,
        weeklyUsed: weekRestDays.length + 1,
        weeklyBudget: habit.restDayConfig.maxPerWeek,
      },
    });
  } catch (err) { next(err); }
}

// DELETE /api/restdays/:id
export function undoRestDay(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = store.restDays.findIndex(r => r._id === req.params.id && r.userId === req.user!._id);
    if (idx === -1) throw new AppError('NOT_FOUND', 404, 'Rest day not found');

    store.restDays.splice(idx, 1);
    res.json({ success: true, data: { message: 'Rest day undone' } });
  } catch (err) { next(err); }
}
