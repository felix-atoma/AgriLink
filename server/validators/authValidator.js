import { check } from 'express-validator';
import messages from '../constants/messages.js';

export const validateRegister = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  check('email')
    .isEmail()
    .withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail(),

  check('password')
    .isLength({ min: 6 })
    .withMessage(messages.VALIDATION.PASSWORD_LENGTH),

  check('role')
    .isIn(['farmer', 'buyer'])
    .withMessage('Role must be either farmer or buyer'),

  check('contact')
    .notEmpty()
    .withMessage('Contact information is required')
];

export const validateLogin = [
  check('email')
    .isEmail()
    .withMessage(messages.VALIDATION.INVALID_EMAIL)
    .normalizeEmail(),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
];