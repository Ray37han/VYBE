import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendVerificationEmail, verifyCode, generateVerificationCode } from '../utils/emailVerification.js';
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
import { verifyIdToken } from '../config/firebase-admin.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user & send verification email
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

    // Create user with email unverified
    const user = await User.create({
      name,
      email,
      password,
      phone,
      emailVerified: false
    });

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for registration

    // Save verification code
    await User.findByIdAndUpdate(user._id, {
      verificationCode,
      codeExpires
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user._id, user.email, user.name, verificationCode, codeExpires);

    if (!emailResult.success) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      email: user.email,
      expiresAt: codeExpires,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login directly with email & password
// @access  Public
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // Check if email is verified (only for new users with emailVerified explicitly set to false)
    // Existing users (emailVerified = undefined) are allowed to login
    if (user.emailVerified === false) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        emailNotVerified: true
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

    // Generate token and log user in directly
    const token = generateToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Reset rate limits
    resetLoginRateLimit(req.ip || req.connection.remoteAddress);

    // Log login history (optional - don't fail login if this fails)
    try {
      if (user.loginHistory) {
        user.loginHistory.push({
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          deviceInfo: parseUserAgent(req.headers['user-agent']).deviceName,
          timestamp: new Date(),
          success: true,
          method: 'password'
        });
        await user.save();
      }
    } catch (historyError) {
      console.error('Failed to save login history:', historyError.message);
      // Continue with login even if history save fails
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address after registration
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

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

    // Mark email as verified
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      verificationCode: null,
      codeExpires: null
    });

    // Generate JWT token and log them in
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Reset rate limits
    resetOtpRateLimit(email);

    res.json({
      success: true,
      message: 'Email verified successfully! You are now logged in.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification code
// @access  Public
router.post('/resend-verification', otpRateLimiter, async (req, res) => {
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

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await User.findByIdAndUpdate(user._id, {
      verificationCode,
      codeExpires
    });

    // Send new verification code
    const emailResult = await sendVerificationEmail(user._id, user.email, user.name, verificationCode, codeExpires);

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      expiresAt: emailResult.expiresAt || codeExpires
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset code via email
// @access  Public
router.post('/forgot-password', otpRateLimiter, async (req, res) => {
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
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.'
      });
    }

    // Generate verification code for password reset
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to user
    await User.findByIdAndUpdate(user._id, {
      verificationCode,
      codeExpires
    });

    // Send password reset email
    const emailResult = await sendVerificationEmail(user._id, user.email, user.name, verificationCode, codeExpires);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      email: user.email,
      expiresAt: codeExpires
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/reset-password-with-email
// @desc    Verify email code and log user in (password reset flow)
// @access  Public
router.post('/reset-password-with-email', async (req, res) => {
  try {
    const { email, code } = req.body;

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

    // Generate JWT token and log them in
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Reset rate limits
    resetOtpRateLimit(email);
    resetLoginRateLimit(req.ip || req.connection.remoteAddress);

    res.json({
      success: true,
      message: 'Email verified! You are now logged in. Please change your password in settings.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      shouldChangePassword: true
    });
  } catch (error) {
    console.error('Reset password with email error:', error);
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

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/google-login
// @desc    Sign in or register via Google (Firebase)
// @access  Public
router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token is required.' });
    }

    // Verify the Firebase token server-side
    const decoded = await verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account must have an email.' });
    }

    // Find or create the user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        emailVerified: true,
        avatar: picture || '',
        authProvider: 'google',
        firebaseUid: uid,
      });
    } else if (!user.firebaseUid) {
      // Link firebase UID to existing account
      user.firebaseUid = uid;
      user.emailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Google authentication failed.' });
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
