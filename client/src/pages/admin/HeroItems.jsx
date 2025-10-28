import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function HeroItemsManager() {
  const [heroItems, setHeroItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    position: 'center',
    order: 0,
    gradient: 'from-purple-600/90 via-transparent to-transparent'
  });
  const [editingItem, setEditingItem] = useState(null);

  const positions = [
    { value: 'center', label: 'Center (Main)' },
    { value: 'left', label: 'Left Side' },
    { value: 'right', label: 'Right Side' },
    { value: 'bottom', label: 'Bottom' }
  ];

  const gradients = [
    { value: 'from-purple-600/90 via-transparent to-transparent', label: 'Purple', color: 'bg-purple-600' },
    { value: 'from-yellow-600/90 via-transparent to-transparent', label: 'Yellow', color: 'bg-yellow-600' },
    { value: 'from-blue-600/90 via-transparent to-transparent', label: 'Blue', color: 'bg-blue-600' },
    { value: 'from-red-600/90 via-transparent to-transparent', label: 'Red', color: 'bg-red-600' },
    { value: 'from-green-600/90 via-transparent to-transparent', label: 'Green', color: 'bg-green-600' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme ? savedTheme === 'dark' : true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      let heroData = [];

      // Fetch products (public)
      const productsResponse = await axios.get(`${API_URL}/api/products`);
      setProducts(productsResponse.data.data || productsResponse.data || []);

      // If token exists try admin endpoint to get full data, otherwise fall back to public
      if (token) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const heroResponse = await axios.get(`${API_URL}/api/hero-items/admin`, config);
          heroData = heroResponse.data.data || [];
        } catch (adminErr) {
          // If admin fetch fails, try public endpoint
          console.warn('Admin hero-items fetch failed, falling back to public:', adminErr?.response?.status);
          const publicResp = await axios.get(`${API_URL}/api/hero-items`);
          heroData = publicResp.data.data || [];
        }
      } else {
        // No token, fetch public hero items
        const publicResp = await axios.get(`${API_URL}/api/hero-items`);
        heroData = publicResp.data.data || [];
      }

      setHeroItems(heroData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data from server. Check your network or backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingItem) {
        await axios.put(
          `${API_URL}/api/hero-items/${editingItem._id}`,
          formData,
          config
        );
        toast.success('Hero item updated successfully');
      } else {
        await axios.post(
          `${API_URL}/api/hero-items`,
          formData,
          config
        );
        toast.success('Hero item created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save hero item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      productId: item.product._id,
      title: item.title,
      position: item.position,
      order: item.order,
      gradient: item.gradient
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this hero item?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`${API_URL}/api/hero-items/${id}`, config);
      toast.success('Hero item deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete hero item');
    }
  };

  const toggleActive = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(
        `${API_URL}/api/hero-items/${item._id}`,
        { isActive: !item.isActive },
        config
      );
      toast.success(`Hero item ${!item.isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      title: '',
      position: 'center',
      order: 0,
      gradient: 'from-purple-600/90 via-transparent to-transparent'
    });
    setEditingItem(null);
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p._id === productId);
    setFormData({
      ...formData,
      productId,
      title: product?.name || ''
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
            Hero Items Manager
          </motion.h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }} 
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
              darkMode
                ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
            }`}
          >
            Add Hero Item
          </motion.button>
        </div>

        <p className={`mb-8 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>
          Manage the hero section items on the home page. Each position can have one active item.
        </p>

        {/* Hero Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`rounded-full h-12 w-12 border-4 ${
                darkMode
                  ? 'border-moon-gold/20 border-t-moon-gold'
                  : 'border-purple-200 border-t-purple-600'
              }`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {positions.map((pos) => {
              const item = heroItems.find(h => h.position === pos.value && h.isActive);
              const inactiveItems = heroItems.filter(h => h.position === pos.value && !h.isActive);
              
              return (
                <motion.div
                  key={pos.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border shadow-lg p-6 ${
                    darkMode
                      ? 'bg-moon-midnight/50 border-moon-gold/20'
                      : 'bg-white border-purple-200'
                  }`}
                >
                  <h3 className={`text-xl font-bold mb-4 ${
                    darkMode ? 'text-moon-silver' : 'text-gray-900'
                  }`}>
                    {pos.label}
                  </h3>

                  {item ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden h-32">
                        <img
                          src={item.product.images[0]?.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${item.gradient} p-2`}>
                          <p className="text-white text-sm font-bold">{item.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            darkMode
                              ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            darkMode
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                      darkMode ? 'border-moon-gold/20 text-moon-silver/40' : 'border-gray-300 text-gray-400'
                    }`}>
                      <p className="text-sm">No active item</p>
                      <p className="text-xs mt-1">Click "Add Hero Item" above</p>
                    </div>
                  )}

                  {/* Show inactive items */}
                  {inactiveItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-opacity-20">
                      <p className={`text-xs mb-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
                        Inactive ({inactiveItems.length}):
                      </p>
                      {inactiveItems.map(inactive => (
                        <div key={inactive._id} className="flex items-center justify-between text-xs mb-2">
                          <span className={darkMode ? 'text-moon-silver/80' : 'text-gray-600'}>
                            {inactive.title}
                          </span>
                          <button
                            onClick={() => toggleActive(inactive)}
                            className={`px-2 py-1 rounded text-xs ${
                              darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            Activate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${
                darkMode 
                  ? 'bg-moon-midnight border-moon-gold/30' 
                  : 'bg-white border-purple-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                  {editingItem ? 'Edit Hero Item' : 'Add Hero Item'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`text-2xl ${darkMode ? 'text-moon-silver hover:text-moon-gold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    Select Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id} className={darkMode ? 'bg-moon-midnight' : ''}>
                        {product.name} - ৳{product.basePrice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    Display Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  />
                </div>

                {/* Position */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  >
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.value} className={darkMode ? 'bg-moon-midnight' : ''}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gradient */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    Background Gradient
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {gradients.map(grad => (
                      <button
                        key={grad.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gradient: grad.value })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.gradient === grad.value
                            ? darkMode ? 'border-moon-gold' : 'border-purple-600'
                            : darkMode ? 'border-moon-gold/20' : 'border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-8 ${grad.color} rounded`}></div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                          {grad.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                      darkMode 
                        ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={`flex-1 px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'border-moon-gold/30 text-moon-silver hover:bg-moon-gold/20' 
                        : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
