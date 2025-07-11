import { check } from 'express-validator';
import messages from '../constants/messages.js';

export const validateOrder = [
  check('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  check('products.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  check('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  check('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
];