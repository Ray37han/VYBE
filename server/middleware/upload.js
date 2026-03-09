import multer from 'multer';
import sharp from 'sharp';

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

// Upload configuration with enhanced settings for remote devices
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit - enough for high-quality images from any device
    files: 10 // Maximum 10 files per request
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
 * Image preprocessing middleware using Sharp
 * Resizes and converts to WebP before Cloudinary upload
 * - Reduces upload bandwidth and storage costs
 * - Max dimension: 1200x1200 (preserves aspect ratio)
 * - Format: WebP at quality 80
 * - Cloudinary still handles watermarks via URL transformations
 */
export const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processed = await Promise.all(
      req.files.map(async (file) => {
        const optimized = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',          // Maintain aspect ratio, don't crop
            withoutEnlargement: true // Don't upscale small images
          })
          .webp({ quality: 80 })
          .toBuffer();

        return {
          ...file,
          buffer: optimized,
          mimetype: 'image/webp',
          size: optimized.length,
          originalSize: file.size
        };
      })
    );

    req.files = processed;
    const totalSaved = req.files.reduce((acc, f) => acc + (f.originalSize - f.size), 0);
    console.log(`✅ Images optimized: ${req.files.length} files, saved ${(totalSaved / 1024).toFixed(0)}KB`);
    next();
  } catch (error) {
    console.error('❌ Image processing error:', error.message);
    // Fall back to original files if processing fails
    next();
  }
};
