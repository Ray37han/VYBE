import jwt from 'jsonwebtoken';

/**
 * Enhanced authentication middleware for multi-device support
 * Validates JWT tokens and tracks device information
 */
export const authenticateDevice = async (req, res, next) => {
  try {
    // Get token from multiple sources
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer token
      req.cookies?.token || // Cookie
      req.query?.token || // Query parameter (for mobile apps)
      req.body?.token; // Body (for some mobile frameworks)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    // Capture device information for logging
    req.deviceInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      origin: req.headers.origin || req.headers.referer || 'Direct',
      timestamp: new Date()
    };

    // Log device access in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Auth successful - User: ${decoded.id}, Device: ${req.deviceInfo.userAgent.substring(0, 50)}`);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware to validate admin access from any device
 */
export const requireAdminFromAnyDevice = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }

    // Log admin access from different devices
    console.log(`🔐 Admin access from: ${req.deviceInfo.origin} - IP: ${req.deviceInfo.ip}`);

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

/**
 * Middleware to check if request is from mobile device
 */
export const detectMobileDevice = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  req.isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  req.isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  req.deviceType = req.isMobile ? 'mobile' : (req.isTablet ? 'tablet' : 'desktop');
  
  next();
};

export default {
  authenticateDevice,
  requireAdminFromAnyDevice,
  detectMobileDevice
};
