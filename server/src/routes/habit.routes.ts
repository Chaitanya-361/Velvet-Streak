import { Router } from 'express';
import { getHabits, getHabit, createHabit, updateHabit, deleteHabit, reorderHabits, getHabitCalendar } from '../controllers/habit.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/reorder', reorderHabits);
router.get('/:id', getHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.get('/:id/calendar', getHabitCalendar);

export default router;
