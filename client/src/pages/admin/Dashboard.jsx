import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data || response || {});
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Admin Dashboard</h1>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/products" className="btn-primary text-center">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="btn-secondary text-center">
            Manage Orders
          </Link>
          <Link to="/admin/users" className="btn-outline text-center">
            Manage Users
          </Link>
          <Link to="/products" className="btn-outline text-center">
            View Store
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-vybe-purple">{stats?.totalProducts || 0}</p>
              </div>
              <FiPackage className="w-12 h-12 text-vybe-purple opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalOrders || 0}</p>
              </div>
              <FiShoppingBag className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalUsers || 0}</p>
              </div>
              <FiUsers className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-orange-600">৳{stats?.totalRevenue || 0}</p>
              </div>
              <FiDollarSign className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Total</th>
                  <th className="text-left py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{order.orderNumber}</td>
                    <td className="py-3">{order.user?.name}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3">৳{order.pricing.total}</td>
                    <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
