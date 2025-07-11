const messages = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already exists',
    UNAUTHORIZED: 'Not authorized to access this resource',
    FORBIDDEN: 'Forbidden access'
  },

  PRODUCT: {
    NOT_FOUND: 'Product not found',
    INSUFFICIENT_STOCK: 'Insufficient product quantity',
    CREATE_SUCCESS: 'Product created successfully',
    UPDATE_SUCCESS: 'Product updated successfully',
    DELETE_SUCCESS: 'Product deleted successfully'
  },

  ORDER: {
    NOT_FOUND: 'Order not found',
    CREATE_SUCCESS: 'Order placed successfully',
    STATUS_UPDATED: 'Order status updated',
    DELETE_SUCCESS: 'Order deleted successfully'
  },

  VALIDATION: {
    FAILED: 'Validation failed, check your input',
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_LENGTH: 'Password must be at least 6 characters',
    REQUIRED_FIELDS: 'All required fields must be provided'
  },

  GENERAL: {
    SERVER_ERROR: 'An unexpected error occurred',
    NOT_FOUND: 'Resource not found'
  }
};

export default messages;
