import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX, FiShoppingBag, FiMapPin, FiCreditCard, FiFileText } from 'react-icons/fi';
import { ordersAPI } from '../api';
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

  useEffect(() => {
    fetchOrders();
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-moon-gold/20 border-t-moon-gold rounded-full"
        />
        <p className="mt-6 text-moon-silver/60 text-lg animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 min-h-screen bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hieroglyph-overlay opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-moon-mystical/5 via-transparent to-moon-gold/5 animate-pulse-slow"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-3 moon-gradient-text animate-glow">
            My Mystical Orders
          </h1>
          <p className="text-moon-silver/70 text-lg">Track your essence journey</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-moon p-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiShoppingBag className="w-24 h-24 mx-auto text-moon-gold/40 mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-3 text-moon-silver">No Orders Yet</h2>
            <p className="text-moon-silver/60 mb-8 text-lg">Start your collection and your orders will manifest here</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/products" 
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-moon-mystical to-moon-gold text-white rounded-xl font-bold tracking-wide shadow-lg hover:shadow-moon-gold/50 transition-all duration-300"
              >
                <FiShoppingBag className="w-5 h-5" />
                <span>Explore Collection</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const StatusIcon = statusConfig[order.orderStatus]?.icon || FiPackage;
              const statusData = statusConfig[order.orderStatus] || statusConfig.pending;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="card-moon overflow-hidden border-2 border-moon-gold/20 hover:border-moon-gold/50 transition-all duration-300 relative group"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-moon-mystical/0 via-moon-gold/0 to-moon-mystical/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Order Header */}
                  <div className="bg-moon-night/50 p-6 border-b border-moon-gold/20 flex justify-between items-center flex-wrap gap-4 relative z-10">
                    <div className="flex items-center gap-8">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <p className="text-xs text-moon-silver/60 uppercase tracking-wider mb-1">Order ID</p>
                        <p className="font-bold text-moon-gold text-lg">{order.orderNumber}</p>
                      </motion.div>
                      <div>
                        <p className="text-xs text-moon-silver/60 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-medium text-moon-silver">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-moon-silver/60 uppercase tracking-wider mb-1">Total</p>
                        <p className="font-bold text-2xl text-moon-gold animate-glow">৳{order.pricing.total}</p>
                      </div>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl ${statusData.bg} border ${statusData.border} shadow-lg ${statusData.glow}`}
                    >
                      <StatusIcon className={`w-5 h-5 ${statusData.color} animate-pulse-slow`} />
                      <span className={`font-bold text-base ${statusData.color}`}>
                        {statusData.label}
                      </span>
                    </motion.div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, itemIndex) => (
                        <motion.div 
                          key={item._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                          className="flex gap-4 p-4 bg-moon-midnight/30 rounded-xl border border-moon-gold/10 hover:border-moon-gold/30 transition-all duration-300 group/item"
                        >
                          {item.product?.images?.[0] && (
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-moon-gold/20 group-hover/item:border-moon-gold/50 transition-all duration-300"
                              />
                            </motion.div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-lg text-moon-silver group-hover/item:text-moon-gold transition-colors">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-sm text-moon-silver/60 mt-1">
                              📏 Size: <span className="text-moon-silver font-semibold">{item.size}</span> | 
                              📦 Qty: <span className="text-moon-silver font-semibold">{item.quantity}</span>
                            </p>
                            <p className="text-lg font-bold text-moon-gold mt-2 animate-glow">
                              ৳{item.price * item.quantity}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="mt-6 pt-6 border-t border-moon-gold/20 bg-moon-night/30 p-5 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <FiMapPin className="text-moon-gold w-5 h-5 animate-pulse-slow" />
                        <p className="text-sm font-bold text-moon-silver uppercase tracking-wider">Shipping Destination:</p>
                      </div>
                      <p className="text-moon-silver/90 leading-relaxed ml-7">
                        <span className="font-semibold text-moon-gold">{order.shippingAddress.name}</span><br />
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                        {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`}<br />
                        📞 {order.shippingAddress.phone}
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 pt-6 border-t border-moon-gold/20 flex justify-between items-center flex-wrap gap-4">
                      <div className="bg-moon-night/30 p-4 rounded-xl flex-1 min-w-[250px]">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCreditCard className="text-moon-mystical w-5 h-5 animate-pulse-slow" />
                          <p className="text-sm text-moon-silver/60 uppercase tracking-wider">Payment Method:</p>
                        </div>
                        <p className="font-bold text-moon-silver capitalize text-lg ml-7">
                          {order.paymentInfo.method === 'bkash' ? '💳 bKash' : `💳 ${order.paymentInfo.method}`}
                        </p>
                        {order.paymentInfo.transactionId && (
                          <p className="text-xs text-moon-silver/50 mt-1 ml-7">
                            Transaction: {order.paymentInfo.transactionId}
                          </p>
                        )}
                      </div>
                      <div className="bg-moon-night/30 p-4 rounded-xl text-right flex-1 min-w-[250px]">
                        <p className="text-sm text-moon-silver/60 uppercase tracking-wider mb-2">Payment Status:</p>
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
                      <div className="mt-4 pt-6 border-t border-moon-gold/20 bg-moon-midnight/30 p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <FiFileText className="text-moon-gold w-5 h-5 animate-pulse-slow" />
                          <p className="text-sm font-bold text-moon-silver uppercase tracking-wider">Special Instructions:</p>
                        </div>
                        <p className="text-moon-silver/80 ml-7 italic">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
