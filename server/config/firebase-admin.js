/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes Firebase Admin for server-side operations:
 * - Verifying Firebase ID tokens from client
 * - Authenticating phone-verified users
 * - Validating order security
 * 
 * **SETUP INSTRUCTIONS:**
 * 
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Select your project
 * 3. Go to Project Settings > Service Accounts
 * 4. Click "Generate New Private Key"
 * 5. Save the JSON file securely (NEVER commit to git!)
 * 6. Set environment variable FIREBASE_SERVICE_ACCOUNT_KEY with the JSON content
 * 
 * **SECURITY:**
 * - Service account key gives full access to Firebase
 * - Keep it secret and secure
 * - Never expose in client-side code
 * - Use environment variables
 * 
 * @module config/firebase-admin
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize Firebase Admin SDK
 * 
 * Supports two initialization methods:
 * 1. Service Account JSON (recommended for production)
 * 2. Application Default Credentials (for Google Cloud)
 */
let firebaseApp;

try {
  /**
   * Method 1: Service Account Key (Recommended)
   * 
   * Store your service account key as an environment variable:
   * FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."...}'
   * 
   * Or use a file path:
   * FIREBASE_SERVICE_ACCOUNT_PATH='/path/to/serviceAccountKey.json'
   */
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Parse JSON from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized with service account');
    
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Use file path - resolve relative to project root
    const filePath = resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'));
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized from file path');
    
  } else {
    /**
     * Method 2: Project ID only — allows token verification using Google's public keys.
     * No service account is required; the Admin SDK fetches public certs automatically.
     */
    const projectId = process.env.FIREBASE_PROJECT_ID || 'vybe-web-9ffd6';
    firebaseApp = admin.initializeApp({ projectId });
    console.log('✅ Firebase Admin initialized with projectId only (token verification mode)');
  }
  
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.warn('⚠️  Phone OTP verification will not work without Firebase Admin');
  console.warn('📝 Please configure FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
}

/**
 * Verify Firebase ID Token
 * 
 * Validates the token sent by the client after OTP verification.
 * Ensures the user successfully verified their phone number.
 * 
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<DecodedIdToken>} Decoded token with user info
 * @throws {Error} If token is invalid or expired
 * 
 * **USAGE in Express:**
 * ```javascript
 * const { verifyIdToken } = require('./config/firebase-admin');
 * 
 * router.post('/orders', async (req, res) => {
 *   try {
 *     const token = req.body.firebaseToken;
 *     const decodedToken = await verifyIdToken(token);
 *     
 *     console.log('User UID:', decodedToken.uid);
 *     console.log('Phone:', decodedToken.phone_number);
 *     
 *     // Create order...
 *   } catch (error) {
 *     res.status(401).json({ message: 'Unauthorized' });
 *   }
 * });
 * ```
 * 
 * **Decoded Token Contains:**
 * - uid: User's unique Firebase ID
 * - phone_number: Verified phone number (E.164 format)
 * - firebase: Object with sign_in_provider ('phone')
 * - auth_time: Unix timestamp of authentication
 * - exp: Token expiration time
 * - iat: Token issued at time
 */
export const verifyIdToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized. Phone OTP verification unavailable.');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    console.log('✅ Firebase token verified');
    console.log('👤 User UID:', decodedToken.uid);
    console.log('📱 Phone:', decodedToken.phone_number);
    console.log('🔐 Sign-in provider:', decodedToken.firebase.sign_in_provider);
    
    return decodedToken;
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.code);
    
    // Provide specific error messages
    let message = 'Invalid or expired token';
    
    switch (error.code) {
      case 'auth/id-token-expired':
        message = 'Token has expired. Please verify your phone again.';
        break;
      case 'auth/id-token-revoked':
        message = 'Token has been revoked. Please verify your phone again.';
        break;
      case 'auth/invalid-id-token':
        message = 'Invalid token format.';
        break;
      case 'auth/user-disabled':
        message = 'User account has been disabled.';
        break;
    }
    
    throw new Error(message);
  }
};

