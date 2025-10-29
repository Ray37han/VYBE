import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendVerificationEmail, verifyCode } from '../utils/emailVerification.js';
import { otpRateLimiter, loginRateLimiter, resetOtpRateLimit, resetLoginRateLimit } from '../middleware/rateLimiter.js';
import { 
  generateDeviceFingerprint, 
  isTrustedDevice, 
  addTrustedDevice, 
  removeTrustedDevice,
  getTrustedDevices,
  parseUserAgent 
} from '../utils/deviceFingerprint.js';
import {
  generateBackupCodes,
  verifyBackupCode,
  getBackupCodesStatus,
  getBackupCodes
} from '../utils/backupCodes.js';
import { sendLoginNotification, sendSuspiciousLoginAlert } from '../utils/loginNotifications.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Step 1: Request login & send verification code
// @access  Public
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password, rememberDevice } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if 2FA is enabled for user
    if (!user.securitySettings?.twoFactorEnabled) {
      // 2FA disabled - direct login
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Log login history
      user.loginHistory.push({
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceInfo: parseUserAgent(req.headers['user-agent']).deviceName,
        timestamp: new Date(),
        success: true,
        method: 'password-only'
      });
      await user.save();

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        message: 'Login successful (2FA disabled)'
      });
    }

    // Check if device is trusted
    const deviceFingerprint = generateDeviceFingerprint(req);
    const trusted = await isTrustedDevice(user._id, deviceFingerprint);

    if (trusted) {
      // Skip OTP for trusted device
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Reset rate limits
      resetLoginRateLimit(req.ip || req.connection.remoteAddress);

      // Log login history
      user.loginHistory.push({
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceInfo: parseUserAgent(req.headers['user-agent']).deviceName,
        timestamp: new Date(),
        success: true,
        method: 'trusted-device'
      });
      await user.save();

      // Send notification if enabled
      if (user.securitySettings?.loginAlerts) {
        sendLoginNotification(user, req, 'trusted-device').catch(console.error);
      }

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        message: 'Login successful (trusted device)'
      });
    }

    // Send verification code via email
    try {
      const emailResult = await sendVerificationEmail(user._id, user.email, user.name);
      
      res.json({
        success: true,
        message: 'Verification code sent to your email',
        email: user.email,
        expiresAt: emailResult.expiresAt,
        requiresVerification: true,
        canRememberDevice: true
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // If email fails, still allow direct login (fallback)
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        message: 'Email service unavailable. Logged in directly.'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/verify-code
// @desc    Step 2: Verify code and complete login
// @access  Public
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code, rememberDevice } = req.body;

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    // Verify the code
    const verificationResult = await verifyCode(email, code);

    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: verificationResult.message
      });
    }

    const user = verificationResult.user;

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Reset rate limits on successful login
    resetOtpRateLimit(email);
    resetLoginRateLimit(req.ip || req.connection.remoteAddress);

    // Add to trusted devices if requested
    let deviceInfo = null;
    if (rememberDevice) {
      const result = await addTrustedDevice(user._id, req, 30);
      if (result.success) {
        deviceInfo = {
          deviceName: result.deviceName,
          expiresAt: result.expiresAt
        };
      }
    }

    // Log login history
    const fullUser = await User.findById(user._id);
    fullUser.loginHistory.push({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceInfo: parseUserAgent(req.headers['user-agent']).deviceName,
      timestamp: new Date(),
      success: true,
      method: 'otp'
    });
    await fullUser.save();

    // Send login notification if enabled
    if (fullUser.securitySettings?.loginAlerts) {
      sendLoginNotification(fullUser, req, 'otp').catch(console.error);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      deviceRemembered: rememberDevice && deviceInfo ? true : false,
      deviceInfo
    });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/resend-code
// @desc    Resend verification code
// @access  Public
router.post('/resend-code', otpRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send new verification code
    const emailResult = await sendVerificationEmail(user._id, user.email, user.name);

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      expiresAt: emailResult.expiresAt
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login-with-backup
// @desc    Login using backup code
// @access  Public
router.post('/login-with-backup', loginRateLimiter, async (req, res) => {
  try {
    const { email, password, backupCode, rememberDevice } = req.body;

    if (!email || !password || !backupCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and backup code'
      });
    }

    // Check user and password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify backup code
    const backupResult = await verifyBackupCode(email, backupCode);
    
    if (!backupResult.success) {
      return res.status(401).json({
        success: false,
        message: backupResult.message
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Reset rate limits
    resetLoginRateLimit(req.ip || req.connection.remoteAddress);

    // Add to trusted devices if requested
    let deviceInfo = null;
    if (rememberDevice) {
      const result = await addTrustedDevice(user._id, req, 30);
      if (result.success) {
        deviceInfo = {
          deviceName: result.deviceName,
          expiresAt: result.expiresAt
        };
      }
    }

    // Log login history
    user.loginHistory.push({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceInfo: parseUserAgent(req.headers['user-agent']).deviceName,
      timestamp: new Date(),
      success: true,
      method: 'backup-code'
    });
    await user.save();

    // Send notification
    if (user.securitySettings?.loginAlerts) {
      sendLoginNotification(user, req, 'backup-code').catch(console.error);
    }

    res.json({
      success: true,
      message: 'Login successful with backup code',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      warning: backupResult.warning,
      remainingBackupCodes: backupResult.remainingCodes,
      deviceRemembered: rememberDevice && deviceInfo ? true : false
    });
  } catch (error) {
    console.error('Backup code login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/trusted-devices
// @desc    Get all trusted devices
// @access  Private
router.get('/trusted-devices', protect, async (req, res) => {
  try {
    const result = await getTrustedDevices(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/auth/trusted-devices/:deviceId
// @desc    Remove a trusted device
// @access  Private
router.delete('/trusted-devices/:deviceId', protect, async (req, res) => {
  try {
    const result = await removeTrustedDevice(req.user._id, req.params.deviceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/backup-codes/generate
// @desc    Generate new backup codes
// @access  Private
router.post('/backup-codes/generate', protect, async (req, res) => {
  try {
    const result = await generateBackupCodes(req.user._id, 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/backup-codes/status
// @desc    Get backup codes status
// @access  Private
router.get('/backup-codes/status', protect, async (req, res) => {
  try {
    const result = await getBackupCodesStatus(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/backup-codes
// @desc    Get all backup codes
// @access  Private
router.get('/backup-codes', protect, async (req, res) => {
  try {
    const showUsed = req.query.showUsed === 'true';
    const result = await getBackupCodes(req.user._id, showUsed);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/login-history
// @desc    Get login history
// @access  Private
router.get('/login-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loginHistory');
    
    const history = user.loginHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20) // Last 20 logins
      .map(login => ({
        ipAddress: login.ipAddress,
        deviceInfo: login.deviceInfo,
        timestamp: login.timestamp,
        success: login.success,
        method: login.method
      }));

    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/auth/security-settings
// @desc    Update security settings
// @access  Private
router.put('/security-settings', protect, async (req, res) => {
  try {
    const { twoFactorEnabled, emailNotifications, loginAlerts } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (twoFactorEnabled !== undefined) {
      user.securitySettings.twoFactorEnabled = twoFactorEnabled;
    }
    if (emailNotifications !== undefined) {
      user.securitySettings.emailNotifications = emailNotifications;
    }
    if (loginAlerts !== undefined) {
      user.securitySettings.loginAlerts = loginAlerts;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Security settings updated',
      settings: user.securitySettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
