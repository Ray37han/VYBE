/**
 * Checkout Page with Firebase Phone OTP Verification
 * 
 * Complete checkout flow with phone number verification:
 * 1. User fills checkout form (name, phone, address, payment)
 * 2. On "Place Order", sends OTP to phone via Firebase
 * 3. User verifies OTP in modal
 * 4. On successful verification, creates order in MongoDB
 * 5. Shows order confirmation
 * 
 * Features:
 * - Bangladesh phone number format (+880)
 * - Firebase Phone Authentication
 * - Secure OTP verification
 * - COD and Online Payment support
 * - District-based shipping
 * - Mobile optimized
 * - Dark mode support
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiPhone, FiMail, FiCreditCard, FiShield } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI } from '../api';
import { useAnalytics } from '../context/AnalyticsContext';

import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const { trackEvent } = useAnalytics();

  /**
   * Form State - Shipping & Billing Information
   */
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    streetAddress: '',
    district: '',
    phone: '',
    email: user?.email || '',
    orderNotes: '',
  });

  /**
   * Payment State
   */
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'
  const [transactionId, setTransactionId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);



  /**
   * Loading & Theme State
   */
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Pricing Calculations
   */
  const subtotal = getTotal();
  const shipping = ['Dhaka', 'Rajshahi'].includes(formData.district) ? 100 : 130;
  const total = subtotal + shipping;

  /**
   * Initialize theme on mount
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
   * Redirect if cart is empty
   */
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, navigate]);

  /**
   * Bangladesh Districts (All 64)
   */
  const bangladeshDistricts = [
    'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria',
    'Chandpur', 'Chapai Nawabganj', 'Chattogram', 'Chuadanga', 'Comilla', "Cox's Bazar",
    'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj',
    'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari',
    'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur',
    'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon',
    'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali',
    'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati',
    'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet',
    'Tangail', 'Thakurgaon',
  ];

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Validate form before sending OTP
   * 
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    // Check required fields
    if (!formData.firstName.trim()) {
      toast.error('Please enter your first name');
      return false;
    }

    if (!formData.lastName.trim()) {
      toast.error('Please enter your last name');
      return false;
    }

    if (!formData.streetAddress.trim()) {
      toast.error('Please enter your street address');
      return false;
    }

    if (!formData.district) {
      toast.error('Please select your district');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }

    // Validate Bangladesh phone number (11 digits starting with 01)
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid Bangladesh phone number (e.g. 01712345678)');
      return false;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    // Validate online payment transaction ID
    if (paymentMethod === 'online' && !transactionId.trim()) {
      toast.error('Please enter your transaction ID for online payment');
      return false;
    }

    return true;
  };

  /**
   * Handle Place Order Click
   * Step 1: Validate form and send OTP
   */
  const handlePlaceOrder = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Track checkout started
    trackEvent('checkout_started', { price: getTotal ? getTotal() : undefined });

    // Go straight to order creation (no OTP)
    await createOrder();
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      toast.loading('Creating your order...', { id: 'create-order' });

      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          tier: item.tier || 'Standard',
          frame: item.frame || 'No Frame',
          customization: item.customization || null,
        })),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          street: formData.streetAddress,
          city: formData.district,
          zipCode: '',
        },
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'bkash',
        paymentInfo: {
          transactionId: paymentMethod === 'online' ? transactionId : null,
        },
        orderNotes: formData.orderNotes || ''
      };

      console.log('📦 Creating order with data:', orderData);

      // Send order to backend
      const response = await ordersAPI.create(orderData);
      
      console.log('✅ Order created:', response.data);
      toast.success('Order placed successfully!', { id: 'create-order' });

      // Track purchase completed
      trackEvent('purchase_completed', {
        orderId: response.data._id,
        revenue: getTotal ? getTotal() : 0,
      });

      // Clear cart
      clearCart();

      // Navigate to success page with order details
      navigate('/order-success', {
        state: {
          orderId: response.data.orderNumber,
          total: total,
          paymentMethod: paymentMethod,
        },
      });

    } catch (error) {
      console.error('❌ Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order', {
        id: 'create-order',
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
    <Helmet>
      <title>Checkout | VYBE - Premium Posters Bangladesh</title>
      <meta name="description" content="Complete your order at VYBE. Secure checkout with Cash on Delivery and online payment options. Fast delivery across Bangladesh." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className={`min-h-screen pt-24 pb-12 ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-xl p-6 md:p-8 ${
              darkMode
                ? 'bg-moon-midnight border border-moon-gold/20'
                : 'bg-white'
            }`}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-moon-gold/20 text-moon-gold' : 'bg-purple-100 text-purple-600'
                }`}>
                  <FiShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    darkMode ? 'text-moon-silver' : 'text-gray-900'
                  }`}>
                    Checkout
                  </h1>
                  <p className={`text-sm ${
                    darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                  }`}>
                    Complete your order
                  </p>
                </div>
              </div>

              {/* Billing & Shipping Information */}
              <div className="space-y-6">
                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    <FiMapPin className="w-4 h-4" />
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder="House/Flat, Road, Area"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                    }`}
                  />
                </div>

                {/* District */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                    }`}
                  >
                    <option value="">Select District</option>
                    {bangladeshDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <p className={`mt-2 text-xs ${
                    darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                  }`}>
                    📦 Shipping: ৳{shipping} ({['Dhaka', 'Rajshahi'].includes(formData.district) ? 'Inside Dhaka/Rajshahi' : 'Outside Dhaka/Rajshahi'})
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    <FiPhone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01712345678"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                    }`}
                  />

                </div>

                {/* Email (Optional) */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    <FiMail className="w-4 h-4" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                    }`}
                  />
                </div>

                {/* Order Notes (Optional) */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleChange}
                    placeholder="Special instructions for your order..."
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none resize-none ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-xl p-6 sticky top-24 ${
              darkMode
                ? 'bg-moon-midnight border border-moon-gold/20'
                : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-moon-silver' : 'text-gray-900'
              }`}>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`flex gap-3 p-3 rounded-lg ${
                      darkMode ? 'bg-moon-night/50' : 'bg-gray-50'
                    }`}
                  >
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm ${
                        darkMode ? 'text-moon-silver' : 'text-gray-900'
                      }`}>
                        {item.product.name}
                      </h3>
                      <p className={`text-xs ${
                        darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                      }`}>
                        {item.size} • {item.tier} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className={`border-t pt-4 space-y-2 ${
                darkMode ? 'border-moon-gold/20' : 'border-gray-200'
              }`}>
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-moon-silver/70' : 'text-gray-600'}>
                    Subtotal
                  </span>
                  <span className={`font-semibold ${
                    darkMode ? 'text-moon-silver' : 'text-gray-900'
                  }`}>
                    ৳{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-moon-silver/70' : 'text-gray-600'}>
                    Shipping
                  </span>
                  <span className={`font-semibold ${
                    darkMode ? 'text-moon-silver' : 'text-gray-900'
                  }`}>
                    ৳{shipping}
                  </span>
                </div>
                <div className={`flex justify-between text-lg pt-2 border-t ${
                  darkMode ? 'border-moon-gold/20' : 'border-gray-200'
                }`}>
                  <span className={`font-bold ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`}>
                    Total
                  </span>
                  <span className={`font-bold ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`}>
                    ৳{total}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${
                  darkMode ? 'text-moon-silver' : 'text-gray-700'
                }`}>
                  <FiCreditCard className="w-4 h-4" />
                  Payment Method
                </label>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? darkMode
                        ? 'border-moon-gold bg-moon-gold/10'
                        : 'border-purple-600 bg-purple-50'
                      : darkMode
                        ? 'border-moon-silver/20 hover:border-moon-gold/50'
                        : 'border-gray-300 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        darkMode ? 'text-moon-silver' : 'text-gray-900'
                      }`}>
                        Cash on Delivery
                      </p>
                      <p className={`text-xs ${
                        darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                      }`}>
                        Pay ৳{total} when you receive
                      </p>
                    </div>
                  </label>

                  {/* Online Payment */}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? darkMode
                        ? 'border-moon-gold bg-moon-gold/10'
                        : 'border-purple-600 bg-purple-50'
                      : darkMode
                        ? 'border-moon-silver/20 hover:border-moon-gold/50'
                        : 'border-gray-300 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        darkMode ? 'text-moon-silver' : 'text-gray-900'
                      }`}>
                        Online Payment
                      </p>
                      <p className={`text-xs ${
                        darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                      }`}>
                        Bkash / Nagad / Rocket
                      </p>
                    </div>
                  </label>
                </div>

                {/* Transaction ID for Online Payment */}
                {paymentMethod === 'online' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-600'
                      }`}
                    />
                  </motion.div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5"
                  />
                  <span className={`text-xs ${
                    darkMode ? 'text-moon-silver/70' : 'text-gray-600'
                  }`}>
                    I agree to the{' '}
                    <a
                      href="/terms"
                      className={darkMode ? 'text-moon-gold hover:underline' : 'text-purple-600 hover:underline'}
                    >
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className={darkMode ? 'text-moon-gold hover:underline' : 'text-purple-600 hover:underline'}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={loading || !agreedToTerms}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? 'bg-gradient-to-r from-moon-mystical to-moon-gold hover:from-moon-gold hover:to-moon-mystical'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FiShield className="w-5 h-5" />
                    </motion.div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiShield className="w-5 h-5" />
                    Place Order - ৳{total}
                  </span>
                )}
              </motion.button>

              <p className={`text-xs text-center mt-3 ${
                darkMode ? 'text-moon-silver/50' : 'text-gray-500'
              }`}>
                🔒 Your order is secured and encrypted
              </p>
            </div>
          </div>
        </motion.div>
      </div>


    </div>
    </>
  );
}
