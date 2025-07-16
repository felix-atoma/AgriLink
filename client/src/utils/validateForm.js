import mongoose from 'mongoose';

// Email validation (enhanced)
export const validateEmail = (email = '') => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return email ? re.test(email.trim()) : false;
};

// Password validation (enhanced)
export const validatePassword = (password = '') => {
  const trimmed = password.trim();
  return trimmed.length >= 8 && // Minimum 8 characters
         /[A-Z]/.test(trimmed) && // At least one uppercase
         /[0-9]/.test(trimmed);   // At least one number
};

// MongoDB ObjectId validation
export const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && 
         (new mongoose.Types.ObjectId(id)).toString() === id;
};

// Product validation (enhanced)
export const validateProduct = (product = {}) => {
  const errors = {};

  if (!product.name?.trim()) {
    errors.name = 'Product name is required';
  } else if (product.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.price = 'Valid price required (greater than 0)';
  }

  if (typeof product.quantity !== 'number' || product.quantity < 0) {
    errors.quantity = 'Valid quantity required (0 or more)';
  }

  if (product.category && !isValidObjectId(product.category)) {
    errors.category = 'Invalid category ID format';
  }

  return Object.keys(errors).length ? errors : null;
};

// Order validation (enhanced with item validation)
export const validateOrder = (order = {}) => {
  const errors = {};

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.items = 'At least one item required';
  } else {
    order.items.forEach((item, index) => {
      if (!isValidObjectId(item.product)) {
        errors[`items[${index}].product`] = 'Invalid product ID';
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors[`items[${index}].quantity`] = 'Quantity must be at least 1';
      }
    });
  }

  if (!order.shippingAddress?.street?.trim()) {
    errors.shippingAddress = 'Street address is required';
  }

  if (!order.shippingAddress?.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!order.shippingAddress?.country?.trim()) {
    errors.country = 'Country is required';
  }

  if (!['cash', 'credit_card', 'mobile_money', 'paypal'].includes(order.paymentMethod)) {
    errors.paymentMethod = 'Invalid payment method';
  }

  return Object.keys(errors).length ? errors : null;
};

// User validation
export const validateUser = (user = {}) => {
  const errors = {};

  if (!user.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!validateEmail(user.email)) {
    errors.email = 'Valid email required';
  }

  if (!validatePassword(user.password)) {
    errors.password = 'Password must be 8+ chars with uppercase and number';
  }

  if (user.role && !['buyer', 'seller', 'admin'].includes(user.role)) {
    errors.role = 'Invalid user role';
  }

  return Object.keys(errors).length ? errors : null;
};

export default {
  validateEmail,
  validatePassword,
  isValidObjectId,
  validateProduct,
  validateOrder,
  validateUser
};