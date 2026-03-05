/**
 * Firebase Error Handler
 * 
 * Comprehensive error handling for Firebase operations
 * Provides user-friendly error messages for all scenarios
 */

/**
 * Firebase Error Codes and User-Friendly Messages
 * Maps technical Firebase errors to clear, actionable messages for Bangladesh users
 */
const errorMessages = {
  // Phone Authentication Errors
  'auth/invalid-phone-number': {
    title: '📱 Invalid Phone Number',
    message: 'Please enter a valid Bangladesh mobile number (e.g., 01712345678)',
    action: 'Check your number and try again',
    technical: 'The phone number format is incorrect'
  },
  
  'auth/missing-phone-number': {
    title: '📱 Phone Number Required',
    message: 'Please enter your phone number to continue',
    action: 'Enter your 11-digit mobile number',
    technical: 'Phone number is required but was not provided'
  },

  // OTP Verification Errors
  'auth/invalid-verification-code': {
    title: '❌ Wrong OTP Code',
    message: 'The verification code you entered is incorrect',
    action: 'Please check the code in your SMS and try again',
    technical: 'The OTP code does not match'
  },

  'auth/code-expired': {
    title: '⏰ OTP Expired',
    message: 'Your verification code has expired (valid for 5 minutes)',
    action: 'Request a new code and enter it within 5 minutes',
    technical: 'The verification code has passed its expiration time'
  },

  'auth/invalid-verification-id': {
    title: '🔒 Verification Failed',
    message: 'Verification session expired or invalid',
    action: 'Start over and request a new OTP code',
    technical: 'The verification ID is invalid or expired'
  },

  // reCAPTCHA Errors
  'auth/missing-app-credential': {
    title: '🤖 Verification Check Failed',
    message: 'Security verification could not be completed',
    action: 'Refresh the page and try again',
    technical: 'reCAPTCHA verification missing or failed'
  },

  'auth/captcha-check-failed': {
    title: '🤖 Security Check Failed',
    message: 'Could not verify that you\'re not a robot',
    action: 'Refresh the page and complete the security check',
    technical: 'reCAPTCHA verification failed'
  },

  // Network Errors
  'auth/network-request-failed': {
    title: '🌐 Connection Problem',
    message: 'Cannot connect to verification service',
    action: 'Check your internet connection and try again',
    technical: 'Network request failed due to connectivity issues'
  },

  'auth/timeout': {
    title: '⏱️ Request Timeout',
    message: 'The request took too long to complete',
    action: 'Check your internet speed and try again',
    technical: 'Request timed out before completion'
  },

  // Firebase Quota Errors
  'auth/quota-exceeded': {
    title: '⚠️ Service Temporarily Unavailable',
    message: 'Too many verification requests right now',
    action: 'Please try again in a few minutes',
    technical: 'Firebase quota exceeded for phone verification'
  },

  'auth/too-many-requests': {
    title: '⚠️ Too Many Attempts',
    message: 'You\'ve tried too many times from this device',
    action: 'Please wait 15 minutes before trying again',
    technical: 'Rate limit exceeded for this IP/device'
  },

  // Account/User Errors
  'auth/user-disabled': {
    title: '🚫 Account Disabled',
    message: 'This account has been disabled',
    action: 'Contact support for assistance',
    technical: 'User account has been disabled by admin'
  },

  'auth/operation-not-allowed': {
    title: '🚫 Phone Verification Unavailable',
    message: 'Phone verification is not enabled',
    action: 'Contact support to enable this feature',
    technical: 'Phone authentication is not enabled in Firebase'
  },

  // Token Errors
  'auth/invalid-credential': {
    title: '🔒 Invalid Credentials',
    message: 'The verification credentials are invalid',
    action: 'Start over and request a new OTP',
    technical: 'The auth credential is malformed or has expired'
  },

  'auth/credential-already-in-use': {
    title: '📱 Phone Already Registered',
    message: 'This phone number is already in use by another account',
    action: 'Try logging in instead',
    technical: 'Phone number is already linked to another account'
  },

  // Session/State Errors
  'auth/requires-recent-login': {
    title: '🔐 Session Expired',
    message: 'Your session has expired for security',
    action: 'Please log in again to continue',
    technical: 'This operation requires recent authentication'
  },

  // Bangladesh-Specific Errors
  'auth/unsupported-country': {
    title: '🌍 Country Not Supported',
    message: 'Phone verification is not available in your country',
    action: 'Contact support for alternative verification',
    technical: 'Bangladesh phone verification may require Firebase Blaze plan'
  },

  // Page Refresh During Verification
  'auth/missing-verification-code': {
    title: '🔄 Session Lost',
    message: 'Verification session was lost (page refreshed?)',
    action: 'Start over and avoid refreshing during OTP entry',
    technical: 'Verification code is missing - likely due to page refresh'
  },

  // Backend Validation Errors
  'VALIDATION_ERROR': {
    title: '❌ Invalid Information',
    message: 'Some information is missing or incorrect',
    action: 'Check your details and try again',
    technical: 'Server-side validation failed'
  },

  'PHONE_MISMATCH': {
    title: '📱 Phone Number Mismatch',
    message: 'The verified phone doesn\'t match your shipping phone',
    action: 'Use the same phone number you verified',
    technical: 'Phone number in order doesn\'t match verified number'
  },

  'DUPLICATE_ORDER': {
    title: '⚠️ Duplicate Order Detected',
    message: 'You recently placed an identical order',
    action: 'Check "My Orders" or wait before ordering again',
    technical: 'Same phone + total within 2 minutes'
  },

  'RATE_LIMIT_EXCEEDED': {
    title: '⏱️ Slow Down',
    message: 'Too many orders in a short time',
    action: 'Please wait 15 minutes before placing another order',
    technical: 'Rate limit exceeded: 5 orders per 15 minutes'
  },

  'PHONE_VERIFICATION_REQUIRED': {
    title: '🔒 Verification Required',
    message: 'Phone verification is required to place orders',
    action: 'Complete phone verification first',
    technical: 'Firebase token missing or invalid'
  }
};

