import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { 
  validateImageAccess, 
  addImageSecurityHeaders, 
  rateLimit 
} from '../middleware/imageSecurity.js';

const router = express.Router();

/**
 * @route   GET /api/images/secure
 * @desc    Serve images securely with token validation
 * @access  Public (with valid token)
 */
router.get('/secure', 
  rateLimit(100, 60000), // Max 100 requests per minute
  addImageSecurityHeaders,
  validateImageAccess,
  async (req, res) => {
    try {
      const { url } = req.imageData;

      // If using Cloudinary, you can stream the image
      // Or redirect with temporary signed URL
      if (url.includes('cloudinary.com')) {
        // Option 1: Redirect to Cloudinary (simplest)
        return res.redirect(url);

        // Option 2: Proxy the image (more secure but slower)
        // const fetch = require('node-fetch');
        // const response = await fetch(url);
        // const buffer = await response.buffer();
        // res.set('Content-Type', response.headers.get('content-type'));
        // return res.send(buffer);
      }

      // For local files
      return res.sendFile(url);
    } catch (error) {
      console.error('Error serving secure image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load image',
      });
    }
  }
);

/**
 * @route   GET /api/images/thumbnail/:id
 * @desc    Serve thumbnail with watermark
 * @access  Public
 */
router.get('/thumbnail/:id', 
  rateLimit(200, 60000),
  addImageSecurityHeaders,
  async (req, res) => {
    try {
      // Implementation depends on your storage solution
      // This is a placeholder
      res.status(501).json({
        success: false,
        message: 'Thumbnail endpoint not implemented',
      });
    } catch (error) {
      console.error('Error serving thumbnail:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load thumbnail',
      });
    }
  }
);

export default router;
