import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config';
import authRoutes from './routes/auth.routes';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import logger from './utils/logger';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(express.json());
app.use(requestLogger);

app.use('/api/auth', authRoutes);

app.use(errorHandler);

mongoose.connect(config.mongoURI)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error: %s', err.message));

export default app;
