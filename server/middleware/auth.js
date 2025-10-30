import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check for token in cookies or Authorization header
    // Works from ANY device, ANY IP address, ANY browser
    if (req.cookies.token) {
      token = req.cookies.token;
      console.log('🍪 Token from cookie');
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token from Authorization header');
    }

    if (!token) {
      console.log('❌ No token provided');
      console.log(`   From IP: ${clientIP}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in to access this route.'
      });
    }

    // Verify token - NO IP or device restrictions
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('❌ User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
    console.log(`   From IP: ${clientIP}`);
    console.log(`   Device: ${userAgent.substring(0, 50)}...`);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    console.log(`🔒 Authorization check for roles: ${roles.join(', ')}`);
    console.log(`👤 User: ${req.user?.email} | Role: ${req.user?.role}`);
    console.log(`🌍 From IP: ${clientIP}`);
    console.log(`📱 Device-Independent: ✅ Works from ANY device, ANY location`);
    
    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Access denied: User has '${req.user.role}' but needs '${roles.join(' or ')}'`);
      return res.status(403).json({
        success: false,
        message: `Access denied. You need '${roles.join(' or ')}' role. Your role is '${req.user.role}'.`
      });
    }
    
    console.log('✅ Authorization successful - Admin can upload from this device');
    next();
  };
};
