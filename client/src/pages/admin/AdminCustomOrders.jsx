import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiImage, FiDownload, FiCheck, FiX,
  FiAlertCircle, FiClock, FiUser, FiMail, FiPhone,
  FiCalendar, FiFileText, FiEye
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Listen for theme changes
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

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/customizations/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Fetch custom orders error:', error);
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order, item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/customizations/orders/${order._id}/item/${item._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedItem({ ...response.data, orderId: order._id });
      setShowDetailModal(true);
    } catch (error) {
      console.error('Fetch item details error:', error);
      toast.error('Failed to load item details');
    }
  };

  const handleDownloadImage = async (publicId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/customizations/download/${encodeURIComponent(publicId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Open download URL in new tab
      window.open(response.data.downloadUrl, '_blank');
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate download link');
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/customizations/orders/${selectedItem.orderId}/item/${selectedItem.item._id}/status`,
        { status: 'approved' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success('Custom order approved!');
      setShowDetailModal(false);
      fetchCustomOrders(); // Refresh list
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/customizations/orders/${selectedItem.orderId}/item/${selectedItem.item._id}/status`,
        { 
          status: 'rejected',
          rejectionReason: rejectionReason.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success('Custom order rejected');
      setShowDetailModal(false);
      setShowRejectionModal(false);
      setRejectionReason('');
      fetchCustomOrders(); // Refresh list
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: darkMode 
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
        : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: darkMode
        ? 'bg-green-500/20 text-green-400 border-green-500/50'
        : 'bg-green-100 text-green-700 border-green-300',
      rejected: darkMode
        ? 'bg-red-500/20 text-red-400 border-red-500/50'
        : 'bg-red-100 text-red-700 border-red-300',
    };

    const icons = {
      pending: <FiClock className="inline mr-1" />,
      approved: <FiCheck className="inline mr-1" />,
      rejected: <FiX className="inline mr-1" />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-moon-night' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-moon-gold"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-moon-night to-moon-midnight text-white' : 'bg-gradient-to-b from-gray-50 to-blue-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? 'moon-gradient-text' : 'gradient-text'}`}>
            <FiPackage className="inline mr-3" />
            Custom Orders Management
          </h1>
          <p className={`${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
            Review and manage customer custom poster orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${
            darkMode ? 'bg-moon-midnight/50' : 'bg-white'
          }`}>
            <FiPackage className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-moon-silver/30' : 'text-gray-300'}`} />
            <p className={`text-xl ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
              No custom orders yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 shadow-lg ${
                  darkMode ? 'bg-moon-midnight/80 backdrop-blur-xl' : 'bg-white'
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                      Order #{order.orderNumber}
                    </h3>
                    <div className={`flex flex-wrap items-center gap-4 mt-2 text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                      <span>
                        <FiUser className="inline mr-1" />
                        {order.customer.name}
                      </span>
                      {order.customer.email && (
                        <span>
                          <FiMail className="inline mr-1" />
                          {order.customer.email}
                        </span>
                      )}
                      <span>
                        <FiCalendar className="inline mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Custom Items */}
                <div className="space-y-3">
                  {order.customItems.map((item) => (
                    <div
                      key={item._id}
                      className={`rounded-xl p-4 border-2 ${
                        darkMode ? 'bg-moon-night/50 border-moon-midnight' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.customization?.uploadedImageUrl || item.productImage}
                            alt={item.productName}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.productName}
                          </h4>
                          <div className={`text-sm space-y-1 ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                            <p>Size: {item.size} • Quantity: {item.quantity} • Price: ৳{item.price}</p>
                            {item.customization?.textOverlay && (
                              <p>
                                <FiFileText className="inline mr-1" />
                                Text: "{item.customization.textOverlay}"
                              </p>
                            )}
                            {item.customization?.frameColor && (
                              <p>
                                <FiImage className="inline mr-1" />
                                Frame: {item.customization.frameColor}
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(item.customization?.status || 'pending')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewDetails(order, item)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                              darkMode
                                ? 'bg-moon-gold text-moon-night hover:bg-moon-gold/90'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            <FiEye className="inline mr-2" />
                            Review
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-4xl w-full rounded-2xl p-6 sm:p-8 my-8 ${
                darkMode ? 'bg-moon-midnight' : 'bg-white'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  Custom Order Review
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-moon-night' : 'hover:bg-gray-100'}`}
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Order Info */}
              <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-moon-night' : 'bg-gray-50'}`}>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><strong>Order #:</strong> {selectedItem.orderInfo.orderNumber}</p>
                  <p><strong>Customer:</strong> {selectedItem.orderInfo.customer?.name}</p>
                  <p><strong>Email:</strong> {selectedItem.orderInfo.customer?.email}</p>
                  <p><strong>Phone:</strong> {selectedItem.orderInfo.customer?.phone || 'N/A'}</p>
                  <p><strong>Date:</strong> {new Date(selectedItem.orderInfo.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedItem.orderInfo.orderStatus}</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left: Image Preview */}
                <div>
                  <h3 className={`font-bold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                    <FiImage className="inline mr-2" />
                    Live Preview
                  </h3>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                    {/* Frame */}
                    {selectedItem.item.customization?.frameColor && selectedItem.item.customization.frameColor !== 'none' && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          border: `12px solid ${
                            selectedItem.item.customization.frameColor === 'black' ? '#000000' :
                            selectedItem.item.customization.frameColor === 'white' ? '#ffffff' :
                            selectedItem.item.customization.frameColor === 'gold' ? '#f59e0b' :
                            selectedItem.item.customization.frameColor === 'silver' ? '#9ca3af' :
                            selectedItem.item.customization.frameColor === 'wood' ? '#92400e' : '#000000'
                          }`,
                        }}
                      ></div>
                    )}
                    
                    {/* Image */}
                    <img
                      src={selectedItem.item.customization?.uploadedImageUrl}
                      alt="Custom design"
                      className="w-full h-full object-cover"
                    />

                    {/* Text Overlay */}
                    {selectedItem.item.customization?.textOverlay && (
                      <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                        <p className="text-white font-bold text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {selectedItem.item.customization.textOverlay}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadImage(selectedItem.item.customization?.uploadedImagePublicId)}
                    className={`w-full mt-4 py-3 rounded-xl font-semibold ${
                      darkMode
                        ? 'bg-moon-night text-moon-gold border-2 border-moon-gold hover:bg-moon-gold hover:text-moon-night'
                        : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white'
                    } transition-all`}
                  >
                    <FiDownload className="inline mr-2" />
                    Download Original Image
                  </motion.button>
                </div>

                {/* Right: Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-bold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                      Product Details
                    </h3>
                    <div className={`p-4 rounded-xl space-y-2 text-sm ${darkMode ? 'bg-moon-night' : 'bg-gray-50'}`}>
                      <p><strong>Product:</strong> {selectedItem.item.productName}</p>
                      <p><strong>Size:</strong> {selectedItem.item.size}</p>
                      <p><strong>Quantity:</strong> {selectedItem.item.quantity}</p>
                      <p><strong>Price:</strong> ৳{selectedItem.item.price}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-bold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                      Customization
                    </h3>
                    <div className={`p-4 rounded-xl space-y-2 text-sm ${darkMode ? 'bg-moon-night' : 'bg-gray-50'}`}>
                      {selectedItem.item.customization?.textOverlay && (
                        <p><strong>Text Overlay:</strong> "{selectedItem.item.customization.textOverlay}"</p>
                      )}
                      {selectedItem.item.customization?.frameColor && (
                        <p><strong>Frame Color:</strong> {selectedItem.item.customization.frameColor}</p>
                      )}
                      <p><strong>Status:</strong> {getStatusBadge(selectedItem.item.customization?.status || 'pending')}</p>
                    </div>
                  </div>

                  {selectedItem.item.customization?.adminInstructions && (
                    <div>
                      <h3 className={`font-bold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                        <FiFileText className="inline mr-2" />
                        Special Instructions
                      </h3>
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-moon-night' : 'bg-gray-50'}`}>
                        <p className="text-sm">{selectedItem.item.customization.adminInstructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedItem.item.customization?.status === 'pending' && (
                    <div className="space-y-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        <FiCheck className="inline mr-2" />
                        {actionLoading ? 'Processing...' : 'Approve Design'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRejectionModal(true)}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        <FiX className="inline mr-2" />
                        Reject Design
                      </motion.button>
                    </div>
                  )}

                  {selectedItem.item.customization?.status === 'rejected' && selectedItem.item.customization?.rejectionReason && (
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-500/10 border-2 border-red-500/50' : 'bg-red-50 border-2 border-red-200'}`}>
                      <p className={`font-bold mb-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <FiAlertCircle className="inline mr-2" />
                        Rejection Reason:
                      </p>
                      <p className="text-sm">{selectedItem.item.customization.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowRejectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full rounded-2xl p-6 ${
                darkMode ? 'bg-moon-midnight' : 'bg-white'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                <FiAlertCircle className="inline mr-2" />
                Rejection Reason
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                Please provide a clear reason for rejecting this design. The customer will receive this in an email.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Image contains copyrighted material, inappropriate content, low resolution, etc."
                rows={4}
                className={`w-full p-3 rounded-xl border-2 resize-none mb-4 ${
                  darkMode
                    ? 'bg-moon-night border-moon-midnight text-white placeholder-moon-silver/50'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                } outline-none focus:border-red-500`}
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectionModal(false)}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    darkMode ? 'bg-moon-night text-moon-silver' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 py-2 rounded-lg font-semibold bg-red-600 text-white disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
