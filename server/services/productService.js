import Product from '../models/Product.js';
import { messages } from '../constants/messages.js';

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const getProducts = async (filters = {}) => {
  const { lat, lng, distance = 50, ...query } = filters;
  
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: distance * 1000
      }
    };
  }

  return await Product.find(query).populate('farmer', 'name farmName');
};

export const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(messages.PRODUCT.NOT_FOUND);
  }
  if (product.quantity < quantity) {
    throw new Error(messages.PRODUCT.INSUFFICIENT_STOCK);
  }
  product.quantity -= quantity;
  return await product.save();
};