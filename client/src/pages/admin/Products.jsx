import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, productsAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'motivational',
    basePrice: '',
    sizes: [{ name: 'A4', dimensions: '8.3 x 11.7 inches', price: '' }],
    images: [],
    stock: '',
    tags: '',
    featured: false,
    newArrival: false,
    bestSelling: false,
    customizable: true,
    isActive: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    // All Posters
    'motivational', 'best-selling',
    // Cars & Bikes
    'bikes', 'sports-cars', 'vintage-cars', 'muscle-cars', 'vector-cars',
    // Sports
    'football-motivational', 'cricket', 'ufc', 'nba', 'f1', 'f1-motivational',
    // Pop Culture
    'marvel', 'dc', 'movies', 'tv-series', 'music', 'games',
    // Legacy categories
    'abstract', 'minimalist', 'nature', 'typography', 'custom', 'anime', 'vintage', 'modern', 'other'
  ];

  const sizeOptions = [
    { name: 'A5', dimensions: '5.8 x 8.3 inches' },
    { name: 'A4', dimensions: '8.3 x 11.7 inches' },
    { name: 'A3', dimensions: '11.7 x 16.5 inches' },
    { name: 'A2', dimensions: '16.5 x 23.4 inches' }
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products with increased limit
      const response = await productsAPI.getAll({ limit: 100 });
      console.log('Products response:', response);
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', dimensions: '', price: '' }]
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Check file sizes (5MB limit per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'motivational',
      basePrice: '',
      sizes: [{ name: 'A4', dimensions: '8.3 x 11.7 inches', price: '' }],
      images: [],
      stock: '',
      tags: '',
      featured: false,
      newArrival: false,
      bestSelling: false,
      customizable: true,
      isActive: true
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.basePrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Only check for images when creating new product
    if (imageFiles.length === 0 && !editingProduct) {
      toast.error('Please add at least one image');
      return;
    }

    // When editing, check if product has existing images or new ones being added
    if (editingProduct && imageFiles.length === 0 && (!formData.images || formData.images.length === 0)) {
      toast.error('Product must have at least one image');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Prepare product data object
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: Number(formData.basePrice),
        stock: Number(formData.stock),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        featured: formData.featured,
        newArrival: formData.newArrival,
        bestSelling: formData.bestSelling,
        customizable: formData.customizable,
        isActive: formData.isActive,
        sizes: formData.sizes.map(size => ({
          name: size.name,
          dimensions: size.dimensions,
          price: Number(size.price)
        }))
      };
      
      // When editing, keep existing images if no new ones uploaded
      if (editingProduct && imageFiles.length === 0) {
        productData.images = formData.images;
      }
      
      // Append product data as JSON string
      formDataToSend.append('productData', JSON.stringify(productData));
      
      // Append new image files if any
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, formDataToSend);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(formDataToSend);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      console.error('Status code:', error.response?.status);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Auth token exists:', !!localStorage.getItem('token'));
      
      // More specific error messages
      let errorMessage = 'Failed to save product';
      
      // Use custom error message if available
      if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Your images may be too large or internet connection is slow. Try:\n• Compress images before uploading\n• Use WiFi instead of mobile data\n• Upload fewer images at once';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Cannot connect to server. Please check:\n• Your internet connection\n• Backend server is running\n• You can access: https://vybe-backend-93eu.onrender.com/api/';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have admin privileges.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Files too large. Please reduce image sizes (max 50MB per image).';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
      sizes: product.sizes || [{ name: 'A4', dimensions: '8.3 x 11.7 inches', price: '' }],
      images: product.images || [],
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      featured: product.featured || false,
      newArrival: product.newArrival || false,
      bestSelling: product.bestSelling || false,
      customizable: product.customizable !== false,
      isActive: product.isActive !== false
    });
    setImagePreviews(product.images?.map(img => img.url) || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
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
            Product Management
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
            Add New Product
          </motion.button>
        </div>

        {/* Products List */}
        {loading && !showModal ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div 
                key={product._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl hover:translate-y-[-4px] ${
                  darkMode
                    ? 'bg-moon-midnight/50 border border-moon-gold/20'
                    : 'bg-white border border-purple-100'
                }`}
              >
                {product.images?.[0] && (
                  <img 
                    src={product.images[0].url} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-lg ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>{product.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          ⭐
                        </span>
                      )}
                      {product.newArrival && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          NEW
                        </span>
                      )}
                      {product.bestSelling && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          🔥
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>৳{product.basePrice}</span>
                    <span className={`text-sm ${darkMode ? 'text-moon-silver/50' : 'text-gray-500'}`}>Stock: {product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold ${
                        darkMode
                          ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold ${
                        darkMode
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-lg">No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <div className="min-h-screen flex items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full sm:w-auto sm:min-w-[600px] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl m-0 sm:my-8 sm:mx-auto rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border max-h-screen sm:max-h-[95vh] overflow-hidden flex flex-col ${
                  darkMode 
                    ? 'bg-moon-midnight sm:border-moon-gold/30' 
                    : 'bg-white sm:border-purple-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky Header */}
                <div className={`flex-shrink-0 px-4 sm:px-6 md:px-8 py-4 border-b ${
                  darkMode 
                    ? 'bg-moon-midnight border-moon-gold/20' 
                    : 'bg-white border-purple-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button 
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className={`text-3xl sm:text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        darkMode 
                          ? 'text-moon-silver hover:text-moon-gold hover:bg-moon-gold/10' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="sm:col-span-2">
                        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter product name"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                          }`}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className={darkMode ? 'bg-moon-midnight text-moon-silver' : ''}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          Base Price (৳) *
                        </label>
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          placeholder="0"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe your product..."
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none ${
                          darkMode 
                            ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          Stock *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="0"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                          }`}
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="poster, art, modern"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Sizes */}
                    <div>
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Sizes & Pricing</label>
                        <button
                          type="button"
                          onClick={addSize}
                          className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            darkMode 
                              ? 'text-moon-gold hover:bg-moon-gold/10' 
                              : 'text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          + Add Size
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.sizes.map((size, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={size.name}
                              onChange={(e) => {
                                const selected = sizeOptions.find(s => s.name === e.target.value);
                                handleSizeChange(index, 'name', e.target.value);
                                if (selected) {
                                  handleSizeChange(index, 'dimensions', selected.dimensions);
                                }
                              }}
                              className={`w-full sm:w-24 px-2 sm:px-3 py-2 text-sm border rounded-lg ${
                                darkMode 
                                  ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="" className={darkMode ? 'bg-moon-midnight' : ''}>Size</option>
                              {sizeOptions.map(opt => (
                                <option key={opt.name} value={opt.name} className={darkMode ? 'bg-moon-midnight text-moon-silver' : ''}>{opt.name}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={size.dimensions}
                              onChange={(e) => handleSizeChange(index, 'dimensions', e.target.value)}
                              placeholder="Dimensions"
                              className={`flex-1 px-2 sm:px-3 py-2 text-sm border rounded-lg ${
                                darkMode 
                                  ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={size.price}
                                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                placeholder="Price"
                                className={`flex-1 sm:w-24 px-2 sm:px-3 py-2 text-sm border rounded-lg ${
                                  darkMode 
                                    ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                              {formData.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSize(index)}
                                  className={`px-3 py-2 rounded-lg transition-all ${
                                    darkMode 
                                      ? 'text-red-400 hover:bg-red-500/20' 
                                      : 'text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        Product Images * <span className="text-xs opacity-60">(Max 5, 5MB each)</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className={`w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold transition-all ${
                          darkMode 
                            ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver file:bg-moon-gold file:text-moon-night' 
                            : 'bg-white border-gray-300 text-gray-900 file:bg-purple-600 file:text-white'
                        }`}
                      />
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 sm:mt-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-sm shadow-lg"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                      <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                        />
                        <span className="text-xs sm:text-sm">Featured</span>
                      </label>

                      <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          name="newArrival"
                          checked={formData.newArrival}
                          onChange={handleInputChange}
                          className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                        />
                        <span className="text-xs sm:text-sm">New Arrival</span>
                      </label>

                      <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          name="bestSelling"
                          checked={formData.bestSelling}
                          onChange={handleInputChange}
                          className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                        />
                        <span className="text-xs sm:text-sm">Best Selling</span>
                      </label>

                      <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          name="customizable"
                          checked={formData.customizable}
                          onChange={handleInputChange}
                          className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                        />
                        <span className="text-xs sm:text-sm">Customizable</span>
                      </label>

                      <label className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className={`w-4 h-4 ${darkMode ? 'accent-moon-gold' : 'accent-purple-600'}`}
                        />
                        <span className="text-xs sm:text-sm">Active</span>
                      </label>
                    </div>
                  </form>
                </div>

                {/* Sticky Footer */}
                <div className={`flex-shrink-0 px-4 sm:px-6 md:px-8 py-4 border-t ${
                  darkMode 
                    ? 'bg-moon-midnight border-moon-gold/20' 
                    : 'bg-white border-purple-100'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`w-full sm:flex-1 px-4 py-3 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
                        darkMode 
                          ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-moon-gold/50' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
                      }`}
                    >
                      {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className={`w-full sm:flex-1 px-4 py-3 sm:py-3 text-sm sm:text-base border rounded-lg font-semibold transition-all ${
                        darkMode 
                          ? 'border-moon-gold/30 text-moon-silver hover:bg-moon-gold/10' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
