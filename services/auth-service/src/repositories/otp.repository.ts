import { OTPModel, IOTP } from '../models/otp.model';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

/**
 * Create a new OTP record
 * @param mobile - User's mobile number
 * @param otp - OTP code
 * @param expiresAt - Expiration date/time
 */


export const createOTP = async (mobile: string, otp: string, expiresAt: number): Promise<IOTP> => {
    // Invalidate previous OTPs for same user 
    await OTPModel.updateMany(
        { mobile, used: false },
        { used: true }
    );

    // Hash the new OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    return OTPModel.create({ mobile, otp: otpHash, expiresAt, used: false });
};

// Get latest OTP entry for a mobile
export const findLatestOTP = async (mobile: string): Promise<IOTP | null> => {
    return OTPModel.findOne({ mobile, used: false })
        .sort({ createdAt: -1 })
        .exec();
};

// Mark OTP as used
export const markOTPUsed = async (id: Types.ObjectId) => {
    await OTPModel.updateOne({ _id: id }, { used: true }).exec();
};

/**
 * Delete an OTP record by its _id
 * @param id - OTP document _id (string or ObjectId)
 */
export const deleteOTP = async (id: string | Types.ObjectId): Promise<IOTP | null> => {
    return OTPModel.findByIdAndDelete(id).exec();
};

export const countOTPsLastHour = async (mobile: string): Promise<number> => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return OTPModel.countDocuments({
        mobile,
        createdAt: { $gte: oneHourAgo }
    }).exec();
};