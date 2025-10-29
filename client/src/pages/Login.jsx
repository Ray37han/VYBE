import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  // Form states
  const [step, setStep] = useState(1); // 1: Login form, 2: OTP verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Countdown timer for OTP expiration
  useState(() => {
    if (expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const difference = expiry - now;

        if (difference > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Expired');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expiresAt]);

  // Step 1: Handle login and request OTP
  const handleLoginRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.login(formData);
      
      // Check if verification is required
      if (data.requiresVerification) {
        toast.success('Verification code sent to your email!');
        setStep(2);
        setExpiresAt(data.expiresAt);
      } else {
        // Direct login (fallback if email service fails)
        login(data.data, data.token);
        toast.success(data.message || 'Login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyCode({
        email: formData.email,
        code: verificationCode
      });

      login(response.data.data, response.data.token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await authAPI.resendCode({ email: formData.email });
      toast.success('New verification code sent!');
      setExpiresAt(response.data.expiresAt);
      setVerificationCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Go back to login form
  const handleBackToLogin = () => {
    setStep(1);
    setVerificationCode('');
    setExpiresAt(null);
    setTimeLeft(null);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="card max-w-md w-full p-8 bg-white dark:bg-gray-800">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Login to your VYBE account
              </p>

              <form onSubmit={handleLoginRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  {formData.email}
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field w-full px-4 py-4 border rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="000000"
                    autoFocus
                  />
                  {timeLeft && (
                    <p className={`text-sm text-center mt-2 ${timeLeft === 'Expired' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {timeLeft === 'Expired' ? '⏰ Code expired' : `⏱️ Expires in ${timeLeft}`}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full btn-primary bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full text-purple-600 dark:text-purple-400 font-semibold hover:underline disabled:opacity-50"
                >
                  📧 Resend Code
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="w-full text-gray-600 dark:text-gray-400 font-semibold hover:underline"
                >
                  ← Back to Login
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>💡 Tip:</strong> Check your spam folder if you don't see the email within a minute.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
