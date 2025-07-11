import { check } from 'express-validator';
import messages from '../constants/messages.js';


export const validateProduct = [
  check('name').notEmpty().withMessage('Product name is required'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
  check('category').notEmpty().withMessage('Category is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude value'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude value')
];