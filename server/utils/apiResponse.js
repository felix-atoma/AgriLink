// utils/apiResponse.js

export const successResponse = (res, data, statusCode = 200) => {
  console.log('✅ SUCCESS:', data);
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const errorResponse = (res, message, statusCode = 400) => {
  console.error('❌ ERROR:', message);
  return res.status(statusCode).json({
    success: false,
    error: message || 'Unknown error'
  });
};

export const validationError = (res, errors) => {
  const extractedErrors = Array.isArray(errors?.array?.()) ? errors.array() : errors;
  console.error('⚠️ Validation errors:', extractedErrors);
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: extractedErrors
  });
};

// Status-specific helpers
export const unauthorized = (res, message = 'Unauthorized') => errorResponse(res, message, 401);
export const forbidden = (res, message = 'Forbidden') => errorResponse(res, message, 403);
export const notFound = (res, message = 'Not found') => errorResponse(res, message, 404);
export const conflict = (res, message = 'Conflict') => errorResponse(res, message, 409);
export const tooManyRequests = (res, message = 'Too many requests') => errorResponse(res, message, 429);
export const serverError = (res, message = 'Internal Server Error') => errorResponse(res, message, 500);
