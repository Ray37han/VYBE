import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary private folder
 * Raw images stored securely, transformations applied via URL
 * @param {Buffer} fileBuffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary result with publicId
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const {
      folder = 'vybe/products',
      type = 'upload', // public upload - no signed URLs needed
      imageType = 'product' // product, custom, hero, featured
    } = options;

    console.log('📤 Uploading to Cloudinary:', { folder, type, imageType });
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('File size:', fileBuffer?.length || 0, 'bytes');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          type: type, // upload for public access
          resource_type: 'auto',
          // Store RAW image - no transformations on upload
          // Transformations applied via URL when serving
          overwrite: false, // Keep original versions
          invalidate: true,
          // Add context for organization
          context: {
            type: imageType,
            uploaded_at: new Date().toISOString()
          },
          // Add tags for easy filtering
          tags: [imageType, 'vybe']
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful:', result.public_id);
            console.log('📁 Type:', result.type, '| Format:', result.format);
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary function error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export default cloudinary;
