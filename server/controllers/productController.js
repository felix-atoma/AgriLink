import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, lat, lng } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !quantity || !lat || !lng) {
      return errorResponse(res, 'All fields including lat, lng, and quantity are required.', 400);
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return errorResponse(res, 'Latitude and Longitude must be valid numbers.', 400);
    }

    // Cloudinary image (optional)
    let images = [];
    if (req.file) {
      images.push(req.file.path); // assuming path contains Cloudinary URL via multer-cloudinary
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity,
      images,
      farmer: req.user.id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    return successResponse(res, product, 201);
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    return errorResponse(res, error.message);
  }
};

// Get all products (with optional geo query)
export const getProducts = async (req, res) => {
  try {
    const { lat, lng, distance = 50 } = req.query;
    let query = {};

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return errorResponse(res, 'Invalid coordinates in query', 400);
      }

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance * 1000, // Convert km to meters
        },
      };
    }

    const products = await Product.find(query).populate('farmer', 'name farmName');
    return successResponse(res, products);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name farmName');
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, product);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to update this product', 403);
    }

    if (req.file) {
      product.images.push(req.file.path);
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.quantity = quantity || product.quantity;

    await product.save();
    return successResponse(res, product);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to delete this product', 403);
    }

    await product.deleteOne();
    return successResponse(res, { message: 'Product deleted successfully' });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