/**
 * Get user-friendly error message from Firebase error
 * 
 * @param {Error} error - Firebase error object or custom error
 * @returns {Object} Error details with title, message, action, technical
 */
export function getErrorDetails(error) {
  // Handle custom error objects
  if (error?.error && errorMessages[error.error]) {
    return errorMessages[error.error];
  }

  // Handle Firebase errors
  const errorCode = error?.code || error?.message;
  
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // Handle network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return errorMessages['auth/network-request-failed'];
  }

  // Handle timeout errors
  if (error?.message?.includes('timeout')) {
    return errorMessages['auth/timeout'];
  }

  // Default error for unknown cases
  return {
    title: '❌ Something Went Wrong',
    message: 'An unexpected error occurred',
    action: 'Please try again or contact support if this persists',
    technical: error?.message || 'Unknown error'
  };
}

/**
 * Show error toast with user-friendly message
 * 
 * @param {Error} error - Error object
 * @param {Function} toastFn - Toast function (from react-hot-toast)
 * @param {boolean} showTechnical - Whether to log technical details
 */
export function showErrorToast(error, toastFn, showTechnical = true) {
  const errorDetails = getErrorDetails(error);
  
  // Log technical details for debugging
  if (showTechnical) {
    console.error('🔥 Firebase Error:', {
      code: error?.code,
      message: error?.message,
      details: errorDetails.technical,
      fullError: error
    });
  }

  // Show user-friendly toast
  toastFn.error(
    `${errorDetails.title}\n\n${errorDetails.message}\n\n💡 ${errorDetails.action}`,
    {
      duration: 6000,
      style: {
        maxWidth: '500px',
        padding: '16px',
        fontSize: '14px',
        lineHeight: '1.5'
      }
    }
  );
}

/**
 * Validate Bangladesh phone number with helpful feedback
 * 
 * @param {string} phone - Phone number to validate
 * @returns {Object} { valid: boolean, error: string, formatted: string }
 */
export function validateBangladeshPhone(phone) {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      error: '📱 Please enter your phone number',
      formatted: null
    };
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Check length
  if (cleaned.length !== 10) {
    return {
      valid: false,
      error: '📱 Phone number must be 11 digits (e.g., 01712345678)',
      formatted: null
    };
  }

  // Check operator prefix
  if (!cleaned.match(/^1[3-9]\d{8}$/)) {
    return {
      valid: false,
      error: '📱 Phone must start with 013-019 (e.g., 017, 018, 019)',
      formatted: null
    };
  }

  const formatted = `+880${cleaned}`;
  const displayFormat = `0${cleaned}`;

  return {
    valid: true,
    error: null,
    formatted,
    displayFormat,
    operator: getOperator(cleaned)
  };
}

/**
 * Get mobile operator from phone number
 * 
 * @param {string} cleaned - Cleaned 10-digit number
 * @returns {string} Operator name
 */
function getOperator(cleaned) {
  const prefix = cleaned.substring(1, 3);
  
  const operators = {
    '13': 'Grameenphone',
    '15': 'Teletalk',
    '16': 'Airtel',
    '17': 'Grameenphone',
    '18': 'Robi',
    '19': 'Banglalink'
  };

  return operators[prefix] || 'Unknown Operator';
}

/**
 * Handle page refresh during OTP verification
 * Stores state in sessionStorage to recover after refresh
 * 
 * @param {string} key - Storage key
 * @param {Object} data - Data to store
 */
export function saveVerificationState(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('⚠️ Could not save verification state:', error);
  }
}

/**
 * Restore verification state after page refresh
 * 
 * @param {string} key - Storage key
 * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
 * @returns {Object|null} Restored data or null
 */
export function restoreVerificationState(key, maxAge = 5 * 60 * 1000) {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const age = Date.now() - data.timestamp;

    // Only restore if within maxAge
    if (age > maxAge) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('⚠️ Could not restore verification state:', error);
    return null;
  }
}

/**
 * Clear verification state
 * 
 * @param {string} key - Storage key
 */
export function clearVerificationState(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('⚠️ Could not clear verification state:', error);
  }
}

export default {
  getErrorDetails,
  showErrorToast,
  validateBangladeshPhone,
  saveVerificationState,
  restoreVerificationState,
  clearVerificationState
};
