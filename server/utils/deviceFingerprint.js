// Device Fingerprinting and Trusted Device Management
import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Generate a unique device fingerprint based on user agent and other factors
 */
export const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ip = req.ip || req.connection.remoteAddress;

  // Combine various factors to create a unique fingerprint
  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
};

/**
 * Generate a unique device ID
 */
export const generateDeviceId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Parse user agent to get device information
 */
export const parseUserAgent = (userAgent) => {
  const ua = userAgent || '';
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  // Detect device type
  let deviceType = 'Desktop';
  if (ua.includes('Mobile')) deviceType = 'Mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) deviceType = 'Tablet';
  
  return {
    browser,
    os,
    deviceType,
    deviceName: `${browser} on ${os}`
  };
};

/**
 * Check if device is trusted for a user
 */
export const isTrustedDevice = async (userId, deviceFingerprint) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const now = new Date();
    
    // Find matching device that hasn't expired
    const trustedDevice = user.trustedDevices.find(
      device => 
        device.fingerprint === deviceFingerprint && 
        device.expiresAt > now
    );

    if (trustedDevice) {
      // Update last used timestamp
      trustedDevice.lastUsed = now;
      await user.save();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking trusted device:', error);
    return false;
  }
};

/**
 * Add device to trusted devices list
 */
export const addTrustedDevice = async (userId, req, rememberDays = 30) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found' };

    const deviceFingerprint = generateDeviceFingerprint(req);
    const deviceId = generateDeviceId();
    const deviceInfo = parseUserAgent(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    // Check if device already exists
    const existingDeviceIndex = user.trustedDevices.findIndex(
      device => device.fingerprint === deviceFingerprint
    );

    const expiresAt = new Date(Date.now() + rememberDays * 24 * 60 * 60 * 1000);

    if (existingDeviceIndex !== -1) {
      // Update existing device
      user.trustedDevices[existingDeviceIndex] = {
        ...user.trustedDevices[existingDeviceIndex],
        lastUsed: new Date(),
        expiresAt,
        ipAddress: ip
      };
    } else {
      // Add new device
      user.trustedDevices.push({
        deviceId,
        deviceName: deviceInfo.deviceName,
        fingerprint: deviceFingerprint,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        lastUsed: new Date(),
        createdAt: new Date(),
        expiresAt
      });
    }

    // Limit to 5 most recent devices
    if (user.trustedDevices.length > 5) {
      user.trustedDevices.sort((a, b) => b.lastUsed - a.lastUsed);
      user.trustedDevices = user.trustedDevices.slice(0, 5);
    }

    await user.save();

    return {
      success: true,
      deviceId,
      deviceName: deviceInfo.deviceName,
      expiresAt
    };
  } catch (error) {
    console.error('Error adding trusted device:', error);
    return { success: false, message: 'Failed to add trusted device' };
  }
};

/**
 * Remove device from trusted devices
 */
export const removeTrustedDevice = async (userId, deviceId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found' };

    user.trustedDevices = user.trustedDevices.filter(
      device => device.deviceId !== deviceId
    );

    await user.save();

    return {
      success: true,
      message: 'Device removed successfully'
    };
  } catch (error) {
    console.error('Error removing trusted device:', error);
    return { success: false, message: 'Failed to remove device' };
  }
};

/**
 * Clean up expired devices
 */
export const cleanupExpiredDevices = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    user.trustedDevices = user.trustedDevices.filter(
      device => device.expiresAt > now
    );

    await user.save();
  } catch (error) {
    console.error('Error cleaning up expired devices:', error);
  }
};

/**
 * Get all trusted devices for a user
 */
export const getTrustedDevices = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, devices: [] };

    const now = new Date();
    
    // Filter out expired devices
    const activeDevices = user.trustedDevices
      .filter(device => device.expiresAt > now)
      .map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        ipAddress: device.ipAddress,
        lastUsed: device.lastUsed,
        createdAt: device.createdAt,
        expiresAt: device.expiresAt,
        daysRemaining: Math.ceil((device.expiresAt - now) / (24 * 60 * 60 * 1000))
      }))
      .sort((a, b) => b.lastUsed - a.lastUsed);

    return {
      success: true,
      devices: activeDevices
    };
  } catch (error) {
    console.error('Error getting trusted devices:', error);
    return { success: false, devices: [] };
  }
};

export default {
  generateDeviceFingerprint,
  generateDeviceId,
  parseUserAgent,
  isTrustedDevice,
  addTrustedDevice,
  removeTrustedDevice,
  cleanupExpiredDevices,
  getTrustedDevices
};
