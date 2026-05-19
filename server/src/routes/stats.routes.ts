import { Router } from 'express';
import { getDashboard, getWeeklyStats, getHeatmap } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/weekly', getWeeklyStats);
router.get('/heatmap', getHeatmap);

export default router;
