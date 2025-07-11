import logger from '../utils/logger.js';
import i18n from '../config/i18n.js';

export const notFound = (req, res, next) => {
  const error = new Error(i18n.__('errors.notFound'));
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || i18n.__('errors.serverError');

  if (statusCode >= 500) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};