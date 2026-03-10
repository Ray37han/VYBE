/**
 * Firebase Configuration - Phone Authentication
 * 
 * This module initializes Firebase with Phone Authentication support
 * using the modular SDK (v9+) for optimal bundle size and performance.
 * 
 * Features:
 * - Phone OTP authentication
 * - Invisible reCAPTCHA
 * - Bangladesh phone number support (+880)
 * - Production-ready security
 * 
 * @requires firebase/app
 * @requires firebase/auth
 */

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

/**
 * Firebase Configuration Object
 * 
 * **SECURITY NOTE:**
 * These values are safe to expose in client-side code as they identify
 * your Firebase project. Actual security is enforced by Firebase Security Rules.
 * 
 * **SETUP INSTRUCTIONS:**
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Phone Authentication in Authentication > Sign-in method
 * 3. Add your domain to authorized domains
 * 4. Copy your config values here or use .env variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDv0esck_-X4wCzeXT6rN8O7zz2n6sB3Ao",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vybe-web-9ffd6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vybe-web-9ffd6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vybe-web-9ffd6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "531333496419",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:531333496419:web:fe62be2153115c42690256"
};

/**
 * Initialize Firebase App
 * This must be called before using any Firebase services
 */
const app = initializeApp(firebaseConfig);

/**
 * Get Firebase Auth Instance
 * Used for all authentication operations
 */
const auth = getAuth(app);

/**
 * Configure Auth Settings
 * Set language to English (can be changed to Bengali if needed)
 */
auth.languageCode = 'en';

/**
 * Phone Number Utilities
 * Handles Bangladesh phone number formatting and validation
 */
export const phoneUtils = {
  /**
   * Format Bangladesh phone number to E.164 format (+880XXXXXXXXXX)
   * 
   * Accepts formats:
   * - 01XXXXXXXXX (11 digits)
   * - 8801XXXXXXXXX (13 digits)
   * - +8801XXXXXXXXX (14 digits with +)
   * 
   * @param {string} phone - Input phone number
   * @returns {string} Formatted phone number with +880 prefix
   * @throws {Error} If phone number is invalid
   */
  formatBangladeshPhone: (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different input formats
    if (cleaned.startsWith('880')) {
      // Already has country code
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('0')) {
      // Remove leading 0
      cleaned = cleaned.substring(1);
    }
    
    // Validate length (should be 10 digits after removing country code and leading 0)
    if (cleaned.length !== 10) {
      throw new Error('Invalid Bangladesh phone number. Must be 11 digits starting with 01.');
    }
    
    // Validate operator prefix (01X where X is 3-9)
    if (!cleaned.match(/^1[3-9]\d{8}$/)) {
      throw new Error('Invalid Bangladesh phone number. Must start with 013-019.');
    }
    
    // Return in E.164 format
    return `+880${cleaned}`;
  },

  /**
   * Validate if a phone number is a valid Bangladesh number
   * 
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidBangladeshPhone: (phone) => {
    try {
      phoneUtils.formatBangladeshPhone(phone);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Display format for Bangladesh phone numbers (01X-XXXX-XXXX)
   * 
   * @param {string} phone - Phone number to format
   * @returns {string} Display-friendly format
   */
  toDisplayFormat: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    let local = cleaned;
    
    if (cleaned.startsWith('880')) {
      local = '0' + cleaned.substring(3);
    } else if (!cleaned.startsWith('0')) {
      local = '0' + cleaned;
    }
    
    // Format as 01X-XXXX-XXXX
    return local.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
};

/**
 * Initialize Invisible reCAPTCHA Verifier
 * 
 * This creates an invisible reCAPTCHA that automatically verifies
 * the user without showing a challenge in most cases.
 * 
 * @param {string} containerId - DOM element ID for reCAPTCHA container
 * @param {Function} onSuccess - Callback when reCAPTCHA succeeds
 * @param {Function} onError - Callback when reCAPTCHA fails
 * @returns {RecaptchaVerifier} Configured verifier instance
 * 
 * **USAGE:**
 * ```jsx
 * <div id="recaptcha-container"></div>
 * 
 * const verifier = setupRecaptcha(
 *   'recaptcha-container',
 *   () => console.log('reCAPTCHA verified'),
 *   (error) => console.error('reCAPTCHA error:', error)
 * );
 * ```
 */
export const setupRecaptcha = (containerId = 'recaptcha-container', onSuccess, onError) => {
  // Clear any existing reCAPTCHA verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    } catch (error) {
      console.warn('Error clearing old verifier:', error);
    }
  }

  // Clear the DOM element to prevent "already rendered" error
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible', // Use invisible reCAPTCHA for better UX
    callback: (response) => {
      console.log('✅ reCAPTCHA verified successfully');
      if (onSuccess) onSuccess(response);
    },
    'expired-callback': () => {
      console.warn('⚠️ reCAPTCHA expired, need to retry');
      if (onError) onError(new Error('reCAPTCHA expired'));
    },
    'error-callback': (error) => {
      console.error('❌ reCAPTCHA error:', error);
      if (onError) onError(error);
    }
  });

  // Store globally for cleanup
  window.recaptchaVerifier = verifier;
  
  return verifier;
};

