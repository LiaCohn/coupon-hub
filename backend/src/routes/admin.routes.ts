import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { 
  createCouponValidation, 
  updateCouponValidation, 
  productIdValidation,
  createResellerValidation
} from '../utils/validators';

const router = Router();
const adminController = new AdminController();

// Create product
router.post(
  '/products',
  createCouponValidation,
  validateRequest,
  adminController.createProduct
);

// Get all products
router.get(
  '/products',
  adminController.getAllProducts
);

// Get product by ID
router.get(
  '/products/:id',
  productIdValidation,
  validateRequest,
  adminController.getProductById
);

// Update product
router.put(
  '/products/:id',
  updateCouponValidation,
  validateRequest,
  adminController.updateProduct
);

// Delete product
router.delete(
  '/products/:id',
  productIdValidation,
  validateRequest,
  adminController.deleteProduct
);

// Create reseller
router.post(
  '/resellers',
  createResellerValidation,
  validateRequest,
  adminController.createReseller
);

export default router;
