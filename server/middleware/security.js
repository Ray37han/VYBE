/**
 * Security Middleware
 * 
 * Implements comprehensive security measures:
 * - Rate limiting for API endpoints
 * - Request validation
 * - Input sanitization
 * - Duplicate order prevention
 * - Firebase token verification
 */

import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

/**
 * Rate Limiter for Order Creation
 * Prevents spam and abuse by limiting order submissions
 * 
 * Limits: 5 orders per 15 minutes per IP
 */
export const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: '⚠️ Too many orders from this IP. Please try again after 15 minutes.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false
});

/**
 * General API Rate Limiter
 * Protects all API routes from excessive requests
 * 
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: '⚠️ Too many requests from this IP. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict Rate Limiter for Authentication
 * Prevents brute force attacks on auth endpoints
 * 
 * Limits: 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: '⚠️ Too many login attempts. Please try again after 15 minutes.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Only count failed attempts
});

/**
 * Order Validation Rules
 * Validates and sanitizes all order creation inputs
 * 
 * Server-side validation - NEVER trust frontend data
 */
export const validateOrderCreation = [
  // Firebase Token (required)
  body('firebaseToken')
    .trim()
    .notEmpty()
    .withMessage('🔒 Firebase authentication token is required')
    .isString()
    .withMessage('🔒 Invalid token format'),

  // Shipping Address - First Name
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('📝 First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('📝 First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s\u0980-\u09FF]+$/)
    .withMessage('📝 First name can only contain letters')
    .escape(),

  // Shipping Address - Last Name
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('📝 Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('📝 Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s\u0980-\u09FF]+$/)
    .withMessage('📝 Last name can only contain letters')
    .escape(),

  // Shipping Address - Phone (Bangladesh format)
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('📱 Phone number is required')
    .matches(/^(\+8801|8801|01)[3-9]\d{8}$/)
    .withMessage('📱 Invalid Bangladesh phone number format'),

  // Shipping Address - Street Address
  body('shippingAddress.streetAddress')
    .trim()
    .notEmpty()
    .withMessage('📍 Street address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('📍 Street address must be 5-200 characters')
    .escape(),

  // Shipping Address - District
  body('shippingAddress.district')
    .trim()
    .notEmpty()
    .withMessage('📍 District is required')
    .isIn([
      'Dhaka', 'Rajshahi', 'Chittagong', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur',
      'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Tangail',
      'Jamalpur', 'Sherpur', 'Netrokona', 'Kishoreganj', 'Manikganj', 'Munshiganj',
      'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur', 'Jessore',
      'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira', 'Chuadanga',
      'Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj', 'Pabna', 'Sirajganj',
      'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh',
      'Thakurgaon', 'Rangamati', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Lakshmipur',
      'Noakhali', 'Feni', 'Khagrachhari', 'Cox\'s Bazar', 'Habiganj', 'Moulvibazar',
      'Sunamganj', 'Barguna', 'Bagerhat', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'
    ])
    .withMessage('📍 Invalid district selected'),

  // Email (optional but validated if provided)
  body('shippingAddress.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('📧 Invalid email format')
    .normalizeEmail(),

  // Payment Method
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('💳 Payment method is required')
    .isIn(['bkash', 'nagad', 'rocket', 'cod'])
    .withMessage('💳 Invalid payment method'),

  // Order Items
  body('items')
    .isArray({ min: 1 })
    .withMessage('🛒 Order must contain at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('🛒 Product ID is required')
    .isMongoId()
    .withMessage('🛒 Invalid product ID'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('🛒 Quantity must be between 1 and 100'),

  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('💰 Invalid price'),

  // Total Price
  body('totalPrice')
    .isFloat({ min: 1 })
    .withMessage('💰 Invalid total price'),

  // Order Notes (optional)
  body('orderNotes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('📝 Order notes must be less than 500 characters')
    .escape()
];

/**
 * Validation Error Handler
 * Returns formatted validation errors to client
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract first error for cleaner UX
    const firstError = errors.array()[0];
    
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      error: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Duplicate Order Prevention Middleware
 * Prevents accidental duplicate submissions
 * 
 * Checks for orders with same phone + total within last 2 minutes
 */
export const preventDuplicateOrders = async (req, res, next) => {
  try {
    const { shippingAddress, totalPrice } = req.body;
    const { phone } = shippingAddress;

    // Import Order model dynamically to avoid circular dependency
    const Order = (await import('../models/Order.js')).default;

    // Check for recent duplicate orders (within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const duplicateOrder = await Order.findOne({
      'shippingAddress.phone': phone,
      'pricing.total': totalPrice,
      createdAt: { $gte: twoMinutesAgo }
    });

    if (duplicateOrder) {
      return res.status(409).json({
        success: false,
        message: '⚠️ Duplicate order detected. An identical order was placed recently.',
        error: 'DUPLICATE_ORDER',
        existingOrderId: duplicateOrder.orderNumber,
        timestamp: duplicateOrder.createdAt
      });
    }

    next();
  } catch (error) {
    console.error('❌ Duplicate check error:', error);
    // Don't block order if duplicate check fails
    next();
  }
};

/**
 * Sanitize Phone Number
 * Converts various Bangladesh phone formats to standard E.164
 * 
 * Accepted formats:
 * - 01712345678
 * - 8801712345678
 * - +8801712345678
 * 
 * Output: +8801712345678
 */
export const sanitizePhoneNumber = (req, res, next) => {
  try {
    if (req.body.shippingAddress?.phone) {
      let phone = req.body.shippingAddress.phone.trim();
      
      // Remove all spaces and dashes
      phone = phone.replace(/[\s-]/g, '');
      
      // Convert to E.164 format (+880...)
      if (phone.startsWith('01')) {
        phone = '+880' + phone.substring(1);
      } else if (phone.startsWith('8801')) {
        phone = '+' + phone;
      } else if (!phone.startsWith('+880')) {
        return res.status(400).json({
          success: false,
          message: '📱 Invalid phone number format',
          error: 'INVALID_PHONE_FORMAT'
        });
      }
      
      // Update the phone number in request body
      req.body.shippingAddress.phone = phone;
    }
    
    next();
  } catch (error) {
    console.error('❌ Phone sanitization error:', error);
    res.status(400).json({
      success: false,
      message: '📱 Error processing phone number',
      error: 'PHONE_SANITIZATION_ERROR'
    });
  }
};

/**
 * Request Logger Middleware
 * Logs all order creation attempts for security monitoring
 */
export const logOrderAttempt = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const phone = req.body.shippingAddress?.phone || 'unknown';
  
  console.log(`📋 [${timestamp}] Order attempt from IP: ${ip} | Phone: ${phone}`);
  
  next();
};

export default {
  orderCreationLimiter,
  generalLimiter,
  authLimiter,
  validateOrderCreation,
  handleValidationErrors,
  preventDuplicateOrders,
  sanitizePhoneNumber,
  logOrderAttempt
};
