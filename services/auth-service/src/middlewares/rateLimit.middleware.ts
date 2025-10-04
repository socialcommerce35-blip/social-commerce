import { Request, Response, NextFunction } from 'express';
import { countOTPsLastHour } from '../repositories/otp.repository';
import { sendError } from '../utils/responseHandler';

const MAX_OTP_PER_HOUR = 5;

export const otpRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const { mobile } = req.body;
    if (!mobile) return sendError(res, 'Mobile number is required', 400);

    const otpCount = await countOTPsLastHour(mobile);
    if (otpCount >= MAX_OTP_PER_HOUR) return sendError(res, 'OTP request limit reached. Try after some time.', 429);

    next();
};