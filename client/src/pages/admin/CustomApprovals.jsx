import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiImage, FiType, FiAlertCircle, FiPackage, FiZoomIn } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function CustomApprovals() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending_admin_review');
  const [imageModal, setImageModal] = useState(null);

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
    fetchOrders();
    fetchStats();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/custom-approvals`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load custom orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/custom-approvals/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/admin/custom-approvals/${selectedOrder._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Custom order approved successfully!');
      setShowModal(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve order');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/admin/custom-approvals/${selectedOrder._id}/reject`,
        { rejectionReason: rejectionReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Custom order rejected and email sent to customer');
      setShowModal(false);
      setSelectedOrder(null);
      setRejectionReason('');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const getCustomItems = (order) => {
    if (!order || !order.items) return [];
    return order.items.filter(item => item.customization && Object.keys(item.customization).length > 0);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            🎨 Custom Order Approvals
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and approve custom poster orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pending Review</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</p>
              </div>
              <FiClock className={`text-4xl ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Approved</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.approved}</p>
              </div>
              <FiCheck className={`text-4xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Rejected</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.rejected}</p>
              </div>
              <FiX className={`text-4xl ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Custom</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{stats.total}</p>
              </div>
              <FiPackage className={`text-4xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border mb-6`}>
          <div className="flex flex-wrap gap-3">
            {['pending_admin_review', 'processing', 'rejected', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === filter
                    ? 'bg-purple-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'pending_admin_review' ? 'Pending Review' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <FiPackage className={`mx-auto text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No custom orders found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Order Details
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Customer
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Custom Items
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                  {orders.map((order) => {
                    const customItems = getCustomItems(order);
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {order.orderNumber}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              ৳{order.pricing?.total || 0}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {order.user?.name || order.shippingAddress?.name || 'N/A'}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {order.user?.email || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FiImage className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {customItems.length} item{customItems.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              order.orderStatus === 'pending_admin_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.orderStatus === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.orderStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.orderStatus === 'pending_admin_review' ? 'Pending Review' : order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FiZoomIn />
                            Review
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6 flex justify-between items-center z-10`}>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Review Custom Order
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Order: {selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <FiX className={`text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.shippingAddress?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Date</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Items */}
              {getCustomItems(selectedOrder).map((item, index) => (
                <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Custom Item #{index + 1}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Image Preview */}
                    {item.customization.uploadedImageUrl && (
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 flex items-center gap-2`}>
                          <FiImage /> Uploaded Image
                        </p>
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => setImageModal(item.customization.uploadedImageUrl)}
                        >
                          <img
                            src={item.customization.uploadedImageUrl}
                            alt="Custom upload"
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                            <FiZoomIn className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-4">
                      {/* Product Info */}
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.product?.name || 'Custom Poster'}
                        </p>
                      </div>

                      {/* Size */}
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Size</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.size}
                        </p>
                      </div>

                      {/* Text Overlay */}
                      {item.customization.textOverlay && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2 mb-2`}>
                            <FiType /> Text Overlay
                          </p>
                          <div className={`${darkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.customization.textOverlay}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Frame Color */}
                      {item.customization.frameColor && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frame Color</p>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-500"
                              style={{ backgroundColor: item.customization.frameColor }}
                            ></div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                              {item.customization.frameColor}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Admin Instructions */}
                      {item.customization.adminInstructions && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2 mb-2`}>
                            <FiAlertCircle /> Special Instructions
                          </p>
                          <div className={`${darkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.customization.adminInstructions}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rejection Reason Input */}
              {selectedOrder.orderStatus === 'pending_admin_review' && (
                <div className={`${darkMode ? 'bg-red-900 bg-opacity-20 border-red-800' : 'bg-red-50 border-red-200'} rounded-xl p-6 border`}>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-900'} mb-2`}>
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter a clear reason for rejection (required if rejecting)"
                    rows="3"
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedOrder.orderStatus === 'pending_admin_review' && (
              <div className={`sticky bottom-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-6 flex gap-4 justify-end z-10`}>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiX />
                  {processing ? 'Rejecting...' : 'Reject Order'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiCheck />
                  {processing ? 'Approving...' : 'Approve Order'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {imageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setImageModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-5xl max-h-[90vh]"
          >
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FiX className="text-3xl" />
            </button>
            <img
              src={imageModal}
              alt="Zoomed view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
