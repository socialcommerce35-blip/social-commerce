import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { protect } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// All routes protected and rate limited
router.get('/list', protect, apiLimiter, productController.fetchProducts);
router.post('/brands', protect, apiLimiter, productController.fetchBrandsByPrice);
router.post('/styles', protect, apiLimiter, productController.fetchStylesByBrands);

export default router;
