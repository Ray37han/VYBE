/**
 * Order Success Page
 * 
 * Displays order confirmation after successful OTP verification and order placement.
 * Shows order details, tracking information, and next steps.
 * 
 * Features:
 * - Order number display
 * - Payment confirmation
 * - Delivery information
 * - Track order link
 * - Download invoice option
 * - Celebration animation
 * - Mobile optimized
 * - Dark mode support
 * 
 * @component
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiMapPin, FiClock, FiDownload, FiHome } from 'react-icons/fi';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Get order details from navigation state
  const orderDetails = location.state || {};
  const { orderId, total, paymentMethod } = orderDetails;

  /**
   * Initialize theme
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  /**
   * Redirect to home if no order details
   */
  useEffect(() => {
    if (!orderId) {
      console.warn('No order details found, redirecting to home');
      navigate('/');
    }
  }, [orderId, navigate]);

  /**
   * Celebration confetti animation
   */
  useEffect(() => {
    if (orderId) {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#EC4899', '#F59E0B'],
      });

      // Secondary burst after delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#9333EA', '#EC4899', '#F59E0B'],
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9333EA', '#EC4899', '#F59E0B'],
        });
      }, 400);
    }
  }, [orderId]);

  /**
   * Estimated delivery calculation
   */
  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // 3 days delivery
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!orderId) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
    <Helmet>
      <title>Order Confirmed! | VYBE Bangladesh</title>
      <meta name="description" content="Your order has been placed successfully. Thank you for shopping with VYBE!" />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-2xl overflow-hidden ${
            darkMode
              ? 'bg-moon-midnight border border-moon-gold/20'
              : 'bg-white'
          }`}
        >
          {/* Success Header */}
          <div className={`p-8 text-center ${
            darkMode
              ? 'bg-gradient-to-r from-moon-mystical/20 to-moon-gold/20'
              : 'bg-gradient-to-r from-purple-50 to-pink-50'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-green-100 text-green-600'
              }`}>
                <FiCheckCircle className="w-12 h-12" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl md:text-4xl font-bold mb-2 ${
                darkMode ? 'text-moon-silver' : 'text-gray-900'
              }`}
            >
              Order Placed Successfully! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-lg ${
                darkMode ? 'text-moon-silver/70' : 'text-gray-600'
              }`}>
              Thank you for your purchase! Your order has been verified and confirmed.
            </motion.p>
          </div>

          {/* Order Details */}
          <div className="p-8 space-y-6">
            {/* Order Number */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-xl border-2 ${
                darkMode
                  ? 'bg-moon-night/50 border-moon-gold/30'
                  : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className={`text-sm font-semibold mb-1 ${
                    darkMode ? 'text-moon-silver/60' : 'text-gray-600'
                  }`}>
                    Order Number
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`}>
                    #{orderId}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    darkMode
                      ? 'bg-moon-gold/20 text-moon-gold hover:bg-moon-gold/30'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  <FiDownload className="inline mr-2" />
                  Download Invoice
                </motion.button>
              </div>
            </motion.div>

            {/* Payment & Amount */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-2 gap-4"
            >
              <div className={`p-5 rounded-xl ${
                darkMode ? 'bg-moon-night/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <FiPackage className="w-5 h-5" />
                  </div>
                  <p className={`font-semibold ${
                    darkMode ? 'text-moon-silver/70' : 'text-gray-600'
                  }`}>
                    Total Amount
                  </p>
                </div>
                <p className={`text-2xl font-bold ${
                  darkMode ? 'text-moon-silver' : 'text-gray-900'
                }`}>
                  ৳{total}
                </p>
              </div>

              <div className={`p-5 rounded-xl ${
                darkMode ? 'bg-moon-night/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <p className={`font-semibold ${
                    darkMode ? 'text-moon-silver/70' : 'text-gray-600'
                  }`}>
                    Payment Method
                  </p>
                </div>
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-moon-silver' : 'text-gray-900'
                }`}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Paid)'}
                </p>
              </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`p-6 rounded-xl ${
                darkMode
                  ? 'bg-gradient-to-r from-moon-blue/10 to-moon-mystical/10 border border-moon-gold/20'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                }`}>
                  <FiClock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-900'
                  }`}>
                    Estimated Delivery
                  </h3>
                  <p className={`text-sm mb-3 ${
                    darkMode ? 'text-moon-silver/70' : 'text-gray-600'
                  }`}>
                    Your order will be delivered by:
                  </p>
                  <p className={`text-xl font-bold ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`}>
                    {getEstimatedDelivery()}
                  </p>
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-moon-silver/50' : 'text-gray-500'
                  }`}>
                    📦 We'll send you tracking updates via SMS
                  </p>
                </div>
              </div>
            </motion.div>

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`p-6 rounded-xl border-2 border-dashed ${
                darkMode
                  ? 'border-moon-gold/30 bg-moon-night/30'
                  : 'border-purple-300 bg-purple-50/50'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${
                darkMode ? 'text-moon-silver' : 'text-gray-900'
              }`}>
                📋 What's Next?
              </h3>
              <ul className={`space-y-3 ${
                darkMode ? 'text-moon-silver/70' : 'text-gray-600'
              }`}>
                <li className="flex items-start gap-3">
                  <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    1
                  </span>
                  <span>We'll review and prepare your order (usually within 24 hours)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    2
                  </span>
                  <span>You'll receive SMS updates when your order ships</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    3
                  </span>
                  <span>
                    {paymentMethod === 'cod' 
                      ? 'Prepare exact cash amount for delivery'
                      : 'Your payment has been confirmed'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                  }`}>
                    4
                  </span>
                  <span>Delivery partner will contact you before delivery</span>
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/my-orders"
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-center transition-all shadow-lg hover:shadow-xl ${
                  darkMode
                    ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:from-moon-gold hover:to-moon-mystical'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                <FiPackage className="inline mr-2" />
                Track My Order
              </Link>

              <Link
                to="/products"
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-center transition-all border-2 ${
                  darkMode
                    ? 'border-moon-gold/30 text-moon-gold hover:bg-moon-gold/10'
                    : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                }`}
              >
                <FiHome className="inline mr-2" />
                Continue Shopping
              </Link>
            </motion.div>

            {/* Support Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`text-center text-sm ${
                darkMode ? 'text-moon-silver/50' : 'text-gray-500'
              }`}
            >
              <p>
                Need help? Contact us at{' '}
                <a
                  href="tel:+8801234567890"
                  className={darkMode ? 'text-moon-gold hover:underline' : 'text-purple-600 hover:underline'}
                >
                  +880 1234-567890
                </a>
                {' '}or{' '}
                <a
                  href="mailto:support@vybe.bd"
                  className={darkMode ? 'text-moon-gold hover:underline' : 'text-purple-600 hover:underline'}
                >
                  support@vybe.bd
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
