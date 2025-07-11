/**
 * Standard API response helpers
 * Author: Felix / ChatGPT
 * Purpose: Consistent API response formatting with common HTTP status codes
 */

/**
 * Send a successful response.
 * @param {Response} res - Express response object
 * @param {*} data - Response payload
 * @param {number} [statusCode=200] - HTTP status code
 */
export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send a generic error response.
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=400] - HTTP status code
 */
export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Send a validation error response (typically from express-validator).
 * @param {Response} res - Express response object
 * @param {Object} errors - Express-validator result or custom array
 */
export const validationError = (res, errors) => {
  const extractedErrors = Array.isArray(errors?.array?.()) ? errors.array() : errors;

  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: extractedErrors
  });
};

// Optional: standardized helpers for specific status codes

export const unauthorized = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

export const forbidden = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

export const notFound = (res, message = 'Not found') => {
  return errorResponse(res, message, 404);
};

export const conflict = (res, message = 'Conflict') => {
  return errorResponse(res, message, 409);
};

export const tooManyRequests = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

export const serverError = (res, message = 'Internal Server Error') => {
  return errorResponse(res, message, 500);
};
