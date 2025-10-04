import { Request, Response } from 'express';
import { requestOTP, verifyOTP } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/responseHandler';
import logger from '../utils/logger';

export const sendOTPController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;
        const result = await requestOTP(mobile);
        sendSuccess(res, result);
    } catch (err: any) {
        console.error('Send OTP error:', err);
        logger.error('Send OTP error: %o', err);

        const message = err?.message || 'Unknown error while sending OTP';
        sendError(res, message, 400);
    }
};

export const verifyOTPController = async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;
        const result = await verifyOTP(mobile, otp);
        sendSuccess(res, result);
    } catch (err: any) {
        logger.error('Verify OTP error: %s', err.message);
        sendError(res, err.message, 400);
    }
};
