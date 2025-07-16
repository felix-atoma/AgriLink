// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'products',
      resource_type: 'auto'
    });

    // Delete the local file only if it exists
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.warn('Warning: Could not delete local file:', unlinkError.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Attempt to delete the local file if upload fails
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError.message);
      }
    }
    throw error;
  }
};

export { uploadToCloudinary };