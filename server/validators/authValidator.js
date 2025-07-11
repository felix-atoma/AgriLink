import { check } from 'express-validator';
import messages from '../constants/messages.js';

export const validateRegister = [
  check('name')
    .notEmpty()
    .withMessage('Name is required'),

  check('email')
    .isEmail()
    .withMessage(messages.VALIDATION.INVALID_EMAIL),

  check('password')
    .isLength({ min: 6 })
    .withMessage(messages.VALIDATION.PASSWORD_LENGTH),

  check('role')
    .isIn(['farmer', 'buyer'])
    .withMessage('Invalid role specified'),

  check('contact')
    .notEmpty()
    .withMessage('Contact information is required')
];

export const validateLogin = [
  check('email')
    .isEmail()
    .withMessage(messages.VALIDATION.INVALID_EMAIL),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
];