/**
 * Send OTP to Phone Number
 * 
 * Initiates phone authentication by sending a 6-digit OTP
 * to the provided phone number via SMS.
 * 
 * @param {string} phoneNumber - Phone number in E.164 format (+880XXXXXXXXXX)
 * @param {RecaptchaVerifier} recaptchaVerifier - Initialized reCAPTCHA verifier
 * @returns {Promise<ConfirmationResult>} Confirmation result for OTP verification
 * 
 * **USAGE:**
 * ```jsx
 * const verifier = setupRecaptcha('recaptcha-container');
 * const phone = '+8801712345678';
 * 
 * try {
 *   const confirmationResult = await sendOTP(phone, verifier);
 *   // Save confirmationResult for later verification
 * } catch (error) {
 *   console.error('Failed to send OTP:', error);
 * }
 * ```
 * 
 * **ERROR HANDLING:**
 * - auth/invalid-phone-number: Phone number format is invalid
 * - auth/too-many-requests: Too many SMS sent to this number
 * - auth/quota-exceeded: Daily SMS quota exceeded
 */
export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    console.log('📱 Sending OTP to:', phoneNumber);
    
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    
    console.log('✅ OTP sent successfully');
    return confirmationResult;
    
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to send OTP. Please try again.';
    
    // Check for reCAPTCHA error
    if (error.message && error.message.includes('reCAPTCHA has already been rendered')) {
      userMessage = 'Please refresh the page and try again.';
    } else {
      switch (error.code) {
        case 'auth/invalid-phone-number':
          userMessage = 'Invalid phone number format. Use +8801XXXXXXXXX';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many attempts. Please try again in 15 minutes.';
          break;
        case 'auth/quota-exceeded':
          userMessage = 'SMS quota exceeded. Please contact support.';
          break;
        case 'auth/captcha-check-failed':
          userMessage = 'Security verification failed. Please refresh and try again.';
          break;
        case 'auth/missing-phone-number':
          userMessage = 'Phone number is required.';
          break;
      }
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Verify OTP Code
 * 
 * Verifies the 6-digit OTP code entered by the user.
 * On success, returns the user credential with ID token.
 * 
 * @param {ConfirmationResult} confirmationResult - Result from sendOTP
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<UserCredential>} User credential with ID token
 * 
 * **USAGE:**
 * ```jsx
 * try {
 *   const userCredential = await verifyOTP(confirmationResult, '123456');
 *   const idToken = await userCredential.user.getIdToken();
 *   // Send idToken to backend for verification
 * } catch (error) {
 *   console.error('Invalid OTP:', error);
 * }
 * ```
 * 
 * **ERROR HANDLING:**
 * - auth/invalid-verification-code: OTP code is incorrect
 * - auth/code-expired: OTP code has expired (typically 5 minutes)
 */
export const verifyOTP = async (confirmationResult, otpCode) => {
  try {
    console.log('🔐 Verifying OTP code...');
    
    const result = await confirmationResult.confirm(otpCode);
    
    console.log('✅ OTP verified successfully');
    console.log('👤 User UID:', result.user.uid);
    
    return result;
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    
    let userMessage = 'Invalid verification code.';
    
    switch (error.code) {
      case 'auth/invalid-verification-code':
        userMessage = 'Invalid OTP code. Please check and try again.';
        break;
      case 'auth/code-expired':
        userMessage = 'OTP code expired. Please request a new code.';
        break;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Get Current User's ID Token
 * 
 * Retrieves the Firebase ID token for the currently authenticated user.
 * This token should be sent to your backend for verification.
 * 
 * @returns {Promise<string|null>} ID token or null if not authenticated
 * 
 * **USAGE:**
 * ```jsx
 * const token = await getCurrentUserToken();
 * if (token) {
 *   // Send to backend
 *   await fetch('/api/orders', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 * }
 * ```
 */
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('⚠️ No user is currently signed in');
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    console.log('✅ Retrieved ID token for user:', user.uid);
    return token;
  } catch (error) {
    console.error('❌ Failed to get ID token:', error);
    throw error;
  }
};

/**
 * Sign Out Current User
 * 
 * Signs out the current Firebase user and cleans up reCAPTCHA.
 * 
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await auth.signOut();
    
    // Clean up reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    throw error;
  }
};

// Export auth instance for advanced use cases
export { auth };

/**
 * Sign In With Google
 *
 * Opens the Google sign-in popup and returns the Firebase credential.
 * @returns {Promise<{user, idToken}>}
 */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
};

/**
 * Default Export - All Firebase Utilities
 */
export default {
  auth,
  phoneUtils,
  setupRecaptcha,
  sendOTP,
  verifyOTP,
  getCurrentUserToken,
  signOutUser,
  signInWithGoogle
};
