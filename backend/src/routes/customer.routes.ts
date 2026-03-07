import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { productIdValidation } from '../utils/validators';

const router = Router();
const customerController = new CustomerController();

// Get available products
router.get(
  '/products',
  customerController.getAvailableProducts
);

// Get product by ID
router.get(
  '/products/:id',
  productIdValidation,
  validateRequest,
  customerController.getProductById
);

// Purchase product
router.post(
  '/products/:id/purchase',
  productIdValidation,
  validateRequest,
  customerController.purchaseProduct
);

export default router;
