import multer from 'multer';

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
 * No watermarking middleware needed!
 * Cloudinary handles watermarks via URL transformations
 * Just pass through the original files
 */
export const processImages = (req, res, next) => {
  // Images uploaded as-is to Cloudinary
  // Watermarks applied when generating URLs
  console.log('✅ Images ready for Cloudinary upload (no pre-processing)');
  next();
};
