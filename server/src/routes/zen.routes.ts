import { Router } from 'express';
import { createZenSession, getWeeklyZenSessions, getWeeklyZenTotal } from '../controllers/zen.controller';
import { authenticate } from '../middleware/auth';
import { zenLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.post('/sessions', zenLimiter, createZenSession);
router.get('/sessions/weekly', getWeeklyZenSessions);
router.get('/sessions/weekly-total', getWeeklyZenTotal);

export default router;
