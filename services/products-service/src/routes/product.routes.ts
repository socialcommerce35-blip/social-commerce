import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// All routes protected and rate limited
router.get('/list', authenticate, apiLimiter, productController.fetchProducts);
router.get('/buckets', authenticate, apiLimiter, productController.fetchBrandsByPrice);
router.get('/styles', authenticate, apiLimiter, productController.fetchStylesByBuckets);

export default router;
