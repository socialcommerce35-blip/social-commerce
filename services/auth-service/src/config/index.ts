import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 4000,
    mongoURI: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
    logLevel: process.env.LOG_LEVEL || 'info',
    twilioSid: process.env.TWILIO_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
};