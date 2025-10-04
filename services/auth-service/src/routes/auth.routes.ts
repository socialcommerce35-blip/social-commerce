import { Router } from 'express';
import { sendOTPController, verifyOTPController } from '../controllers/auth.controller';
import { otpRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/send-otp', otpRateLimiter, sendOTPController);
router.post('/verify-otp', verifyOTPController);

export default router;
