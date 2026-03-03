import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  // Form states
  const [step, setStep] = useState(1); // 1: Login form, 2: Forgot password verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for code expiration
  useEffect(() => {
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

  // Step 1: Handle direct login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.login(formData);
      
      login(data.data, data.token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;
      
      // Check if email is not verified
      if (errorData?.emailNotVerified) {
        toast.error(errorData.message + '. Please check your email for verification code.');
        // Could redirect to a resend verification page here if needed
      } else {
        toast.error(errorData?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password - send code
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email: formData.email });
      toast.success(response.data.message || 'Password reset code sent to your email!');
      setStep(2);
      setExpiresAt(response.data.expiresAt);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email code and log in
  const handleVerifyResetCode = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPasswordWithEmail({
        email: formData.email,
        code: verificationCode
      });

      login(response.data.data, response.data.token);
      
      if (response.data.shouldChangePassword) {
        toast.success('Logged in! Please change your password in settings.');
      } else {
        toast.success('Login successful!');
      }
      
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // Resend password reset code
  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email: formData.email });
      toast.success('New code sent to your email!');
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
    <div className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-moon-night dark:via-moon-midnight dark:to-moon-night">
      <div className="card max-w-md w-full p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-center mb-2 dark:text-moon-silver">Welcome Back</h1>
              <p className="text-gray-600 dark:text-moon-silver/70 text-center mb-8">Login to your account</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-purple-600 dark:text-moon-gold hover:underline disabled:opacity-50"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600 dark:text-moon-silver/70">
                Don't have an account?{' '}
                <Link to="/register" className="text-vybe-purple dark:text-moon-gold font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 dark:bg-moon-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-moon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2 dark:text-moon-silver">Reset Password</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit code to
                </p>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  {formData.email}
                </p>
              </div>

              <form onSubmit={handleVerifyResetCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field text-center text-2xl tracking-widest dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
                    placeholder="000000"
                    autoFocus
                  />
                  {timeLeft && (
                    <p className={`text-sm text-center mt-2 ${timeLeft === 'Expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {timeLeft === 'Expired' ? 'Code expired' : `Expires in: ${timeLeft}`}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendCode}
                  disabled={loading || (timeLeft && timeLeft !== 'Expired')}
                  className="w-full text-purple-600 dark:text-purple-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
                  💡 Tip: After logging in, you can change your password in account settings
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
