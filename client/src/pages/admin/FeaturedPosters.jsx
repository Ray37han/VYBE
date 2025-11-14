import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiMove, FiImage, FiSave, FiX } from 'react-icons/fi';
import { adminAPI, productsAPI } from '../../api';
import toast from 'react-hot-toast';

export default function FeaturedPosters() {
  const [posters, setPosters] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    category: '',
    image: '',
    colorGradient: 'from-purple-600 to-pink-600',
    isActive: true
  });

  // Predefined color gradients
  const colorGradients = [
    { name: 'Purple-Pink', value: 'from-purple-600 to-pink-600' },
    { name: 'Red-Orange', value: 'from-red-600 to-orange-500' },
    { name: 'Blue-Cyan', value: 'from-blue-600 to-cyan-500' },
    { name: 'Yellow-Orange', value: 'from-yellow-500 to-orange-600' },
    { name: 'Green-Teal', value: 'from-green-500 to-teal-500' },
    { name: 'Red-Pink', value: 'from-red-700 to-pink-600' },
    { name: 'Purple-Blue', value: 'from-purple-600 to-blue-600' },
    { name: 'Gray-Dark', value: 'from-gray-700 to-gray-900' },
    { name: 'Gold-Yellow', value: 'from-yellow-600 to-amber-500' },
    { name: 'Emerald-Lime', value: 'from-emerald-600 to-lime-500' },
    { name: 'Indigo-Purple', value: 'from-indigo-600 to-purple-600' },
    { name: 'Rose-Pink', value: 'from-rose-600 to-pink-500' }
  ];

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
    fetchPosters();
    fetchProducts();
  }, []);

  const fetchPosters = async () => {
    try {
      const response = await adminAPI.get('/featured-posters/admin/all');
      setPosters(response.data);
    } catch (error) {
      console.error('Error fetching posters:', error);
      toast.error('Failed to load featured posters');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPoster) {
        await adminAPI.put(`/featured-posters/${editingPoster._id}`, formData);
        toast.success('Featured poster updated successfully');
      } else {
        await adminAPI.post('/featured-posters', formData);
        toast.success('Featured poster created successfully');
      }
      
      fetchPosters();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving poster:', error);
      toast.error(error.response?.data?.message || 'Failed to save featured poster');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (poster) => {
    setEditingPoster(poster);
    setFormData({
      productId: poster.productId || '',
      title: poster.title,
      category: poster.category,
      image: poster.image,
      colorGradient: poster.colorGradient,
      isActive: poster.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this featured poster?')) return;

    try {
      await adminAPI.delete(`/featured-posters/${id}`);
      toast.success('Featured poster deleted successfully');
      fetchPosters();
    } catch (error) {
      console.error('Error deleting poster:', error);
      toast.error('Failed to delete featured poster');
    }
  };

  const handleToggleActive = async (poster) => {
    try {
      await adminAPI.put(`/featured-posters/${poster._id}`, {
        isActive: !poster.isActive
      });
      toast.success(`Poster ${poster.isActive ? 'hidden' : 'activated'}`);
      fetchPosters();
    } catch (error) {
      console.error('Error toggling poster status:', error);
      toast.error('Failed to update poster status');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      title: '',
      category: '',
      image: '',
      colorGradient: 'from-purple-600 to-pink-600',
      isActive: true
    });
    setEditingPoster(null);
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId,
        title: product.name,
        category: product.category.charAt(0).toUpperCase() + product.category.slice(1),
        image: product.images?.[0]?.url || ''
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...posters];
    const draggedPoster = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedPoster);

    setDraggedItem(index);
    setPosters(items);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    // Update order in backend
    const reorderedPosters = posters.map((poster, index) => ({
      id: poster._id,
      order: index
    }));

    try {
      await adminAPI.put('/featured-posters/reorder/bulk', {
        posters: reorderedPosters
      });
      toast.success('Posters reordered successfully');
      setDraggedItem(null);
      fetchPosters();
    } catch (error) {
      console.error('Error reordering posters:', error);
      toast.error('Failed to reorder posters');
      fetchPosters(); // Revert to original order
    }
  };

  return (
    <div className={`pt-24 pb-12 min-h-screen ${darkMode ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night' : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-5xl font-bold bg-clip-text text-transparent ${
              darkMode 
                ? 'moon-gradient-text animate-glow' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            Featured Posters
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
            }`}
          >
            <FiPlus /> Add New Poster
          </motion.button>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            darkMode 
              ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver' 
              : 'bg-blue-50 border-blue-200 text-gray-800'
          }`}
        >
          <p className="text-sm">
            <strong>💡 Tip:</strong> Drag and drop posters to reorder them. The order here determines how they appear on the homepage.
          </p>
        </motion.div>

        {/* Posters Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-moon-gold' : 'border-purple-600'}`}
            />
          </div>
        ) : posters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-12 text-center rounded-2xl border ${
              darkMode 
                ? 'bg-moon-midnight/50 border-moon-gold/20' 
                : 'bg-white border-purple-100'
            }`}
          >
            <FiImage className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-moon-silver/40' : 'text-gray-400'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
              No Featured Posters
            </h2>
            <p className={darkMode ? 'text-moon-silver/60' : 'text-gray-600'}>
              Create your first featured poster to display on the homepage
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posters.map((poster, index) => (
              <motion.div
                key={poster._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`rounded-2xl border overflow-hidden cursor-move transition-all ${
                  draggedItem === index ? 'opacity-50 scale-95' : 'opacity-100'
                } ${
                  darkMode 
                    ? 'bg-moon-midnight/50 border-moon-gold/20 hover:border-moon-gold/40' 
                    : 'bg-white border-purple-100 hover:border-purple-300 shadow-lg'
                }`}
              >
                {/* Poster Image with Gradient Overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={poster.image}
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${poster.colorGradient}/90 via-transparent to-transparent flex items-end p-4`}>
                    <div>
                      <div className="text-white font-bold text-lg">{poster.title}</div>
                      <div className="text-white/80 text-sm">{poster.category}</div>
                    </div>
                  </div>
                  
                  {/* Drag Handle */}
                  <div className={`absolute top-2 left-2 p-2 rounded-lg ${
                    darkMode ? 'bg-moon-midnight/80' : 'bg-white/80'
                  }`}>
                    <FiMove className={darkMode ? 'text-moon-gold' : 'text-purple-600'} />
                  </div>

                  {/* Active Status Badge */}
                  {!poster.isActive && (
                    <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Hidden
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`p-4 flex justify-between items-center border-t ${
                  darkMode ? 'border-moon-gold/20' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(poster)}
                      className={`p-2 rounded-lg transition-colors ${
                        poster.isActive
                          ? darkMode ? 'text-moon-gold hover:bg-moon-gold/20' : 'text-green-600 hover:bg-green-50'
                          : darkMode ? 'text-moon-silver/50 hover:bg-moon-gold/20' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={poster.isActive ? 'Hide poster' : 'Show poster'}
                    >
                      {poster.isActive ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(poster)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-moon-gold hover:bg-moon-gold/20' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit poster"
                    >
                      <FiEdit2 size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(poster._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-500/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete poster"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                {/* Order Number */}
                <div className={`px-4 pb-3 text-xs ${darkMode ? 'text-moon-silver/50' : 'text-gray-500'}`}>
                  Position: {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div
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
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${
                  darkMode 
                    ? 'bg-moon-midnight border-moon-gold/30' 
                    : 'bg-white border-purple-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                    {editingPoster ? 'Edit Featured Poster' : 'Add New Featured Poster'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={`text-2xl ${darkMode ? 'text-moon-silver hover:text-moon-gold' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      <option value="">-- Choose a Product --</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ৳{product.basePrice} ({product.category})
                        </option>
                      ))}
                    </select>
                    {formData.productId && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
                        Product details will auto-fill below
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Cristiano Ronaldo, Lamborghini Aventador"
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        darkMode 
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                      }`}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Football Icon, Supercar, Racing Beast"
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        darkMode 
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                      }`}
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Image URL *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        darkMode 
                          ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                      }`}
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Color Gradient */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      Color Gradient *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorGradients.map((gradient) => (
                        <button
                          key={gradient.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, colorGradient: gradient.value }))}
                          className={`relative h-12 rounded-lg bg-gradient-to-r ${gradient.value} transition-all ${
                            formData.colorGradient === gradient.value
                              ? 'ring-4 ring-offset-2 ' + (darkMode ? 'ring-moon-gold ring-offset-moon-midnight' : 'ring-purple-600 ring-offset-white')
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className="text-white text-xs font-semibold">{gradient.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                      />
                      <span className="text-sm font-medium">Active (Show on homepage)</span>
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold disabled:opacity-50 ${
                        darkMode 
                          ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      }`}
                    >
                      <FiSave />
                      {loading ? 'Saving...' : editingPoster ? 'Update Poster' : 'Create Poster'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className={`flex-1 px-4 py-3 border rounded-lg font-semibold ${
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
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
