import { check, validationResult } from 'express-validator';
import { PASSWORD_REQUIREMENTS } from '../config/constants.js';

// Safely escape special characters for regex
const escapeRegExp = (string = '') =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const validateRegister = [
  check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength || 8 })
    .withMessage(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength || 8} characters`)
    .custom((value) => {
      if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(value)) {
        throw new Error('Password must contain at least one number');
      }
      if (
        PASSWORD_REQUIREMENTS.requireSpecialChar &&
        PASSWORD_REQUIREMENTS.allowedSpecialChars &&
        !new RegExp(`[${escapeRegExp(PASSWORD_REQUIREMENTS.allowedSpecialChars)}]`).test(value)
      ) {
        throw new Error(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.allowedSpecialChars})`);
      }
      if (
        PASSWORD_REQUIREMENTS.blockedChars &&
        new RegExp(`[${escapeRegExp(PASSWORD_REQUIREMENTS.blockedChars)}]`).test(value)
      ) {
        throw new Error(`Password cannot contain these characters: ${PASSWORD_REQUIREMENTS.blockedChars}`);
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateLogin = [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  check('password')
    .notEmpty().withMessage('Password is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
