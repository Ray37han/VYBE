import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState(1); // 1: Registration form, 2: Email verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
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

  // Step 1: Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.register(formData);
      toast.success(data.message || 'Verification code sent to your email!');
      setStep(2);
      setExpiresAt(data.expiresAt);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email code
  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyEmail({
        email: formData.email,
        code: verificationCode
      });

      login(response.data.data, response.data.token);
      toast.success('Email verified! Welcome to VYBE!');
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
      const response = await authAPI.resendVerification({ email: formData.email });
      toast.success('New verification code sent!');
      setExpiresAt(response.data.expiresAt);
      setVerificationCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // Go back to registration form
  const handleBackToRegister = () => {
    setStep(1);
    setVerificationCode('');
    setExpiresAt(null);
    setTimeLeft(null);
  };

  return (
    <>
    <Helmet>
      <title>Create Account | VYBE - Premium Posters Bangladesh</title>
      <meta name="description" content="Create your VYBE account. Get access to exclusive deals, order tracking, and personalized recommendations for premium posters." />
      <link rel="canonical" href="https://vybebd.store/register" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <div className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-moon-night dark:via-moon-midnight dark:to-moon-night">
      <div className="card max-w-md w-full p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-center mb-2 dark:text-moon-silver">Create Account</h1>
              <p className="text-gray-600 dark:text-moon-silver/70 text-center mb-8">Join VYBE today</p>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
                    placeholder="Your name"
                  />
                </div>

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
                  <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
                    placeholder="+880 1234567890"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600 dark:text-moon-silver/70">
                Already have an account?{' '}
                <Link to="/login" className="text-vybe-purple dark:text-moon-gold font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 dark:bg-moon-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-moon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2 dark:text-moon-silver">Verify Your Email</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit code to
                </p>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  {formData.email}
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
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
                  {loading ? 'Verifying...' : 'Verify Email'}
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
                  onClick={handleBackToRegister}
                  className="w-full text-gray-600 dark:text-gray-400 font-semibold hover:underline"
                >
                  ← Back to Registration
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 Tip: Check your spam folder if you don't see the email
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
