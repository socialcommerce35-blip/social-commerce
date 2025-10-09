import { Router } from 'express';
import { seedProducts } from '../controllers/seed.controller';
const router = Router();

// Protected + rate-limited seed route
router.post('/products', seedProducts);

export default router;
