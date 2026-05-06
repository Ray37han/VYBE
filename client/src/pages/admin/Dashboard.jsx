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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
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
            🚚 Orders & Delivery
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
            Trending Now
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
            to="/admin/custom-orders" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-mystical/50 text-moon-mystical hover:bg-moon-mystical/20 hover:border-moon-mystical'
                : 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500'
            }`}
          >
            Custom Orders
          </Link>
          <Link 
            to="/admin/custom-approvals" 
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400'
            }`}
          >
            🎨 Custom Approvals
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
          <Link
            to="/admin/bulk-import"
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
              darkMode
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400'
            }`}
          >
            Bulk Import
          </Link>          <Link
            to="/admin/analytics"
            className={`px-6 py-3 rounded-xl font-bold text-center transition-all duration-300 shadow-lg border-2 ${
                darkMode
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400'
            }`}
          >
            📊 Analytics
          </Link>        </motion.div>



      </div>
    </div>
  );
}
