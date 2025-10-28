import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

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
      <div className={`flex justify-center items-center min-h-screen ${
        darkMode
          ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
          : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-16 w-16 border-4 ${
            darkMode
              ? 'border-moon-gold/20 border-t-moon-gold'
              : 'border-purple-200 border-t-purple-600'
          }`}
        />
      </div>
    );
  }

  return (
    <div className={`pt-24 pb-12 min-h-screen transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-bold mb-8 ${
            darkMode
              ? 'moon-gradient-text animate-glow'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}
        >
          Admin Dashboard
        </motion.h1>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Link 
            to="/admin/products" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              darkMode
                ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
            }`}
          >
            Manage Products
          </Link>
          <Link 
            to="/admin/orders" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-gold/50 text-moon-silver hover:bg-moon-blue/50 hover:border-moon-gold'
                : 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500'
            }`}
          >
            Manage Orders
          </Link>
          <Link 
            to="/admin/users" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-silver/30 text-moon-silver hover:bg-moon-blue/50 hover:border-moon-silver/50'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            Manage Users
          </Link>
          <Link 
            to="/admin/featured-posters" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-mystical/50 text-moon-silver hover:bg-moon-blue/50 hover:border-moon-mystical'
                : 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-500'
            }`}
          >
            Featured Posters
          </Link>
          <Link 
            to="/admin/hero-items" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-gold/50 text-moon-gold hover:bg-moon-gold/20 hover:border-moon-gold'
                : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500'
            }`}
          >
            Hero Items
          </Link>
          <Link 
            to="/products" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-silver/30 text-moon-silver hover:bg-moon-blue/50 hover:border-moon-silver/50'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            View Store
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl hover:translate-y-[-4px] ${
              darkMode
                ? 'bg-moon-midnight/50 border border-moon-gold/20'
                : 'bg-white border border-purple-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Total Products</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-moon-mystical' : 'text-purple-600'}`}>{stats?.totalProducts || 0}</p>
              </div>
              <FiPackage className={`w-12 h-12 opacity-20 ${darkMode ? 'text-moon-mystical' : 'text-purple-600'}`} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl hover:translate-y-[-4px] ${
              darkMode
                ? 'bg-moon-midnight/50 border border-moon-blue/20'
                : 'bg-white border border-blue-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Total Orders</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{stats?.totalOrders || 0}</p>
              </div>
              <FiShoppingBag className={`w-12 h-12 opacity-20 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl hover:translate-y-[-4px] ${
              darkMode
                ? 'bg-moon-midnight/50 border border-green-500/20'
                : 'bg-white border border-green-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Total Users</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stats?.totalUsers || 0}</p>
              </div>
              <FiUsers className={`w-12 h-12 opacity-20 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl hover:translate-y-[-4px] ${
              darkMode
                ? 'bg-moon-midnight/50 border border-moon-gold/20'
                : 'bg-white border border-orange-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Total Revenue</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-moon-gold' : 'text-orange-600'}`}>৳{stats?.totalRevenue || 0}</p>
              </div>
              <FiDollarSign className={`w-12 h-12 opacity-20 ${darkMode ? 'text-moon-gold' : 'text-orange-600'}`} />
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-2xl shadow-lg transition-all duration-500 ${
            darkMode
              ? 'bg-moon-midnight/50 border border-moon-gold/20'
              : 'bg-white border border-purple-100'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-moon-gold/20' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Order ID</th>
                  <th className={`text-left py-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Customer</th>
                  <th className={`text-left py-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Status</th>
                  <th className={`text-left py-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Total</th>
                  <th className={`text-left py-3 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order, index) => (
                  <motion.tr 
                    key={order._id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`border-b transition-colors duration-200 ${
                      darkMode
                        ? 'border-moon-gold/10 hover:bg-moon-blue/30'
                        : 'border-gray-100 hover:bg-purple-50'
                    }`}
                  >
                    <td className={`py-3 ${darkMode ? 'text-moon-silver/80' : 'text-gray-700'}`}>{order.orderNumber}</td>
                    <td className={`py-3 ${darkMode ? 'text-moon-silver/80' : 'text-gray-700'}`}>{order.user?.name}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        darkMode
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className={`py-3 font-semibold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>৳{order.pricing.total}</td>
                    <td className={`py-3 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
