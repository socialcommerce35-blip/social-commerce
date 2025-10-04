import twilio from 'twilio';
import config from '../config';

const client = twilio(config.twilioSid, config.twilioAuthToken);

export const sendOTP = async (mobile: string, otp: string) => {
    return client.messages.create({
        body: `Your OTP code is ${otp}`,
        from: config.twilioFromNumber,
        to: mobile
    });
};
