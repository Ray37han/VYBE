import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import { signInWithGoogle } from '../firebase';
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
      toast.error(error.response?.data?.message || 'Failed to send code');
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

  // Google sign-in
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      const { data } = await authAPI.googleLogin({ idToken });
      login(data.data, data.token);
      toast.success('Logged in with Google!');
      navigate('/');
    } catch (error) {
      // Show the real Firebase error (e.g. auth/unauthorized-domain) or backend message
      const msg = error.response?.data?.message || error.message || 'Google sign-in failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

              {/* Divider */}
              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-gray-200 dark:border-moon-gold/20" />
                <span className="mx-3 text-sm text-gray-400 dark:text-moon-silver/50">or</span>
                <div className="flex-1 border-t border-gray-200 dark:border-moon-gold/20" />
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-moon-gold/20 rounded-lg bg-white dark:bg-moon-midnight/60 hover:bg-gray-50 dark:hover:bg-moon-midnight text-gray-700 dark:text-moon-silver font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>

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
