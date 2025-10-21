import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX } from 'react-icons/fi';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing' },
  shipped: { icon: FiTruck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped' },
  delivered: { icon: FiCheck, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' }
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-vybe-purple"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="section-title mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping and your orders will appear here</p>
            <Link to="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const StatusIcon = statusConfig[order.orderStatus]?.icon || FiPackage;
              const statusData = statusConfig[order.orderStatus] || statusConfig.pending;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 border-b flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-600">Order Number</p>
                        <p className="font-bold text-sm">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Order Date</p>
                        <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="font-bold text-vybe-purple">৳{order.pricing.total}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusData.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                      <span className={`font-semibold text-sm ${statusData.color}`}>
                        {statusData.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex gap-4">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} | Quantity: {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-vybe-purple">
                              ৳{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Shipping Address:</p>
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                        {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`}<br />
                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method:</p>
                        <p className="font-semibold capitalize">
                          {order.paymentInfo.method === 'bkash' ? 'bKash' : order.paymentInfo.method}
                        </p>
                        {order.paymentInfo.transactionId && (
                          <p className="text-xs text-gray-500">
                            TxID: {order.paymentInfo.transactionId}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Payment Status:</p>
                        <p className={`font-semibold capitalize ${
                          order.paymentInfo.status === 'completed' ? 'text-green-600' :
                          order.paymentInfo.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {order.paymentInfo.status}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">Order Notes:</p>
                        <p className="text-sm text-gray-700">{order.notes}</p>
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