/**
 * Get User by UID
 * 
 * Retrieves user information from Firebase by their UID.
 * 
 * @param {string} uid - Firebase user UID
 * @returns {Promise<UserRecord>} User record
 */
export const getUserByUID = async (uid) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    throw error;
  }
};

/**
 * Get User by Phone Number
 * 
 * Retrieves user information by their phone number.
 * 
 * @param {string} phoneNumber - Phone number in E.164 format (+880XXXXXXXXXX)
 * @returns {Promise<UserRecord>} User record
 */
export const getUserByPhoneNumber = async (phoneNumber) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    return userRecord;
  } catch (error) {
    console.error('❌ Failed to get user by phone:', error);
    throw error;
  }
};

/**
 * Revoke User Tokens
 * 
 * Revokes all refresh tokens for a user.
 * Useful for security (logout all sessions).
 * 
 * @param {string} uid - Firebase user UID
 * @returns {Promise<void>}
 */
export const revokeUserTokens = async (uid) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    await admin.auth().revokeRefreshTokens(uid);
    console.log('✅ Revoked tokens for user:', uid);
  } catch (error) {
    console.error('❌ Failed to revoke tokens:', error);
    throw error;
  }
};

/**
 * Optional Verification Middleware
 * 
 * Use this middleware to protect routes that require phone verification.
 * Checks if the request contains a valid Firebase token.
 * 
 * **USAGE:**
 * ```javascript
 * import { requirePhoneVerification } from './config/firebase-admin';
 * 
 * router.post('/orders', requirePhoneVerification, async (req, res) => {
 *   // req.user contains decoded Firebase token
 *   // req.user.phone_number is the verified phone
 *   
 *   const order = await Order.create({
 *     user: req.user.uid,
 *     phone: req.user.phone_number,
 *     // ...
 *   });
 * });
 * ```
 */
export const requirePhoneVerification = async (req, res, next) => {
  try {
    // Get token from header or body
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.firebaseToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Phone verification required. No token provided.',
      });
    }
    
    // Verify token
    const decodedToken = await verifyIdToken(token);
    
    // Attach user info to request
    req.firebaseUser = decodedToken;
    req.verifiedPhone = decodedToken.phone_number;
    
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Phone verification failed',
    });
  }
};

/**
 * Optional Verification (Non-blocking)
 * 
 * Tries to verify token but doesn't block the request if it fails.
 * Useful for endpoints that work with or without phone verification.
 * 
 * If verification succeeds, req.firebaseUser will be populated.
 * If it fails, req.firebaseUser will be null.
 */
export const optionalPhoneVerification = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.firebaseToken;
    
    if (token) {
      const decodedToken = await verifyIdToken(token);
      req.firebaseUser = decodedToken;
      req.verifiedPhone = decodedToken.phone_number;
    }
  } catch (error) {
    console.warn('⚠️  Optional phone verification failed:', error.message);
  }
  
  next();
};

// Export admin instance for advanced use cases
export default admin;

/**
 * Example: Verify Token and Check Phone Match
 * 
 * ```javascript
 * const { verifyIdToken } = require('./config/firebase-admin');
 * 
 * router.post('/orders', async (req, res) => {
 *   const { firebaseToken, shippingAddress } = req.body;
 *   
 *   try {
 *     // Verify Firebase token
 *     const decodedToken = await verifyIdToken(firebaseToken);
 *     
 *     // Ensure phone number matches the verified one
 *     if (decodedToken.phone_number !== shippingAddress.phone) {
 *       return res.status(400).json({
 *         message: 'Phone number mismatch. Use the verified number.'
 *       });
 *     }
 *     
 *     // Create order with verified phone
 *     const order = await Order.create({
 *       ...req.body,
 *       phoneVerified: true,
 *       verifiedBy: 'firebase-otp',
 *       firebaseUid: decodedToken.uid,
 *     });
 *     
 *     res.json({ success: true, order });
 *     
 *   } catch (error) {
 *     res.status(401).json({ message: 'Verification failed' });
 *   }
 * });
 * ```
 */
