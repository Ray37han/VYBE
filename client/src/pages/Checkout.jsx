import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCopy, FiShoppingBag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');

  const bkashNumber = '01747809138';
  const total = getTotal();
  const shipping = total >= 1000 ? 0 : 60;
  const finalTotal = total + shipping;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const validateStep1 = () => {
    const { fullName, phone, address, city } = shippingInfo;
    if (!fullName || !phone || !address || !city) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (phone.length < 11) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!transactionId || transactionId.trim().length < 5) {
      toast.error('Please enter a valid transaction ID');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          price: item.product.sizes.find(s => s.name === item.size)?.price || item.product.basePrice
        })),
        shippingAddress: {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode
        },
        paymentMethod: paymentMethod,
        paymentInfo: {
          method: paymentMethod,
          transactionId: transactionId,
          status: 'pending'
        },
        pricing: {
          subtotal: total,
          shipping: shipping,
          total: finalTotal
        },
        notes: shippingInfo.notes
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data?._id || response._id);
      clearCart();
      setStep(3);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return null;
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-vybe-purple text-white' : 'bg-gray-300'
              }`}>
                {step > 1 ? <FiCheck /> : '1'}
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-vybe-purple' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-vybe-purple text-white' : 'bg-gray-300'
              }`}>
                {step > 2 ? <FiCheck /> : '2'}
              </div>
              <div className={`w-24 h-1 ${step >= 3 ? 'bg-vybe-purple' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? 'bg-vybe-purple text-white' : 'bg-gray-300'
              }`}>
                {step > 3 ? <FiCheck /> : '3'}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2 text-sm">
            <div className="w-32 text-center">Shipping</div>
            <div className="w-32 text-center">Payment</div>
            <div className="w-32 text-center">Confirmation</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat no, Road no, Area"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      placeholder="Special instructions for delivery"
                    />
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full btn-primary mt-6"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="card p-6">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <div
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full border-2 border-pink-500 mr-3 flex items-center justify-center">
                          {paymentMethod === 'bkash' && (
                            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-pink-600 mr-3">bKash</span>
                          <span className="text-sm text-gray-600">Send Money / Payment</span>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-vybe-purple bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full border-2 border-vybe-purple mr-3 flex items-center justify-center">
                          {paymentMethod === 'cod' && (
                            <div className="w-3 h-3 rounded-full bg-vybe-purple"></div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold mr-3">Cash on Delivery</span>
                          <span className="text-sm text-gray-600">Pay when you receive</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* bKash Payment Instructions */}
                  {paymentMethod === 'bkash' && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-4 text-pink-700">
                        📱 bKash Payment Instructions
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Send Money to:</p>
                          <div className="flex items-center justify-between bg-pink-100 p-3 rounded">
                            <span className="text-xl font-bold text-pink-700">{bkashNumber}</span>
                            <button
                              onClick={() => copyToClipboard(bkashNumber)}
                              className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                            >
                              <FiCopy />
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Amount to Send:</p>
                          <div className="text-2xl font-bold text-pink-700">৳{finalTotal}</div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Open your bKash app</li>
                            <li>Select "Send Money"</li>
                            <li>Enter: <strong>{bkashNumber}</strong></li>
                            <li>Enter amount: <strong>৳{finalTotal}</strong></li>
                            <li>Enter your bKash PIN and confirm</li>
                            <li>Copy the Transaction ID from the confirmation message</li>
                            <li>Paste the Transaction ID below</li>
                          </ol>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            Enter Transaction ID *
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g., 9AB123456C"
                            className="input-field"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You'll receive the Transaction ID in the SMS from bKash
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Note */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-3 text-purple-700">
                        💵 Cash on Delivery
                      </h3>
                      <p className="text-gray-700">
                        Pay with cash when your order is delivered. Please keep the exact amount ready.
                      </p>
                      <div className="mt-4 bg-white rounded p-3">
                        <p className="text-sm text-gray-600">Amount to pay on delivery:</p>
                        <p className="text-2xl font-bold text-purple-700">৳{finalTotal}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 btn-outline"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || (paymentMethod === 'bkash' && !transactionId)}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We'll start processing it right away.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Order ID</p>
                  <p className="text-xl font-bold text-vybe-purple">{orderId}</p>
                </div>

                {paymentMethod === 'bkash' && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-pink-800">
                      ⏳ Your payment is being verified. You'll receive a confirmation email shortly.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="w-full btn-primary"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full btn-outline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-600">
                          Size: {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-vybe-purple">
                          ৳{(item.product.sizes.find(s => s.name === item.size)?.price || item.product.basePrice) * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>৳{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : `৳${shipping}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-green-600">🎉 Free shipping on orders over ৳1000</p>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-vybe-purple">৳{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
