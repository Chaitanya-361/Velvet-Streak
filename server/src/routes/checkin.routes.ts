import { Router } from 'express';
import { createCheckIn, getCheckIns, updateNote, undoCheckIn } from '../controllers/checkin.controller';
import { authenticate } from '../middleware/auth';
import { checkinLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.post('/', checkinLimiter, createCheckIn);
router.get('/', getCheckIns);
router.patch('/:id/note', updateNote);
router.delete('/:id', undoCheckIn);

export default router;
