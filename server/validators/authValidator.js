import { check } from 'express-validator';
import messages from '../constants/messages.js';

export const validateRegister = [
  check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .trim().escape(),

  check('email')
    .isEmail().withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail()
    .customSanitizer(email => email.toLowerCase()),

  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .not().matches(/[;'"\\]/).withMessage('Password contains invalid characters'),

  check('role')
    .isIn(['farmer', 'buyer']).withMessage('Role must be either farmer or buyer'),

  check('contact')
    .notEmpty().withMessage('Contact information is required')
    .isLength({ min: 6 }).withMessage('Contact must be at least 6 characters'),

  check('farmName')
    .if(check('role').equals('farmer'))
    .notEmpty().withMessage('Farm name is required for farmers')
    .isLength({ min: 2 }).withMessage('Farm name must be at least 2 characters'),

  check('lat')
    .if(check('role').equals('farmer'))
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value'),

  check('lng')
    .if(check('role').equals('farmer'))
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

export const validateLogin = [
  check('email')
    .isEmail().withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail(),

  check('password')
    .notEmpty().withMessage('Password is required'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];