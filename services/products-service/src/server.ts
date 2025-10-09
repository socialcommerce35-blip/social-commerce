import mongoose from 'mongoose';
import app from './app';
import config from './config';
import {logger} from './utils/logger';

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    logger.info('Connected to MongoDB');

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();