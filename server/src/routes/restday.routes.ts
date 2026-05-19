import { Router } from 'express';
import { createRestDay, undoRestDay } from '../controllers/restday.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/', createRestDay);
router.delete('/:id', undoRestDay);

export default router;
