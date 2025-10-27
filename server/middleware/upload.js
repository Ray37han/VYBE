import multer from 'multer';
import path from 'path';
import { addSecureWatermark, optimizeImage } from '../utils/watermark.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed'), false);
  }
};

// Upload configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

/**
 * Middleware to automatically watermark uploaded images
 * Use this after multer upload middleware
 */
export const watermarkImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Process each uploaded file
    const watermarkedFiles = await Promise.all(
      req.files.map(async (file) => {
        try {
          // Add watermark
          const watermarkedBuffer = await addSecureWatermark(file.buffer, {
            text: '© VYBE',
            cornerText: '© VYBE 2025 - All Rights Reserved',
            repeatPattern: true,
          });

          // Optimize the watermarked image
          const optimizedBuffer = await optimizeImage(watermarkedBuffer, {
            maxWidth: 2000,
            maxHeight: 2000,
            quality: 90,
          });

          // Update file buffer with watermarked version
          return {
            ...file,
            buffer: optimizedBuffer,
            originalBuffer: file.buffer, // Keep original for backup
            watermarked: true,
          };
        } catch (error) {
          console.error('Error watermarking file:', file.originalname, error);
          // Return original file if watermarking fails
          return {
            ...file,
            watermarked: false,
            watermarkError: error.message,
          };
        }
      })
    );

    req.files = watermarkedFiles;
    next();
  } catch (error) {
    console.error('Watermarking middleware error:', error);
    next(error);
  }
};
