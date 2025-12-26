import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX, FiShoppingBag, FiMapPin, FiCreditCard, FiFileText } from 'react-icons/fi';
import { ordersAPI } from '../api';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/PageTransition';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { 
    icon: FiClock, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-600/20', 
    border: 'border-yellow-600/40',
    glow: 'shadow-yellow-500/20',
    label: 'Pending' 
  },
  processing: { 
    icon: FiPackage, 
    color: 'text-blue-400', 
    bg: 'bg-blue-600/20', 
    border: 'border-blue-600/40',
    glow: 'shadow-blue-500/20',
    label: 'Processing' 
  },
  shipped: { 
    icon: FiTruck, 
    color: 'text-moon-mystical', 
    bg: 'bg-moon-mystical/20', 
    border: 'border-moon-mystical/40',
    glow: 'shadow-moon-mystical/20',
    label: 'Shipped' 
  },
  delivered: { 
    icon: FiCheck, 
    color: 'text-green-400', 
    bg: 'bg-green-600/20', 
    border: 'border-green-600/40',
    glow: 'shadow-green-500/20',
    label: 'Delivered' 
  },
  cancelled: { 
    icon: FiX, 
    color: 'text-red-400', 
    bg: 'bg-red-600/20', 
    border: 'border-red-600/40',
    glow: 'shadow-red-500/20',
    label: 'Cancelled' 
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
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

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data || response || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen ${
        darkMode 
          ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night' 
          : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-20 h-20 border-4 rounded-full ${
            darkMode 
              ? 'border-moon-gold/20 border-t-moon-gold' 
              : 'border-purple-200 border-t-purple-600'
          }`}
        />
        <p className={`mt-6 text-lg animate-pulse-gpu ${
          darkMode ? 'text-moon-silver/60' : 'text-gray-600'
        }`}>
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className={`pt-28 pb-12 min-h-screen relative overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night' 
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Background Effects */}
      {darkMode && (
        <>
          <div className="absolute inset-0 hieroglyph-overlay opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-moon-mystical/5 via-transparent to-moon-gold/5 animate-pulse-slow-gpu gpu-accelerated"></div>
        </>
      )}
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-5xl font-bold mb-3 ${
            darkMode 
              ? 'moon-gradient-text animate-glow gpu-accelerated' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            {darkMode ? 'My Mystical Orders' : 'My Orders'}
          </h1>
          <p className={`text-lg ${darkMode ? 'text-moon-silver/70' : 'text-gray-600'}`}>
            Track your {darkMode ? 'essence ' : ''}journey
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-16 text-center rounded-2xl ${
              darkMode 
                ? 'card-moon' 
                : 'bg-white shadow-xl border border-purple-100'
            }`}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiShoppingBag className={`w-24 h-24 mx-auto mb-6 ${
                darkMode ? 'text-moon-gold/40' : 'text-purple-300'
              }`} />
            </motion.div>
            <h2 className={`text-3xl font-bold mb-3 ${
              darkMode ? 'text-moon-silver' : 'text-gray-900'
            }`}>
              No Orders Yet
            </h2>
            <p className={`mb-8 text-lg ${
              darkMode ? 'text-moon-silver/60' : 'text-gray-600'
            }`}>
              Start your collection and your orders will {darkMode ? 'manifest ' : 'appear '}here
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/products" 
                className={`inline-flex items-center space-x-2 px-8 py-4 text-white rounded-xl font-bold tracking-wide shadow-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-moon-mystical to-moon-gold hover:shadow-moon-gold/50' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50'
                }`}
              >
                <FiShoppingBag className="w-5 h-5" />
                <span>Explore Collection</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <StaggerContainer className="space-y-6">
            {orders.map((order, index) => {
              const StatusIcon = statusConfig[order.orderStatus]?.icon || FiPackage;
              const statusData = statusConfig[order.orderStatus] || statusConfig.pending;

              return (
                <StaggerItem key={order._id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`overflow-hidden border-2 transition-all duration-500 relative group rounded-2xl ${
                      darkMode
                        ? 'card-moon border-moon-gold/20 hover:border-moon-midnight hover:bg-moon-night/80'
                        : 'bg-white shadow-xl border-purple-100 hover:border-purple-300 hover:shadow-2xl'
                    }`}
                  >
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 ${
                      darkMode 
                        ? 'bg-gradient-to-br from-moon-midnight/0 via-moon-night/0 to-moon-midnight/90' 
                        : 'bg-gradient-to-br from-purple-50/0 via-pink-50/0 to-purple-100/50'
                    }`}></div>
                    
                    {/* Order Header */}
                    <div className={`p-6 border-b flex justify-between items-center flex-wrap gap-4 relative z-20 ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/20 group-hover:border-moon-midnight/50'
                        : 'bg-gray-50 border-gray-200 group-hover:border-purple-200'
                    }`}>
                      <div className="flex items-center gap-8">
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${
                            darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                          }`}>Order ID</p>
                          <p className={`font-bold text-lg transition-colors duration-300 ${
                            darkMode 
                              ? 'text-moon-gold group-hover:text-moon-silver' 
                              : 'text-purple-600 group-hover:text-purple-900'
                          }`}>{order.orderNumber}</p>
                        </motion.div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${
                            darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                          }`}>Date</p>
                          <p className={`font-medium transition-colors duration-300 ${
                            darkMode 
                              ? 'text-moon-silver group-hover:text-white' 
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${
                            darkMode ? 'text-moon-silver/60' : 'text-gray-500'
                          }`}>Total</p>
                          {/* Premium Minimal Price Tag */}
                          <motion.div
                            className="relative inline-block"
                            whileHover={{ scale: 1.05 }}
                          >
                            <p className={`font-bold text-2xl relative z-10 tracking-tight transition-colors duration-300 ${
                              darkMode 
                                ? 'text-moon-gold group-hover:text-white' 
                                : 'text-purple-600 group-hover:text-purple-900'
                            }`}>
                              ৳{order.pricing.total}
                            </p>
                            {/* Minimal underline accent */}
                            <motion.div 
                              className={`absolute bottom-0 left-0 h-0.5 ${
                                darkMode 
                                  ? 'bg-gradient-to-r from-moon-gold via-moon-mystical to-moon-gold' 
                                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600'
                              }`}
                              initial={{ width: 0 }}
                              whileInView={{ width: '100%' }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                            />
                          </motion.div>
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl ${statusData.bg} border ${statusData.border} shadow-lg ${statusData.glow} group-hover:bg-moon-midnight/50 transition-all duration-300`}
                      >
                        <StatusIcon className={`w-5 h-5 ${statusData.color} animate-pulse-slow`} />
                        <span className={`font-bold text-base ${statusData.color}`}>
                          {statusData.label}
                        </span>
                      </motion.div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 relative z-20">
                      <div className="space-y-4">
                        {order.items.map((item, itemIndex) => (
                          <motion.div 
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                            className={`flex gap-4 p-4 rounded-xl border transition-all duration-500 group/item ${
                              darkMode
                                ? 'bg-moon-midnight/30 border-moon-gold/10 hover:bg-moon-night/60 hover:border-moon-midnight'
                                : 'bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                            }`}
                          >
                            {item.product?.images?.[0] || item.image ? (
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <img
                                  src={item.product?.images?.[0]?.url || item.image}
                                  alt={item.product?.name || item.name || 'Product'}
                                  className={`w-24 h-24 object-cover rounded-lg border-2 transition-all duration-300 ${
                                    darkMode
                                      ? 'border-moon-gold/20 group-hover/item:border-moon-midnight'
                                      : 'border-purple-200 group-hover/item:border-purple-400'
                                  }`}
                                />
                              </motion.div>
                            ) : null}
                            <div className="flex-1">
                              <p className={`font-bold text-lg transition-colors duration-300 ${
                                darkMode 
                                  ? 'text-moon-silver group-hover/item:text-white' 
                                  : 'text-gray-900 group-hover/item:text-purple-900'
                              }`}>
                                {item.product?.name || item.name || 'Product'}
                              </p>
                              <p className={`text-sm mt-1 transition-colors duration-300 ${
                                darkMode 
                                  ? 'text-moon-silver/60 group-hover/item:text-moon-silver/80' 
                                  : 'text-gray-600 group-hover/item:text-gray-700'
                              }`}>
                                📏 Size: <span className={`font-semibold ${
                                  darkMode ? 'text-moon-silver' : 'text-gray-900'
                                }`}>{item.size}</span> | 
                                📦 Qty: <span className={`font-semibold ${
                                  darkMode ? 'text-moon-silver' : 'text-gray-900'
                                }`}>{item.quantity}</span>
                              </p>
                              {/* Premium Minimal Price Tag for Items */}
                              <motion.div
                                className="relative inline-block mt-2"
                                whileHover={{ scale: 1.05 }}
                              >
                                <p className={`text-lg font-bold relative z-10 tracking-tight transition-colors duration-300 ${
                                  darkMode 
                                    ? 'text-moon-gold group-hover/item:text-white' 
                                    : 'text-purple-600 group-hover/item:text-purple-900'
                                }`}>
                                  ৳{item.price * item.quantity}
                                </p>
                                {/* Minimal left accent bar */}
                                <motion.div 
                                  className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                                    darkMode 
                                      ? 'bg-gradient-to-b from-moon-mystical to-moon-gold' 
                                      : 'bg-gradient-to-b from-purple-600 to-pink-600'
                                  }`}
                                  initial={{ height: 0 }}
                                  whileInView={{ height: '100%' }}
                                  transition={{ delay: index * 0.1 + itemIndex * 0.05 + 0.2, duration: 0.4 }}
                                />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                    {/* Shipping Info */}
                    <div className={`mt-6 pt-6 border-t p-5 rounded-xl ${
                      darkMode
                        ? 'border-moon-gold/20 bg-moon-night/30'
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <FiMapPin className={`w-5 h-5 ${
                          darkMode ? 'text-moon-gold animate-pulse-slow' : 'text-purple-600'
                        }`} />
                        <p className={`text-sm font-bold uppercase tracking-wider ${
                          darkMode ? 'text-moon-silver' : 'text-gray-900'
                        }`}>Shipping Destination:</p>
                      </div>
                      <p className={`leading-relaxed ml-7 ${
                        darkMode ? 'text-moon-silver/90' : 'text-gray-700'
                      }`}>
                        <span className={`font-semibold ${
                          darkMode ? 'text-moon-gold' : 'text-purple-600'
                        }`}>{order.shippingAddress.name}</span><br />
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                        {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`}<br />
                        📞 {order.shippingAddress.phone}
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div className={`mt-4 pt-6 border-t flex justify-between items-center flex-wrap gap-4 ${
                      darkMode ? 'border-moon-gold/20' : 'border-gray-200'
                    }`}>
                      <div className={`p-4 rounded-xl flex-1 min-w-[250px] ${
                        darkMode ? 'bg-moon-night/30' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FiCreditCard className={`w-5 h-5 ${
                            darkMode ? 'text-moon-mystical animate-pulse-slow' : 'text-purple-600'
                          }`} />
                          <p className={`text-sm uppercase tracking-wider ${
                            darkMode ? 'text-moon-silver/60' : 'text-gray-600'
                          }`}>Payment Method:</p>
                        </div>
                        <p className={`font-bold capitalize text-lg ml-7 ${
                          darkMode ? 'text-moon-silver' : 'text-gray-900'
                        }`}>
                          {order.paymentInfo.method === 'bkash' ? '💳 bKash' : `💳 ${order.paymentInfo.method}`}
                        </p>
                        {order.paymentInfo.transactionId && (
                          <p className={`text-xs mt-1 ml-7 ${
                            darkMode ? 'text-moon-silver/50' : 'text-gray-500'
                          }`}>
                            Transaction: {order.paymentInfo.transactionId}
                          </p>
                        )}
                      </div>
                      <div className={`p-4 rounded-xl text-right flex-1 min-w-[250px] ${
                        darkMode ? 'bg-moon-night/30' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm uppercase tracking-wider mb-2 ${
                          darkMode ? 'text-moon-silver/60' : 'text-gray-600'
                        }`}>Payment Status:</p>
                        <p className={`font-bold capitalize text-lg ${
                          order.paymentInfo.status === 'completed' ? 'text-green-400' :
                          order.paymentInfo.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {order.paymentInfo.status === 'completed' ? '✅ Completed' :
                           order.paymentInfo.status === 'pending' ? '⏳ Pending' :
                           '❌ Failed'}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className={`mt-4 pt-6 border-t p-5 rounded-xl ${
                        darkMode
                          ? 'border-moon-gold/20 bg-moon-midnight/30'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <FiFileText className={`w-5 h-5 ${
                            darkMode ? 'text-moon-gold animate-pulse-slow' : 'text-purple-600'
                          }`} />
                          <p className={`text-sm font-bold uppercase tracking-wider ${
                            darkMode ? 'text-moon-silver' : 'text-gray-900'
                          }`}>Special Instructions:</p>
                        </div>
                        <p className={`ml-7 italic ${
                          darkMode ? 'text-moon-silver/80' : 'text-gray-700'
                        }`}>{order.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
