import { Router } from 'express';
import { ResellerController } from '../controllers/reseller.controller';
import { authenticateReseller } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { productIdValidation, purchaseValidation } from '../utils/validators';

const router = Router();
const resellerController = new ResellerController();

// Apply authentication middleware to all reseller routes
router.use(authenticateReseller);

// Get available products
router.get(
  '/products',
  resellerController.getAvailableProducts
);

// Get product by ID
router.get(
  '/products/:id',
  productIdValidation,
  validateRequest,
  resellerController.getProductById
);

// Purchase product
router.post(
  '/products/:id/purchase',
  purchaseValidation,
  validateRequest,
  resellerController.purchaseProduct
);

export default router;
