/**
 * OTPVerification Component
 * 
 * A modern, mobile-optimized OTP input component for phone verification.
 * 
 * Features:
 * - 6-digit OTP input with auto-focus
 * - Paste support (auto-fills all inputs)
 * - Backspace navigation
 * - Auto-submit on complete
 * - Resend cooldown (60 seconds)
 * - Loading states
 * - Error handling
 * - Dark mode support
 * - Accessible (keyboard navigation)
 * 
 * @component
 */

import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiRefreshCw, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * OTPVerification Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.phoneNumber - Phone number OTP was sent to (for display)
 * @param {Function} props.onVerify - Callback when OTP is verified (receives OTP code)
 * @param {Function} props.onResend - Callback to resend OTP
 * @param {Function} props.onCancel - Callback to cancel verification
 * @param {boolean} props.isVerifying - Loading state during verification
 * @param {string} props.error - Error message to display
 * @param {boolean} props.darkMode - Dark mode flag
 */
function OTPVerification({
  phoneNumber,
  onVerify,
  onResend,
  onCancel,
  isVerifying = false,
  error = '',
  darkMode = false,
}) {
  // OTP input state - 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // Resend cooldown timer (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Input refs for focus management
  const inputRefs = useRef([]);
  
  // Success animation state
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Countdown timer for resend button
   * Decrements every second until 0, then enables resend
   */
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  /**
   * Auto-focus first input on mount
   */
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  /**
   * Auto-submit when all 6 digits are entered
   */
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !isVerifying) {
      handleVerify(otpString);
    }
  }, [otp]);

  /**
   * Handle input change for a single digit
   * 
   * @param {number} index - Index of the input (0-5)
   * @param {string} value - New value
   */
  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste (if multiple characters)
    if (value.length > 1) {
      handlePaste(value);
      return;
    }
    
    // Update single digit
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle paste event
   * Automatically fills all inputs with pasted OTP
   * 
   * @param {string} pastedValue - Pasted text
   */
  const handlePaste = (pastedValue) => {
    // Extract only digits
    const digits = pastedValue.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 0) return;
    
    const newOtp = [...otp];
    
    // Fill inputs with pasted digits
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
    
    toast.success('OTP pasted!');
  };

  /**
   * Handle backspace key
   * Deletes current digit and moves to previous input
   * 
   * @param {number} index - Current input index
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current digit
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle OTP verification
   * Calls parent's onVerify callback
   * 
   * @param {string} otpString - Complete 6-digit OTP
   */
  const handleVerify = async (otpString) => {
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }
    
    try {
      await onVerify(otpString);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by parent
      // Shake animation on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  /**
   * Handle resend OTP
   * Resets timer and calls parent's onResend callback
   */
  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendCooldown(60);
    setOtp(['', '', '', '', '', '']);
    
    try {
      await onResend();
      toast.success('OTP sent!');
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
      setCanResend(true);
      setResendCooldown(0);
    }
  };

  /**
   * Format phone number for display
   * Masks middle digits for privacy
   * 
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone (e.g., +880 17** ***678)
   */
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    
    // Extract country code and number
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('880')) {
      const countryCode = '+880';
      const number = cleaned.substring(3);
      const first3 = number.substring(0, 3);
      const last3 = number.substring(number.length - 3);
      return `${countryCode} ${first3}** ***${last3}`;
    }
    
    return phone;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      darkMode ? 'bg-moon-night/95' : 'bg-black/50'
    } backdrop-blur-sm`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-moon-midnight to-moon-night border border-moon-gold/20'
            : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${
          darkMode ? 'border-moon-gold/20' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                darkMode
                  ? 'bg-moon-gold/20 text-moon-gold'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-moon-silver' : 'text-gray-900'
                }`}>
                  Verify Phone Number
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                }`}>
                  Enter the 6-digit code
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onCancel}
              disabled={isVerifying}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-moon-silver/10 text-moon-silver/60'
                  : 'hover:bg-gray-100 text-gray-400'
              }`}
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <p className={`text-sm ${
            darkMode ? 'text-moon-silver/70' : 'text-gray-600'
          }`}>
            We sent a code to{' '}
            <span className="font-semibold">
              {formatPhoneForDisplay(phoneNumber)}
            </span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="p-6">
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePaste(e.clipboardData.getData('text'));
                }}
                disabled={isVerifying || isSuccess}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:scale-110 ${
                  darkMode
                    ? `bg-moon-night/50 border-moon-gold/30 text-moon-silver
                       focus:border-moon-gold focus:bg-moon-midnight
                       ${error ? 'border-red-500/50 bg-red-500/10' : ''}
                       ${digit ? 'border-moon-gold bg-moon-midnight' : ''}`
                    : `bg-gray-50 border-gray-300 text-gray-900
                       focus:border-purple-600 focus:bg-white
                       ${error ? 'border-red-500 bg-red-50' : ''}
                       ${digit ? 'border-purple-600 bg-purple-50' : ''}`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  animation: error ? 'shake 0.5s' : 'none'
                }}
              />
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-3 mb-4 rounded-lg ${
                  darkMode
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                <FiX className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 p-3 mb-4 rounded-lg ${
                  darkMode
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-green-50 border border-green-200 text-green-600'
                }`}
              >
                <FiCheck className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">Verified successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verify Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.join('').length !== 6 || isVerifying || isSuccess}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode
                ? 'bg-gradient-to-r from-moon-mystical to-moon-gold hover:from-moon-gold hover:to-moon-mystical'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.div>
                Verifying...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <FiCheck className="w-5 h-5" />
                Verified!
              </span>
            ) : (
              'Verify OTP'
            )}
          </motion.button>

          {/* Resend Section */}
          <div className="mt-4 text-center">
            <p className={`text-sm mb-2 ${
              darkMode ? 'text-moon-silver/60' : 'text-gray-600'
            }`}>
              Didn't receive the code?
            </p>
            
            {canResend ? (
              <button
                onClick={handleResend}
                className={`text-sm font-semibold transition-colors ${
                  darkMode
                    ? 'text-moon-gold hover:text-moon-gold/80'
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Resend Code
              </button>
            ) : (
              <p className={`text-sm font-semibold ${
                darkMode ? 'text-moon-silver/40' : 'text-gray-400'
              }`}>
                Resend in {resendCooldown}s
              </p>
            )}
          </div>

          {/* Help Text */}
          <p className={`mt-4 text-xs text-center ${
            darkMode ? 'text-moon-silver/50' : 'text-gray-500'
          }`}>
            💡 Tip: You can paste the OTP code directly
          </p>
        </div>
      </motion.div>

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

// Memoize component for performance - prevent unnecessary re-renders
export default memo(OTPVerification);
