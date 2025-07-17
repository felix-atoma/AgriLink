import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

// Helper function to upload image to Cloudinary
const uploadImage = async (filePath) => {
  if (!filePath) return null;

  try {
    await fs.access(filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',
      resource_type: 'auto',
      timeout: 60000,
    });

    try {
      if (!filePath.startsWith('http')) {
        await fs.unlink(filePath);
      }
    } catch (unlinkError) {
      console.warn('Could not delete local file:', unlinkError.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    try {
      if (filePath && !filePath.startsWith('http')) {
        await fs.unlink(filePath);
      }
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError.message);
    }
    throw error;
  }
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, lat, lng } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !quantity || !lat || !lng) {
      return errorResponse(res, 'All fields are required', 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return errorResponse(res, 'Invalid coordinates', 400);
    }

    // Handle image upload
    let images = [];
    if (req.file) {
      try {
        const imageData = await uploadImage(req.file.path);
        images.push(imageData);
      } catch (uploadError) {
        return errorResponse(res, `Image upload failed: ${uploadError.message}`, 500);
      }
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
    console.error('Create product error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 'Validation failed', 400, { errors });
    }

    return errorResponse(res, 'Failed to create product', 500);
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { lat, lng, distance = 50, category, minPrice, maxPrice, farmerId } = req.query;
    let query = {};

    if (farmerId) {
      query.farmer = farmerId;
    }

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        return errorResponse(res, 'Invalid coordinates', 400);
      }

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance * 1000,
        },
      };
    }

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
    console.error('Get products error:', error);
    return errorResponse(res, 'Failed to fetch products', 500);
  }
};

// Get farmer's products
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id })
      .sort({ createdAt: -1 });

    return successResponse(res, products);
  } catch (error) {
    console.error('Get my products error:', error);
    return errorResponse(res, 'Failed to fetch your products', 500);
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
    console.error('Get product error:', error);
    return errorResponse(res, 'Failed to fetch product', 500);
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;

    if (!name || !description || !price || !quantity) {
      return errorResponse(res, 'All fields are required', 400);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    if (product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized', 403);
    }

    if (req.file) {
      try {
        // Delete old images
        if (product.images.length > 0) {
          await Promise.all(
            product.images.map(img => 
              deleteImage(img.publicId).catch(e => console.error(e))
            )
          );
        }

        const imageData = await uploadImage(req.file.path);
        product.images = [imageData];
      } catch (uploadError) {
        return errorResponse(res, `Image update failed: ${uploadError.message}`, 500);
      }
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category || product.category;
    product.quantity = quantity;

    const updatedProduct = await product.save();
    return successResponse(res, updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);

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

    if (product.farmer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized', 403);
    }

    // Delete associated images
    if (product.images.length > 0) {
      await Promise.all(
        product.images.map(img => 
          deleteImage(img.publicId).catch(e => console.error(e))
        )
      );
    }

    await product.deleteOne();
    return successResponse(res, { message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};