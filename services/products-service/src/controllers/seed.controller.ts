import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { faker } from '@faker-js/faker';
import { logger } from '../utils/logger';

// Endpoint to populate DB with 500 dummy products
export const seedProducts = async (req: Request, res: Response) => {
  try {
    const products = [];

    for (let i = 0; i < 500; i++) {
      const brandId = faker.string.uuid();
      const brandName = faker.company.name();
      const category = faker.commerce.department();
      const title = faker.commerce.productName();
      const style = faker.commerce.productAdjective();
      const price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
      const description = faker.commerce.productDescription();

      products.push({
        brandId,
        brandName,
        category,
        title,
        style,
        price,
        description,
      });
    }

    await Product.insertMany(products);
    logger.info('500 dummy products inserted successfully');

    res.json(successResponse(null, '500 dummy products inserted successfully'));
  } catch (error) {
    logger.error('Error seeding products:', error);
    res.status(500).json(errorResponse(error));
  }
};

