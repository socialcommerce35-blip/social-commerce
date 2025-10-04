import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';
import { connectDB } from './config/db';
import { errorHandler } from './utils/errorHandler';
import seedRoutes from './routes/seed.routes';

dotenv.config();
const app = express();

app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/seed', seedRoutes);

// Error Handler
app.use(errorHandler);

export default app;
