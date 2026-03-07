import { body, param, ValidationChain } from 'express-validator';

//validate create coupon request
export const createCouponValidation: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('image_url').trim().isURL().withMessage('Valid image URL is required'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('margin_percentage').isFloat({ min: 0 }).withMessage('Margin percentage must be a positive number'),
  body('value').trim().notEmpty().withMessage('Coupon value is required'),
  body('value_type').isIn(['STRING', 'IMAGE']).withMessage('Value type must be STRING or IMAGE'),
];

//validate update coupon request
export const updateCouponValidation: ValidationChain[] = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('image_url').optional().trim().isURL().withMessage('Valid image URL is required'),
  body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('margin_percentage').optional().isFloat({ min: 0 }).withMessage('Margin percentage must be a positive number'),
  body('value').optional().trim().notEmpty().withMessage('Coupon value cannot be empty'),
  body('value_type').optional().isIn(['STRING', 'IMAGE']).withMessage('Value type must be STRING or IMAGE'),
];

//validate purchase request
export const purchaseValidation: ValidationChain[] = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  body('reseller_price').isFloat({ min: 0 }).withMessage('Reseller price must be a positive number'),
];

//validate product ID
export const productIdValidation: ValidationChain[] = [
  param('id').isUUID().withMessage('Valid product ID is required'),
];

//validate create reseller request
export const createResellerValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Reseller name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
];
