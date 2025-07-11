import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, lat, lng } = req.body;


    let images = [];
    if (req.file) {
      images.push(req.file.path); // Use Cloudinary image URL
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity, 
      images,
      farmer: req.user.id,
      location: lat && lng
        ? {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          }
        : undefined,
    });

    successResponse(res, product, 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get all products (with optional geo query)
export const getProducts = async (req, res) => {
  try {
    const { lat, lng, distance = 50 } = req.query;
    let query = {};

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: distance * 1000, // meters
        },
      };
    }

    const products = await Product.find(query).populate('farmer', 'name farmName');
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get a single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name farmName');
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    // Optional: check ownership
    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to update this product', 403);
    }

    if (req.file) {
      product.images.push(req.file.path); // Cloudinary image URL
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;

    await product.save();
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    // Optional: check ownership
    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to delete this product', 403);
    }

    await product.deleteOne();
    successResponse(res, { message: 'Product deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message);
  }
};
