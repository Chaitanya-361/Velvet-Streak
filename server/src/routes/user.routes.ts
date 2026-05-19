import { Router } from 'express';
import { getProfile, updateProfile, updateSettings, getBadges, exportData, deleteAccount } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/settings', updateSettings);
router.get('/badges', getBadges);
router.get('/export', exportData);
router.delete('/account', deleteAccount);

export default router;
