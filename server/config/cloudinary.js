import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (fileBuffer, folder = 'vybe-products') => {
  try {
    console.log('📤 Starting Cloudinary upload...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');
    console.log('File buffer size:', fileBuffer?.length || 0, 'bytes');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          // Optimized transformations for best performance
          transformation: [
            { width: 1920, height: 1920, crop: 'limit' }, // HD quality support
            { quality: 'auto:best' }, // Best quality with smart compression
            { fetch_format: 'auto' }, // Auto WebP/AVIF for modern browsers
            { dpr: 'auto' }, // Auto device pixel ratio for retina displays
            { flags: 'progressive' } // Progressive loading for better UX
          ],
          eager: [
            { width: 400, height: 400, crop: 'fill', gravity: 'auto' }, // Thumbnail
            { width: 800, height: 800, crop: 'limit' } // Medium size for mobile
          ],
          eager_async: true, // Generate eager transformations in background
          overwrite: true,
          invalidate: true
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful:', result.secure_url);
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
