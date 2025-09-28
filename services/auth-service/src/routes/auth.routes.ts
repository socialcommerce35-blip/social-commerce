import { Router } from 'express';
import { loginOrRegister, verifyOtpController, logoutController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login-or-register', loginOrRegister);
router.post('/verify-otp', verifyOtpController);
router.post('/logout', authMiddleware, logoutController);

export default router;
