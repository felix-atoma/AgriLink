import { check, validationResult } from 'express-validator';
import messages from '../constants/messages.js';

// Common password requirements configuration
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowedSpecialChars: '!@#$%^&*()_+-=[]{}|,./?`~',
  blockedChars: `;'"\\<>`
};

/**
 * Validation middleware for user registration
 */
export const validateRegister = [
  // Name validation
  check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .trim()
    .escape(),

  // Email validation
  check('email')
    .isEmail().withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail()
    .customSanitizer(email => email.toLowerCase()),

  // Password validation with enhanced rules
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
      .withMessage(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .if(PASSWORD_REQUIREMENTS.requireLowercase)
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .if(PASSWORD_REQUIREMENTS.requireUppercase)
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .if(PASSWORD_REQUIREMENTS.requireNumber)
    .matches(new RegExp(`[${escapeRegExp(PASSWORD_REQUIREMENTS.allowedSpecialChars)}]`))
      .withMessage(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.allowedSpecialChars})`)
      .if(PASSWORD_REQUIREMENTS.requireSpecialChar)
    .not().matches(new RegExp(`[${escapeRegExp(PASSWORD_REQUIREMENTS.blockedChars)}]`))
      .withMessage(`Password cannot contain these characters: ${PASSWORD_REQUIREMENTS.blockedChars}`),

  // Confirm password validation
  check('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  // Role validation
  check('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['farmer', 'buyer']).withMessage('Role must be either farmer or buyer'),

  // Contact validation
  check('contact')
    .notEmpty().withMessage('Contact information is required')
    .isLength({ min: 6 }).withMessage('Contact must be at least 6 characters')
    .trim(),

  // Conditional farmer validations
  check('farmName')
    .if(check('role').equals('farmer'))
    .notEmpty().withMessage('Farm name is required for farmers')
    .isLength({ min: 2 }).withMessage('Farm name must be at least 2 characters')
    .trim(),

  check('lat')
    .if(check('role').equals('farmer'))
    .notEmpty().withMessage('Latitude is required for farmers')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value (must be between -90 and 90)'),

  check('lng')
    .if(check('role').equals('farmer'))
    .notEmpty().withMessage('Longitude is required for farmers')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value (must be between -180 and 180)'),

  // Validation handler
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          param: err.param,
          message: err.msg,
          location: err.location,
          value: err.value
        }));

        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
          passwordRequirements: {
            minLength: PASSWORD_REQUIREMENTS.minLength,
            requirements: [
              PASSWORD_REQUIREMENTS.requireLowercase && '1 lowercase letter',
              PASSWORD_REQUIREMENTS.requireUppercase && '1 uppercase letter',
              PASSWORD_REQUIREMENTS.requireNumber && '1 number',
              PASSWORD_REQUIREMENTS.requireSpecialChar && `1 special character (${PASSWORD_REQUIREMENTS.allowedSpecialChars})`
            ].filter(Boolean)
          }
        });
      }
      next();
    } catch (err) {
      console.error('Validation middleware error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal validation error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
];

/**
 * Validation middleware for user login
 */
export const validateLogin = [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail(),

  check('password')
    .notEmpty().withMessage('Password is required'),
    
  // Validation handler
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            param: err.param,
            message: err.msg,
            location: err.location
          }))
        });
      }
      next();
    } catch (err) {
      console.error('Validation middleware error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal validation error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
];

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}