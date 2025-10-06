import { sendOTP as twilioSendOTP } from '../utils/twilioClient';
import { createOTP, findLatestOTP, markOTPUsed, findMobileNumber } from '../repositories/otp.repository';
import { createUser, findUserByMobile } from '../repositories/user.repository';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import config from '../config';
import logger from '../utils/logger';

import { IOTP } from '../models/otp.model';

const OTP_EXPIRY_MINUTES = 3;

interface JwtPayload {
    user_id: string;
    mobile: string;
    role: string
}

export const requestOTP = async (mobile: string): Promise<{ message: string }> => {
    // 1️⃣ Check if mobile is provided
    if (!mobile || mobile.trim() === '') {
        throw new Error('Mobile number is required.');
    }

    // 2️⃣ Check if it starts with +91
    if (!mobile.startsWith('+91')) {
        throw new Error('Only +91 numbers are allowed.');
    }

    // 3️⃣ Remove +91 and check remaining length
    const numberPart = mobile.slice(3);
    if (numberPart.length !== 10) {
        throw new Error('Mobile number must have 10 digits after +91.');
    }

    // 4️⃣ Check if all characters are digits
    if (!/^[6-9]\d{9}$/.test(numberPart)) {
        throw new Error('Invalid mobile number format. Must start with 6-9 and contain digits only.');
    }

    // Generate OTP
    // const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpCode = "654123"

    // Store expiry as epoch
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    try {
        await createOTP(mobile, otpCode, expiresAt);

        // Send OTP via Twilio
        // await twilioSendOTP(mobile, otpCode);
        logger.info('OTP sent to mobile: %s', mobile);

        return { message: 'OTP sent successfully' };
    } catch (error) {
        logger.error('Error sending OTP to %s: %o', mobile, error);
        throw new Error('Failed to send OTP. Please try again.');
    }
};

export const verifyOTP = async (mobile: string, otp: string) => {
    const otpGenerated: IOTP | null = await findMobileNumber(mobile);
    if (!otpGenerated) throw new Error('No OTP request found for this mobile');

    const otpEntry: IOTP | null = await findLatestOTP(mobile);
    if (!otpEntry) throw new Error('No unused OTP found for this mobile');

    // Check expiry
    if (Date.now() > otpEntry.expiresAt) throw new Error('OTP expired');

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpEntry.otp);
    if (!isMatch) throw new Error('Invalid OTP');

    // Mark OTP as used
    await markOTPUsed(otpEntry._id as Types.ObjectId);

    // Find or create user
    let user = await findUserByMobile(mobile);
    let action = "logged_in";

    if (!user) {
        user = await createUser({ mobile, role: 'user' })
        action = "registered"
    }

    // Update user auth info
    user.isVerified = true;
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        {
            user_id: user.user_id,
            mobile: user.mobile,
            role: user.role
        } as JwtPayload,
        config.jwtSecret,
        { expiresIn: '24h' }
    );

    return { token, action: action, user_id: user.user_id };
};