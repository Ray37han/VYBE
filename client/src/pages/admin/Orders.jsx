import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX, FiEye, FiDollarSign } from 'react-icons/fi';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing' },
  printing: { icon: FiPackage, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Printing' },
  shipped: { icon: FiTruck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped' },
  delivered: { icon: FiCheck, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' }
};

const paymentStatusColors = {
  pending: 'text-yellow-600 bg-yellow-50',
  completed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
  refunded: 'text-gray-600 bg-gray-50'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);

  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    note: '',
    trackingNumber: ''
  });

  const [paymentUpdate, setPaymentUpdate] = useState({
    status: '',
    transactionId: ''
  });

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
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await adminAPI.getAllOrders(params);
      setOrders(response.data || response || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({
      status: order.orderStatus,
      note: '',
      trackingNumber: order.trackingNumber || ''
    });
    setPaymentUpdate({
      status: order.paymentInfo.status,
      transactionId: order.paymentInfo.transactionId || ''
    });
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdate.status) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selectedOrder._id, statusUpdate);
      toast.success('Order status updated successfully');
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!paymentUpdate.status) {
      toast.error('Please select payment status');
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.updatePaymentStatus(selectedOrder._id, paymentUpdate);
      toast.success('Payment status updated successfully');
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`pt-24 pb-12 min-h-screen transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-4xl font-bold ${
              darkMode
                ? 'moon-gradient-text animate-glow'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
            }`}
          >
            Order Management
          </motion.h1>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-300 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold focus:ring-moon-gold/20'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
            }`}
          >
            <option value="" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>All Orders</option>
            <option value="pending" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Pending</option>
            <option value="processing" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Processing</option>
            <option value="printing" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Printing</option>
            <option value="shipped" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Shipped</option>
            <option value="delivered" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Delivered</option>
            <option value="cancelled" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-moon-gold' : 'border-vybe-purple'}`}
            />
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-12 text-center rounded-2xl border ${
              darkMode 
                ? 'bg-moon-midnight/50 border-moon-gold/20' 
                : 'bg-white border-purple-100'
            }`}
          >
            <FiPackage className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-moon-silver/40' : 'text-gray-400'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>No Orders Found</h2>
            <p className={darkMode ? 'text-moon-silver/60' : 'text-gray-600'}>Orders will appear here as customers place them</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`overflow-hidden rounded-2xl border ${
              darkMode 
                ? 'bg-moon-midnight/30 border-moon-gold/20' 
                : 'bg-white border-purple-100 shadow-xl'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${darkMode ? 'bg-moon-midnight/50 border-moon-gold/20' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Order
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Customer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Items
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Total
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Payment
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-moon-gold/10' : 'divide-gray-200'}`}>
                  {orders.map((order, index) => {
                    const StatusIcon = statusConfig[order.orderStatus]?.icon || FiPackage;
                    const statusData = statusConfig[order.orderStatus] || statusConfig.pending;

                    return (
                      <motion.tr 
                        key={order._id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.03, duration: 0.4 }}
                        className={darkMode ? 'hover:bg-moon-midnight/50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-semibold text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>{order.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={`font-medium ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>{order.shippingAddress?.name || order.user?.name}</div>
                            <div className={darkMode ? 'text-moon-silver/50' : 'text-gray-500'}>{order.shippingAddress?.phone}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          {order.items?.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${darkMode ? 'text-moon-gold' : 'text-vybe-purple'}`}>৳{order.pricing?.total}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${paymentStatusColors[order.paymentInfo?.status] || 'bg-gray-100'}`}>
                            {order.paymentInfo?.status || 'pending'}
                          </span>
                          <div className={`text-xs mt-1 capitalize ${darkMode ? 'text-moon-silver/50' : 'text-gray-500'}`}>
                            {order.paymentInfo?.method || order.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusData.bg} w-fit`}>
                            <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                            <span className={`font-semibold text-xs ${statusData.color}`}>
                              {statusData.label}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className={`flex items-center gap-1 ${
                              darkMode 
                                ? 'text-moon-gold hover:text-moon-silver' 
                                : 'text-purple-600 hover:text-purple-800'
                            }`}
                          >
                            <FiEye />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${
                darkMode 
                  ? 'bg-moon-midnight border-moon-gold/30' 
                  : 'bg-white border-purple-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Order Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={`text-2xl ${darkMode ? 'text-moon-silver hover:text-moon-gold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-moon-night/50 border border-moon-gold/20' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Order Information</h3>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Payment Method:</strong> {selectedOrder.paymentInfo?.method || selectedOrder.paymentMethod}</p>
                  {selectedOrder.paymentInfo?.transactionId && (
                    <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Transaction ID:</strong> {selectedOrder.paymentInfo.transactionId}</p>
                  )}
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-moon-night/50 border border-moon-gold/20' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Customer Information</h3>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Name:</strong> {selectedOrder.shippingAddress?.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}><strong>Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className={`flex gap-4 p-3 rounded ${darkMode ? 'bg-moon-night/50 border border-moon-gold/20' : 'bg-gray-50'}`}>
                      <img
                        src={item.product?.images?.[0]?.url || item.product?.image || '/placeholder.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>{item.product?.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Size: {item.size} | Qty: {item.quantity}</p>
                        <p className={`text-sm font-bold ${darkMode ? 'text-moon-gold' : 'text-vybe-purple'}`}>৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-moon-gold/20' : 'border-gray-200'}`}>
                  <div className={`flex justify-between text-sm mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    <span>Subtotal:</span>
                    <span>৳{selectedOrder.pricing?.subtotal}</span>
                  </div>
                  <div className={`flex justify-between text-sm mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    <span>Shipping:</span>
                    <span>৳{selectedOrder.pricing?.shippingCost || 0}</span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    <span>Total:</span>
                    <span className={darkMode ? 'text-moon-gold' : 'text-vybe-purple'}>৳{selectedOrder.pricing?.total}</span>
                  </div>
                </div>
              </div>

              {/* Update Order Status */}
              <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-moon-night/50 border-moon-gold/20' : 'bg-blue-50 border-blue-200'}`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Update Order Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Order Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending" className={darkMode ? 'bg-moon-midnight' : ''}>Pending</option>
                      <option value="processing" className={darkMode ? 'bg-moon-midnight' : ''}>Processing</option>
                      <option value="printing" className={darkMode ? 'bg-moon-midnight' : ''}>Printing</option>
                      <option value="shipped" className={darkMode ? 'bg-moon-midnight' : ''}>Shipped</option>
                      <option value="delivered" className={darkMode ? 'bg-moon-midnight' : ''}>Delivered</option>
                      <option value="cancelled" className={darkMode ? 'bg-moon-midnight' : ''}>Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Tracking Number (Optional)</label>
                    <input
                      type="text"
                      value={statusUpdate.trackingNumber}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter tracking number"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Note (Optional)</label>
                  <textarea
                    value={statusUpdate.note}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={2}
                    placeholder="Add a note about this status update"
                  />
                </div>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Order Status'}
                </button>
              </div>

              {/* Update Payment Status */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-moon-night/50 border-moon-gold/20' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                  <FiDollarSign /> Update Payment Status
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Payment Status</label>
                    <select
                      value={paymentUpdate.status}
                      onChange={(e) => setPaymentUpdate({ ...paymentUpdate, status: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending" className={darkMode ? 'bg-moon-midnight' : ''}>Pending</option>
                      <option value="completed" className={darkMode ? 'bg-moon-midnight' : ''}>Completed</option>
                      <option value="failed" className={darkMode ? 'bg-moon-midnight' : ''}>Failed</option>
                      <option value="refunded" className={darkMode ? 'bg-moon-midnight' : ''}>Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Transaction ID</label>
                    <input
                      type="text"
                      value={paymentUpdate.transactionId}
                      onChange={(e) => setPaymentUpdate({ ...paymentUpdate, transactionId: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdatePayment}
                  disabled={updating}
                  className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Payment Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
