import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      // Optional mongoose options
      autoIndex: true,
      maxPoolSize: 10, // Adjust pool size for high-throughput
    });

    logger.info('MongoDB connected successfully');
  } catch (error: any) {
    logger.error('MongoDB connection error: ' + error.message);
    process.exit(1); // Stop the service if DB connection fails
  }
};
