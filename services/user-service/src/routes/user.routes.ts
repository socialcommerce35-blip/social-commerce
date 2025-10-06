import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getUserProfileController, updateUserProfileController } from '../controllers/user.controller';

const router = Router();

// Only fetch profile
router.get('/profile', authenticate, getUserProfileController);

// Single update endpoint - Handle profile creation also
router.put('/profile', authenticate, updateUserProfileController);

export default router;
