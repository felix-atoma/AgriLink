// utils/cloudinary.js
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';
import path from 'path';

export const uploadToCloudinary = async (localFilePath) => {
  try {
    // Validate file exists
    try {
      await fs.access(localFilePath);
    } catch {
      throw new Error('File does not exist');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'products',
      resource_type: 'auto',
      timeout: 60000
    });

    // Clean up local file
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.warn('Could not delete local file:', unlinkError.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Clean up local file if upload fails
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError.message);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};