// utils/validators.js
import mongoose from 'mongoose';

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateProduct = (product) => {
  const errors = {};
  
  if (!product.name || product.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }
  
  if (!product.price || isNaN(product.price) || product.price <= 0) {
    errors.price = 'Price must be a positive number';
  }
  
  if (isNaN(product.quantity) || product.quantity < 0) {
    errors.quantity = 'Quantity must be 0 or more';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};