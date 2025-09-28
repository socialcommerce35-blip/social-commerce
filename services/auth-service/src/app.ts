import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import { connectDB } from './config/db';
import logger from './config/logger';

const app = express();
app.use(express.json());

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

connectDB();

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
