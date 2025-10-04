import { Router } from 'express';
import { seedProducts } from '../controllers/seed.controller';
import { protect } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Protected + rate-limited seed route
router.post('/products', protect, apiLimiter, seedProducts);

export default router;
