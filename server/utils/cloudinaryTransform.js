/**
 * Cloudinary URL Transformation Utility
 * 
 * Generates Cloudinary URLs with watermarks, resizing, and optimization
 * All image processing done by Cloudinary servers - zero server load!
 * 
 * @module cloudinaryTransform
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Generate watermarked product image URL
 * Adds VYBE watermark, optimizes format, and resizes
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export const getWatermarkedUrl = (publicId, options = {}) => {
  const {
    width = 1200,
    height = 1200,
    quality = 'auto:good',
    watermarkText = '© VYBE',
    watermarkOpacity = 40,
    watermarkSize = 30,
    format = 'auto', // auto WebP/AVIF
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      // Step 1: Resize image
      {
        width: width,
        height: height,
        crop: 'limit', // Don't enlarge, maintain aspect ratio
      },
      // Step 2: Add corner watermark
      {
        overlay: {
          font_family: 'Arial',
          font_size: watermarkSize,
          font_weight: 'bold',
          text: watermarkText,
        },
        color: '#FFFFFF',
        opacity: watermarkOpacity,
        gravity: 'south_east',
        x: 20,
        y: 20,
      },
      // Step 3: Add repeating pattern watermark (subtle)
      {
        overlay: {
          font_family: 'Arial',
          font_size: 16,
          font_weight: 'bold',
          text: watermarkText,
        },
        color: '#FFFFFF',
        opacity: 8,
        angle: -45,
        gravity: 'center',
      },
      // Step 4: Optimize delivery
      {
        quality: quality,
        fetch_format: format, // Auto-select WebP/AVIF for modern browsers
        dpr: 'auto', // Auto device pixel ratio
        flags: 'progressive', // Progressive JPEG loading
      },
    ],
    secure: true,
    sign_url: false, // Public URLs - no signing needed
  });
};

/**
 * Generate thumbnail URL with watermark
 * Smaller size for product cards and grids
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export const getThumbnailUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 400,
    quality = 'auto:good',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      // Smart crop with AI
      {
        width: width,
        height: height,
        crop: crop,
        gravity: gravity, // AI-powered focus
      },
      // Smaller watermark for thumbnails
      {
        overlay: {
          font_family: 'Arial',
          font_size: 14,
          font_weight: 'bold',
          text: '© VYBE',
        },
        color: '#FFFFFF',
        opacity: 30,
        gravity: 'south_east',
        x: 10,
        y: 10,
      },
      // Optimize
      {
        quality: quality,
        fetch_format: 'auto',
        dpr: 'auto',
      },
    ],
    secure: true,
    sign_url: false,
  });
};

/**
 * Generate hero/featured image URL with dramatic watermark
 * Large format with prominent branding
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export const getHeroImageUrl = (publicId, options = {}) => {
  const {
    width = 1920,
    height = 1080,
    quality = 'auto:best',
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      // Large format
      {
        width: width,
        height: height,
        crop: 'fill',
        gravity: 'auto',
      },
      // Prominent corner watermark
      {
        overlay: {
          font_family: 'Arial',
          font_size: 40,
          font_weight: 'bold',
          text: '© VYBE 2025',
        },
        color: '#FFFFFF',
        opacity: 50,
        gravity: 'south_east',
        x: 30,
        y: 30,
      },
      // Optimize for high quality
      {
        quality: quality,
        fetch_format: 'auto',
        dpr: 'auto',
        flags: 'progressive',
      },
    ],
    secure: true,
    sign_url: false,
  });
};

/**
 * Generate custom image URL WITHOUT watermark
 * For user-uploaded customization images
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export const getCustomImageUrl = (publicId, options = {}) => {
  const {
    width = 2000,
    height = 2000,
    quality = 'auto:best',
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width: width,
        height: height,
        crop: 'limit',
      },
      {
        quality: quality,
        fetch_format: 'auto',
        dpr: 'auto',
      },
    ],
    secure: true,
    sign_url: false,
  });
};

/**
 * Generate responsive image srcset
 * Multiple sizes for responsive images
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Array} widths - Array of widths [400, 800, 1200]
 * @returns {Object} - srcset and sizes strings
 */
export const getResponsiveUrls = (publicId, widths = [400, 800, 1200, 1600]) => {
  const urls = widths.map((width) => {
    const url = getWatermarkedUrl(publicId, { width, height: width });
    return `${url} ${width}w`;
  });

  return {
    srcset: urls.join(', '),
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1536px) 1200px, 1600px',
  };
};

/**
 * Generate image URLs for product
 * Returns all necessary sizes and formats
 * 
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} - Object with thumbnail, full, and responsive URLs
 */
export const getProductImageUrls = (publicId) => {
  return {
    thumbnail: getThumbnailUrl(publicId, { width: 400, height: 400 }),
    medium: getWatermarkedUrl(publicId, { width: 800, height: 800 }),
    large: getWatermarkedUrl(publicId, { width: 1200, height: 1200 }),
    full: getWatermarkedUrl(publicId, { width: 2000, height: 2000 }),
    responsive: getResponsiveUrls(publicId),
  };
};

/**
 * Generate raw image URL without any transformations
 * Admin-only access to original images
 * 
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} - Raw image URL
 */
export const getRawImageUrl = (publicId) => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: false,
    type: 'upload', // Public images
  });
};

/**
 * Check if watermark should be applied
 * Based on image type and context
 * 
 * @param {string} imageType - Type of image (product, custom, hero)
 * @returns {boolean} - Whether to apply watermark
 */
export const shouldWatermark = (imageType) => {
  const watermarkedTypes = ['product', 'hero', 'featured'];
  return watermarkedTypes.includes(imageType);
};

/**
 * Transform product images in database response
 * Converts publicId to full URL objects
 * 
 * @param {Object} product - Product object from database
 * @returns {Object} - Product with transformed image URLs
 */
export const transformProductImages = (product) => {
  if (!product.images || !Array.isArray(product.images)) {
    return product;
  }

  const transformedImages = product.images.map((image) => {
    if (typeof image === 'string') {
      // Old format - just URL
      return {
        url: image,
        urls: null,
      };
    }

    if (image.publicId) {
      // New format - generate all URLs
      return {
        publicId: image.publicId,
        urls: getProductImageUrls(image.publicId),
        // Keep original URL for backward compatibility
        url: getWatermarkedUrl(image.publicId),
      };
    }

    // Already has URL
    return image;
  });

  return {
    ...product,
    images: transformedImages,
  };
};

/**
 * Batch transform multiple products
 * 
 * @param {Array} products - Array of product objects
 * @returns {Array} - Products with transformed images
 */
export const transformProductsImages = (products) => {
  return products.map(transformProductImages);
};

export default {
  getWatermarkedUrl,
  getThumbnailUrl,
  getHeroImageUrl,
  getCustomImageUrl,
  getResponsiveUrls,
  getProductImageUrls,
  getRawImageUrl,
  shouldWatermark,
  transformProductImages,
  transformProductsImages,
};
