import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

// Helper function to upload image to Cloudinary
const uploadImage = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',
      resource_type: 'auto'
    });
    await fs.unlink(filePath); // Remove file from server
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    await fs.unlink(filePath); // Clean up if upload fails
    throw error;
  }
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, lat, lng } = req.body;

    // Validate required fields
    const requiredFields = { name, description, price, category, quantity, lat, lng };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return errorResponse(res, 'Invalid latitude or longitude values', 400);
    }

    // Handle image upload
    let images = [];
    if (req.file) {
      try {
        const imageData = await uploadImage(req.file.path);
        images.push(imageData);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return errorResponse(res, 'Failed to upload product image', 500);
      }
    }

    // Create product
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
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 'Validation failed', 400, { errors });
    }
    
    return errorResponse(res, 'Failed to create product', 500);
  }
};

// Get all products (with optional geo query)
export const getProducts = async (req, res) => {
  try {
    const { lat, lng, distance = 50, category, minPrice, maxPrice } = req.query;
    let query = {};

    // Handle geo query
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

    // Apply filters
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('farmer', 'name farmName')
      .sort({ createdAt: -1 });

    return successResponse(res, products);
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    return errorResponse(res, 'Failed to fetch products', 500);
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name farmName');

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product);
  } catch (error) {
    console.error('GET PRODUCT ERROR:', error);
    return errorResponse(res, 'Failed to fetch product', 500);
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !quantity) {
      return errorResponse(res, 'Name, description, price and quantity are required', 400);
    }

    // Convert types
    const numericPrice = parseFloat(price);
    const numericQuantity = parseInt(quantity);
    
    if (isNaN(numericPrice) || isNaN(numericQuantity)) {
      return errorResponse(res, 'Price and quantity must be valid numbers', 400);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Authorization check
    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to update this product', 403);
    }

    // Handle new image if present
    if (req.file) {
      try {
        // Delete old images if they exist
        if (product.images.length > 0) {
          await Promise.all(
            product.images.map(img => deleteImage(img.publicId))
          );
        }

        // Upload new image
        const imageData = await uploadImage(req.file.path);
        product.images = [imageData];
      } catch (uploadError) {
        console.error('Image update failed:', uploadError);
        return errorResponse(res, 'Failed to update product image', 500);
      }
    }

    // Update fields
    product.name = name;
    product.description = description;
    product.price = numericPrice;
    product.category = category || product.category;
    product.quantity = numericQuantity;

    const updatedProduct = await product.save();
    return successResponse(res, updatedProduct);
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 'Validation failed', 400, { errors });
    }
    
    return errorResponse(res, 'Failed to update product', 500);
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Authorization check
    if (req.user.role === 'farmer' && product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to delete this product', 403);
    }

    // Delete associated images
    if (product.images.length > 0) {
      await Promise.all(
        product.images.map(img => deleteImage(img.publicId))
      );
    }

    await product.deleteOne();
    return successResponse(res, { message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};