import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generates a signed token for secure image access
 * @param {string} imageUrl - The image URL to protect
 * @param {number} expiresIn - Token expiration time in seconds (default: 1 hour)
 * @returns {string} - Signed token
 */
function generateImageToken(imageUrl, expiresIn = 3600) {
  const secret = process.env.IMAGE_SECRET || process.env.JWT_SECRET || 'your-secret-key';
  
  const payload = {
    url: imageUrl,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies an image access token
 * @param {string} token - The token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function verifyImageToken(token) {
  try {
    const secret = process.env.IMAGE_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Middleware to validate image access tokens
 */
function validateImageAccess(req, res, next) {
  try {
    const token = req.query.token || req.headers['x-image-token'];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Image access token required' 
      });
    }

    const decoded = verifyImageToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired image token' 
      });
    }

    // Attach decoded info to request
    req.imageData = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Image security validation failed' 
    });
  }
}

/**
 * Middleware to add security headers for image responses
 */
function addImageSecurityHeaders(req, res, next) {
  // Prevent caching of images
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    
    // Prevent embedding in other sites
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self'",
    
    // Additional security headers
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  
  next();
}

/**
 * Rate limiting for image requests (basic implementation)
 */
const imageRequestTracker = new Map();

function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!imageRequestTracker.has(clientId)) {
      imageRequestTracker.set(clientId, []);
    }
    
    const requests = imageRequestTracker.get(clientId);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many image requests. Please try again later.',
      });
    }
    
    validRequests.push(now);
    imageRequestTracker.set(clientId, validRequests);
    
    next();
  };
}

/**
 * Generate secure image URLs with tokens
 * @param {Array} images - Array of image objects
 * @param {number} expiresIn - Token expiration time
 * @returns {Array} - Images with secure URLs
 */
function generateSecureImageUrls(images, expiresIn = 3600) {
  return images.map(img => {
    const token = generateImageToken(img.url, expiresIn);
    return {
      ...img,
      secureUrl: `/api/images/secure?token=${token}`,
      url: undefined, // Hide original URL
      _originalUrl: img.url, // Keep for internal use only
    };
  });
}

/**
 * Clean up old entries from rate limiter
 */
setInterval(() => {
  const now = Date.now();
  const windowMs = 60000;
  
  for (const [clientId, requests] of imageRequestTracker.entries()) {
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length === 0) {
      imageRequestTracker.delete(clientId);
    } else {
      imageRequestTracker.set(clientId, validRequests);
    }
  }
}, 60000); // Clean up every minute

export {
  generateImageToken,
  verifyImageToken,
  validateImageAccess,
  addImageSecurityHeaders,
  rateLimit,
  generateSecureImageUrls,
};
