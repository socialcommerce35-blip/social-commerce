import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import productRoutes from './routes/product.routes';
import seedRoutes from './routes/seed.routes';
const app = express();

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/seed', seedRoutes);

app.use(errorHandler);

export default app;