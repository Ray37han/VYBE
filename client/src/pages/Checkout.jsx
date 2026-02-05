import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    streetAddress: '',
    district: '',
    phone: '',
    email: user?.email || '',
    orderNotes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const subtotal = getTotal();
  // Dynamic shipping cost based on district
  const shippingCost = (formData.district === 'Dhaka' || formData.district === 'Rajshahi') ? 100 : 130;
  const total = subtotal + shippingCost;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme ? savedTheme === 'dark' : true);

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

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { firstName, lastName, streetAddress, district, phone } = formData;
    
    if (!firstName || !lastName) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!streetAddress) {
      toast.error('Please enter your street address');
      return false;
    }
    if (!district) {
      toast.error('Please select your district');
      return false;
    }
    if (!phone || phone.length < 11) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    if (paymentMethod === 'online' && !transactionId) {
      toast.error('Please enter your Bkash transaction ID');
      return false;
    }
    if (paymentMethod === 'cod' && !transactionId) {
      toast.error('Please enter your Bkash transaction ID for delivery charge payment');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          tier: item.tier || 'Standard',
          price:
            item.product.sizes.find(
              (s) => s.name === item.size && (s.tier || 'Standard') === (item.tier || 'Standard')
            )?.price ||
            item.product.sizes.find((s) => s.name === item.size && !s.tier)?.price ||
            item.product.basePrice
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.streetAddress,
          city: formData.district,
          postalCode: ''
        },
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'bkash',
        paymentInfo: {
          method: paymentMethod === 'cod' ? 'cod' : 'bkash',
          transactionId: transactionId || 'COD',
          status: 'pending'
        },
        pricing: {
          subtotal: subtotal,
          shipping: shippingCost,
          total: total
        },
        notes: formData.orderNotes
      };

      const response = await ordersAPI.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-success', { state: { orderId: response.data?._id || response._id } });
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`pt-24 pb-12 px-4 sm:px-6 min-h-screen transition-colors duration-500 ${
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
          {/* Billing & Shipping Form */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-lg p-8 ${
              darkMode ? 'bg-moon-midnight/50 border border-moon-gold/20' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${
                darkMode ? 'text-moon-gold' : 'text-gray-900'
              }`}>
                BILLING & SHIPPING
              </h2>

              <div className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      autoComplete="given-name"
                      autoCorrect="off"
                      spellCheck="false"
                      autoCapitalize="words"
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:ring-2 focus:ring-purple-500/20`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      autoComplete="family-name"
                      autoCorrect="off"
                      spellCheck="false"
                      autoCapitalize="words"
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:ring-2 focus:ring-purple-500/20`}
                      required
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    Street address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="House number and street name"
                    autoComplete="street-address"
                    autoCorrect="off"
                    spellCheck="false"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:ring-2 focus:ring-purple-500/20`}
                    required
                  />
                </div>

                {/* District */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:ring-2 focus:ring-purple-500/20`}
                    required
                  >
                    <option value="">Select a district...</option>
                    <option value="Bagerhat">Bagerhat</option>
                    <option value="Bandarban">Bandarban</option>
                    <option value="Barguna">Barguna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Bhola">Bhola</option>
                    <option value="Bogura">Bogura</option>
                    <option value="Brahmanbaria">Brahmanbaria</option>
                    <option value="Chandpur">Chandpur</option>
                    <option value="Chapai Nawabganj">Chapai Nawabganj</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Chuadanga">Chuadanga</option>
                    <option value="Cox's Bazar">Cox's Bazar</option>
                    <option value="Cumilla">Cumilla</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Dinajpur">Dinajpur</option>
                    <option value="Faridpur">Faridpur</option>
                    <option value="Feni">Feni</option>
                    <option value="Gaibandha">Gaibandha</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Gopalganj">Gopalganj</option>
                    <option value="Habiganj">Habiganj</option>
                    <option value="Jamalpur">Jamalpur</option>
                    <option value="Jashore">Jashore</option>
                    <option value="Jhalokathi">Jhalokathi</option>
                    <option value="Jhenaidah">Jhenaidah</option>
                    <option value="Joypurhat">Joypurhat</option>
                    <option value="Khagrachari">Khagrachari</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Kishoreganj">Kishoreganj</option>
                    <option value="Kurigram">Kurigram</option>
                    <option value="Kushtia">Kushtia</option>
                    <option value="Lakshmipur">Lakshmipur</option>
                    <option value="Lalmonirhat">Lalmonirhat</option>
                    <option value="Madaripur">Madaripur</option>
                    <option value="Magura">Magura</option>
                    <option value="Manikganj">Manikganj</option>
                    <option value="Meherpur">Meherpur</option>
                    <option value="Moulvibazar">Moulvibazar</option>
                    <option value="Munshiganj">Munshiganj</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Naogaon">Naogaon</option>
                    <option value="Narail">Narail</option>
                    <option value="Narayanganj">Narayanganj</option>
                    <option value="Narsingdi">Narsingdi</option>
                    <option value="Natore">Natore</option>
                    <option value="Netrokona">Netrokona</option>
                    <option value="Nilphamari">Nilphamari</option>
                    <option value="Noakhali">Noakhali</option>
                    <option value="Pabna">Pabna</option>
                    <option value="Panchagarh">Panchagarh</option>
                    <option value="Patuakhali">Patuakhali</option>
                    <option value="Pirojpur">Pirojpur</option>
                    <option value="Rajbari">Rajbari</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Rangamati">Rangamati</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Satkhira">Satkhira</option>
                    <option value="Shariatpur">Shariatpur</option>
                    <option value="Sherpur">Sherpur</option>
                    <option value="Sirajganj">Sirajganj</option>
                    <option value="Sunamganj">Sunamganj</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Tangail">Tangail</option>
                    <option value="Thakurgaon">Thakurgaon</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:ring-2 focus:ring-purple-500/20`}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:ring-2 focus:ring-purple-500/20`}
                    required
                  />
                </div>

                {/* Additional Information */}
                <div className="pt-6 border-t border-opacity-20">
                  <h3 className={`text-xl font-bold mb-4 ${
                    darkMode ? 'text-moon-gold' : 'text-gray-900'
                  }`}>
                    ADDITIONAL INFORMATION
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      Order notes (optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-lg p-6 sticky top-24 ${
              darkMode ? 'bg-moon-midnight/50 border border-moon-gold/20' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-moon-gold' : 'text-gray-900'
              }`}>
                YOUR ORDER
              </h3>

              <div className={`flex justify-between text-sm font-semibold pb-3 mb-4 border-b ${
                darkMode ? 'border-moon-gold/20 text-moon-silver' : 'border-gray-200 text-gray-700'
              }`}>
                <span>PRODUCT</span>
                <span>SUBTOTAL</span>
              </div>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item._id} className={`flex justify-between text-sm ${
                    darkMode ? 'text-moon-silver' : 'text-gray-700'
                  }`}>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name} - {item.size} × {item.quantity}</p>
                    </div>
                    <div className="font-semibold ml-4">
                      ৳{(
                        item.product.sizes.find(
                          (s) => s.name === item.size && (s.tier || 'Standard') === (item.tier || 'Standard')
                        )?.price ||
                        item.product.sizes.find((s) => s.name === item.size && !s.tier)?.price ||
                        item.product.basePrice
                      ) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`flex justify-between py-3 border-t ${
                darkMode ? 'border-moon-gold/20' : 'border-gray-200'
              }`}>
                <span className={darkMode ? 'text-moon-silver' : 'text-gray-700'}>Subtotal</span>
                <span className={`font-semibold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                  ৳{subtotal}
                </span>
              </div>

              <div className={`flex justify-between py-3 border-t ${
                darkMode ? 'border-moon-gold/20' : 'border-gray-200'
              }`}>
                <span className={darkMode ? 'text-moon-silver' : 'text-gray-700'}>Shipping</span>
                <div className="text-right">
                  <p className={`font-semibold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                    ৳{shippingCost}
                  </p>
                </div>
              </div>

              <div className={`flex justify-between py-4 border-t text-lg font-bold ${
                darkMode ? 'border-moon-gold/20 text-moon-gold' : 'border-gray-200 text-gray-900'
              }`}>
                <span>Total</span>
                <span>৳{total}</span>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 space-y-3">
                <label className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? darkMode
                      ? 'border-moon-gold bg-moon-gold/10'
                      : 'border-blue-500 bg-blue-50'
                    : darkMode
                      ? 'border-moon-gold/30 hover:border-moon-gold/50'
                      : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Cash On Delivery
                    </p>
                    <p className="text-sm mt-1 opacity-80">Pay delivery charge (৳{shippingCost}) now, rest at delivery</p>
                  </div>
                </label>

                {/* COD Advance Payment Form */}
                {paymentMethod === 'cod' && (
                  <div className={`ml-8 p-4 rounded-lg ${
                    darkMode ? 'bg-moon-night/50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                      <strong>Bkash Number:</strong> 01747809138<br/>
                      Send ৳{shippingCost} (delivery charge) and enter your Transaction ID below:
                    </p>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      Bkash Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                )}

                <label className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? darkMode
                      ? 'border-moon-gold bg-moon-gold/10'
                      : 'border-blue-500 bg-blue-50'
                    : darkMode
                      ? 'border-moon-gold/30 hover:border-moon-gold/50'
                      : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Pay Online (Bkash/Nagad/Rocket)
                    </p>
                    <p className="text-sm mt-1 opacity-80">Pay full amount via mobile banking</p>
                  </div>
                </label>

                {paymentMethod === 'online' && (
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-moon-night/50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                      <strong>Bkash Number:</strong> 01747809138<br/>
                      Send ৳{total} and enter your Transaction ID below:
                    </p>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-700'
                    }`}>
                      Bkash Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Privacy Policy */}
              <div className={`mt-6 p-4 rounded-lg text-sm ${
                darkMode ? 'bg-moon-night/30 text-moon-silver/80' : 'bg-gray-50 text-gray-600'
              }`}>
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                <a href="#" className={darkMode ? 'text-moon-gold underline' : 'text-blue-600 underline'}>
                  privacy policy
                </a>.
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className={`ml-3 text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                  I have read and agree to the website{' '}
                  <a href="#" className={darkMode ? 'text-moon-gold underline' : 'text-blue-600 underline'}>
                    terms and conditions
                  </a>
                  ,{' '}
                  <a href="#" className={darkMode ? 'text-moon-gold underline' : 'text-blue-600 underline'}>
                    privacy policy
                  </a>
                  {' '}&{' '}
                  <a href="#" className={darkMode ? 'text-moon-gold underline' : 'text-blue-600 underline'}>
                    refund and returns policy
                  </a>
                  . <span className="text-red-500">*</span>
                </span>
              </label>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !agreedToTerms}
                className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all ${
                  loading || !agreedToTerms
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                      ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {loading ? 'Processing...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
