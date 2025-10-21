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
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="section-title">Order Management</h1>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="printing">Printing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-vybe-purple"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
            <p className="text-gray-600">Orders will appear here as customers place them</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.orderStatus]?.icon || FiPackage;
                    const statusData = statusConfig[order.orderStatus] || statusConfig.pending;

                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-sm">{order.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">{order.shippingAddress?.name || order.user?.name}</div>
                            <div className="text-gray-500">{order.shippingAddress?.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {order.items?.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-vybe-purple">৳{order.pricing?.total}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${paymentStatusColors[order.paymentInfo?.status] || 'bg-gray-100'}`}>
                            {order.paymentInfo?.status || 'pending'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1 capitalize">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                          >
                            <FiEye />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p className="text-sm"><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
                  <p className="text-sm"><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p className="text-sm"><strong>Payment Method:</strong> {selectedOrder.paymentInfo?.method || selectedOrder.paymentMethod}</p>
                  {selectedOrder.paymentInfo?.transactionId && (
                    <p className="text-sm"><strong>Transaction ID:</strong> {selectedOrder.paymentInfo.transactionId}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p className="text-sm"><strong>Name:</strong> {selectedOrder.shippingAddress?.name}</p>
                  <p className="text-sm"><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-sm"><strong>Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="flex gap-4 bg-gray-50 p-3 rounded">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">Size: {item.size} | Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-vybe-purple">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>৳{selectedOrder.pricing?.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Shipping:</span>
                    <span>৳{selectedOrder.pricing?.shippingCost || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-vybe-purple">৳{selectedOrder.pricing?.total}</span>
                  </div>
                </div>
              </div>

              {/* Update Order Status */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Update Order Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Order Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="printing">Printing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tracking Number (Optional)</label>
                    <input
                      type="text"
                      value={statusUpdate.trackingNumber}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter tracking number"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                  <textarea
                    value={statusUpdate.note}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Add a note about this status update"
                  />
                </div>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="mt-3 btn-primary w-full disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Order Status'}
                </button>
              </div>

              {/* Update Payment Status */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiDollarSign /> Update Payment Status
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Status</label>
                    <select
                      value={paymentUpdate.status}
                      onChange={(e) => setPaymentUpdate({ ...paymentUpdate, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction ID</label>
                    <input
                      type="text"
                      value={paymentUpdate.transactionId}
                      onChange={(e) => setPaymentUpdate({ ...paymentUpdate, transactionId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdatePayment}
                  disabled={updating}
                  className="mt-3 btn-primary w-full disabled:opacity-50"
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
