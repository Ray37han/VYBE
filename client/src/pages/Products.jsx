import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiStar, FiZap, FiPackage, FiGrid, FiX } from 'react-icons/fi';
import Fuse from 'fuse.js';
import { productsAPI } from '../api';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import LoadingSpinner, { FullPageLoader } from '../components/LoadingSpinner';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/PageTransition';
import SpotlightContainer from '../components/SpotlightContainer';
import MagneticButton from '../components/MagneticButton';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: '✨ All Collections', icon: '🌟' },
  { value: 'abstract', label: 'Abstract Art', icon: '🎨' },
  { value: 'minimalist', label: 'Minimalist', icon: '⚪' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'typography', label: 'Typography', icon: '📝' },
  { value: 'custom', label: 'Custom Creations', icon: '👑' },
  { value: 'anime', label: 'Anime', icon: '⚡' },
  { value: 'vintage', label: 'Vintage', icon: '📻' },
  { value: 'modern', label: 'Modern', icon: '🔮' },
  { value: 'sports', label: 'Sports', icon: '🏆' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'cricket', label: 'Cricket', icon: '🏏' },
  { value: 'nba', label: 'NBA', icon: '🏀' },
  { value: 'cars', label: 'Cars', icon: '🏎️' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for client-side search
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Default to light theme
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme ? savedTheme === 'dark' : false); // Default to light

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

  // Initialize Fuse.js for flexible fuzzy search
  const fuse = useMemo(() => {
    if (allProducts.length === 0) return null;
    return new Fuse(allProducts, {
      keys: ['name', 'category', 'description'],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 1,
      distance: 100,
      includeScore: true,
    });
  }, [allProducts]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      
      // Fetch all products initially for client-side search
      if (allProducts.length === 0) {
        const allResponse = await productsAPI.getAll({ limit: 1000 });
        setAllProducts(allResponse.data || allResponse || []);
      }
      
      // If search query exists, use Fuse.js for fuzzy search
      if (params.search && allProducts.length > 0) {
        const fuseInstance = new Fuse(allProducts, {
          keys: ['name', 'category', 'description'],
          threshold: 0.3,
          ignoreLocation: true,
          minMatchCharLength: 1,
          distance: 100,
          includeScore: true,
        });
        
        const searchResults = fuseInstance.search(params.search).map(result => result.item);
        
        // Apply category filter if present
        let filteredResults = searchResults;
        if (params.category) {
          filteredResults = searchResults.filter(p => p.category === params.category);
        }
        
        setProducts(filteredResults);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredResults.length,
          itemsPerPage: filteredResults.length
        });
      } else {
        // Regular API call with filters
        params.limit = 20;
        params.page = params.page || 1;
        
        const response = await productsAPI.getAll(params);
        
        // Update products and pagination data
        setProducts(response.data || response || []);
        
        // Update pagination state from response
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
            itemsPerPage: response.pagination.itemsPerPage
          });
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setInitialLoad(false); // Mark initial load as complete
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newFilters.page = '1';
    }
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleFilterChange('page', page.toString());
  };

  return (
    <>
      {/* Show full page loader on initial load */}
      {initialLoad ? (
        <FullPageLoader text="Loading Mystical Collection..." />
      ) : (
        <div className={`pt-28 pb-12 min-h-screen relative overflow-hidden ${
          darkMode
            ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
            : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
        }`}>
      {/* Background Effects */}
      <div className={`absolute inset-0 hieroglyph-overlay ${darkMode ? 'opacity-10' : 'opacity-5'}`}></div>
      <div className={`absolute inset-0 animate-pulse-slow ${
        darkMode
          ? 'bg-gradient-to-r from-moon-mystical/5 via-transparent to-moon-gold/5'
          : 'bg-gradient-to-r from-purple-200/20 via-transparent to-pink-200/20'
      }`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-6xl font-bold mb-4 animate-glow ${
              darkMode ? 'moon-gradient-text' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              Mystical Collection
            </h1>
            <p className={`text-xl tracking-wide ${
              darkMode ? 'text-moon-silver/80' : 'text-gray-600'
            }`}>
              Discover Your Perfect Essence
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FiZap className={`w-6 h-6 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`} />
              </motion.div>
              <span className={`text-sm tracking-widest uppercase ${
                darkMode ? 'text-moon-silver/60' : 'text-gray-500'
              }`}>
                {products.length} Masterpieces Available
              </span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FiStar className={`w-6 h-6 ${darkMode ? 'text-moon-mystical' : 'text-pink-600'}`} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters - Moon Knight Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-12 p-6 rounded-2xl border shadow-2xl relative overflow-hidden group ${
            darkMode
              ? 'bg-moon-midnight border-moon-gold/20'
              : 'bg-white border-purple-200'
          }`}
        >
          {/* Animated Background */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            darkMode
              ? 'bg-gradient-to-r from-moon-mystical/5 via-moon-gold/5 to-moon-mystical/5'
              : 'bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-purple-100/50'
          }`}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {/* Search - Optimized with Fuse.js */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative group/search"
            >
              <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 w-5 h-5 ${
                filters.search
                  ? (darkMode ? 'text-moon-gold' : 'text-purple-600')
                  : (darkMode ? 'text-moon-gold/60' : 'text-purple-400')
              } ${
                filters.search ? 'scale-110' : 'group-hover/search:scale-110'
              }`} />
              <input
                type="text"
                placeholder="🔍 Search anywhere in name, category, description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  darkMode
                    ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold focus:ring-moon-gold/20'
                    : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-purple-200'
                }`}
              />
              {filters.search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFilterChange('search', '')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-moon-gold/20 text-moon-gold'
                      : 'hover:bg-purple-100 text-purple-600'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>

            {/* Category */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 outline-none cursor-pointer ${
                  darkMode
                    ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold focus:ring-moon-gold/20'
                    : 'bg-white border-purple-200 text-gray-900 focus:border-purple-600 focus:ring-purple-200'
                }`}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className={darkMode ? 'bg-moon-midnight text-moon-silver' : 'bg-white text-gray-900'}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Sort */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 outline-none cursor-pointer ${
                  darkMode
                    ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold focus:ring-moon-gold/20'
                    : 'bg-white border-purple-200 text-gray-900 focus:border-purple-600 focus:ring-purple-200'
                }`}
              >
                <option value="-createdAt" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>🆕 Newest First</option>
                <option value="basePrice" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>💰 Price: Low to High</option>
                <option value="-basePrice" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>💎 Price: High to Low</option>
                <option value="-rating.average" className={darkMode ? 'bg-moon-midnight' : 'bg-white'}>⭐ Highest Rated</option>
              </select>
            </motion.div>

            {/* Clear Filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilters({
                  category: '',
                  search: '',
                  minPrice: '',
                  maxPrice: '',
                  sort: '-createdAt',
                });
                setSearchParams({});
              }}
              className={`px-6 py-3 border rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                darkMode
                  ? 'bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/50 hover:to-pink-600/50 text-moon-silver border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/20'
                  : 'bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 border-red-300 hover:border-red-400 hover:shadow-red-300/40'
              }`}
            >
              🔄 Reset Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} darkMode={darkMode} />
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-20 rounded-2xl border ${
              darkMode
                ? 'bg-moon-midnight/30 border-moon-gold/20'
                : 'bg-white/50 border-purple-200'
            }`}
          >
            <FiPackage className={`w-20 h-20 mx-auto mb-4 animate-bounce ${
              darkMode ? 'text-moon-gold/40' : 'text-purple-300'
            }`} />
            <p className={`text-3xl font-bold ${
              darkMode ? 'text-moon-silver/60' : 'text-gray-400'
            }`}>No Masterpieces Found</p>
            <p className={`mt-2 ${
              darkMode ? 'text-moon-silver/40' : 'text-gray-400'
            }`}>Try adjusting your filters</p>
          </motion.div>
        ) : (
          <SpotlightContainer>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <StaggerItem key={product._id}>
                  <motion.div
                    className="product-card-spotlight gpu-accelerated"
                  >
                    <Link to={`/products/${product._id}`} className="block group">
                      <div className={`card-moon overflow-hidden h-full flex flex-col relative transition-all duration-300 ${
                        !darkMode && 'bg-white border-2 border-purple-100 hover:border-gray-900 hover:shadow-2xl hover:shadow-black/30'
                      } ${darkMode && 'hover:border-black hover:bg-black/40 hover:shadow-2xl hover:shadow-black/50'}`}>
                        {/* Sharp Black Overlay on Hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 ${
                          darkMode
                            ? 'bg-gradient-to-br from-black/30 via-black/50 to-black/70'
                            : 'bg-gradient-to-br from-black/20 via-black/30 to-black/50'
                        }`}></div>
                    
                    <div className={`relative aspect-[3/4] overflow-hidden border-b transition-all duration-300 ${
                      darkMode
                        ? 'bg-moon-night/30 border-moon-gold/20 group-hover:bg-black/60 group-hover:border-black'
                        : 'bg-gray-50 border-purple-100 group-hover:bg-black/80 group-hover:border-black'
                    }`}>
                      <img
                        src={product.images[0]?.urls?.thumbnail || product.images[0]?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%230a0e27" width="400" height="500"/%3E%3Ctext fill="%23cbd5e1" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300 ease-out relative z-20"
                      />
                      
                      {/* Discount Badge */}
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          darkMode
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-green-600 to-emerald-700'
                        }`}
                      >
                        🎉 33% OFF
                      </motion.span>
                      
                      {product.customizable && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute top-4 right-4 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                            darkMode
                              ? 'bg-gradient-to-r from-moon-mystical to-moon-gold'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600'
                          }`}
                        >
                          ⚡ Customizable
                        </motion.span>
                      )}
                      
                      {/* Hover Overlay - Sharp Black Background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out flex items-end justify-center pb-4">
                        <motion.span
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className="font-bold text-lg tracking-wider text-white drop-shadow-lg"
                        >
                          View Details →
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className={`${darkMode ? 'p-5 flex-1 flex flex-col bg-moon-midnight/30 group-hover:bg-black/60' : 'p-5 flex-1 flex flex-col bg-white group-hover:bg-black/90'} transition-all duration-300 relative z-20`}>
                      <h3 className={`font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-moon-silver group-hover:text-white'
                          : 'text-gray-900 group-hover:text-white'
                      }`}>
                        {product.name}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 flex-1 transition-colors duration-300 ${
                        darkMode ? 'text-moon-silver/60 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-300'
                      }`}>
                        {product.description}
                      </p>
                      <div className={`flex items-center justify-between pt-3 border-t transition-colors duration-300 ${
                        darkMode ? 'border-moon-gold/20 group-hover:border-white/30' : 'border-purple-100 group-hover:border-white/30'
                      }`}>
                        <motion.div 
                          className="relative inline-block"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                                darkMode ? 'text-moon-gold group-hover:text-white' : 'text-purple-600'
                              }`}>
                                ৳{product.basePrice}
                              </span>
                              <span className={`text-sm line-through ${
                                darkMode ? 'text-moon-silver/40' : 'text-gray-400'
                              }`}>
                                ৳{product.originalPrice || Math.round(product.basePrice / 0.67)}
                              </span>
                            </div>
                            <span className={`text-xs font-semibold ${
                              darkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              33% OFF
                            </span>
                          </div>
                          {/* Premium Minimal Accent Line */}
                          <motion.div 
                            className={`absolute bottom-0 left-0 h-0.5 ${
                              darkMode 
                                ? 'bg-gradient-to-r from-moon-gold via-moon-mystical to-moon-gold' 
                                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'
                            }`}
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                          />
                        </motion.div>
                        <div className={`flex items-center space-x-1 text-sm ${
                          darkMode ? 'text-moon-silver/80' : 'text-gray-600'
                        }`}>
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">{product.rating.average.toFixed(1)}</span>
                          <span className={darkMode ? 'text-moon-silver/40' : 'text-gray-400'}>({product.rating.count})</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sharp Border Glow on Hover */}
                    <div className="absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-500 ease-out pointer-events-none group-hover:border-white/40 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"></div>
                  </div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SpotlightContainer>
        )}

        {/* Pagination Controls */}
        {!loading && products.length > 0 && pagination.totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center gap-6"
          >
            {/* Page Info */}
            <div className={`text-center ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
              <p className="text-sm font-medium">
                Showing <span className={`font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                </span> to <span className={`font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span> of <span className={`font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  {pagination.totalItems}
                </span> products
              </p>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Previous Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  pagination.currentPage === 1
                    ? darkMode 
                      ? 'bg-moon-midnight/30 text-moon-silver/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : darkMode
                      ? 'bg-moon-midnight border border-moon-gold/30 text-moon-gold hover:bg-moon-gold hover:text-moon-night'
                      : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                ← Previous
              </motion.button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {(() => {
                  const pages = [];
                  const maxVisible = 7;
                  let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  // First page
                  if (startPage > 1) {
                    pages.push(
                      <motion.button
                        key={1}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(1)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                          darkMode
                            ? 'bg-moon-midnight border border-moon-gold/30 text-moon-silver hover:bg-moon-gold hover:text-moon-night'
                            : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-600 hover:text-purple-600'
                        }`}
                      >
                        1
                      </motion.button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots1" className={darkMode ? 'text-moon-silver' : 'text-gray-400'}>
                          ...
                        </span>
                      );
                    }
                  }

                  // Page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(i)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                          pagination.currentPage === i
                            ? darkMode
                              ? 'bg-moon-gold text-moon-night shadow-lg shadow-moon-gold/50'
                              : 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                            : darkMode
                              ? 'bg-moon-midnight border border-moon-gold/30 text-moon-silver hover:bg-moon-gold hover:text-moon-night'
                              : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-600 hover:text-purple-600'
                        }`}
                      >
                        {i}
                      </motion.button>
                    );
                  }

                  // Last page
                  if (endPage < pagination.totalPages) {
                    if (endPage < pagination.totalPages - 1) {
                      pages.push(
                        <span key="dots2" className={darkMode ? 'text-moon-silver' : 'text-gray-400'}>
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <motion.button
                        key={pagination.totalPages}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                          darkMode
                            ? 'bg-moon-midnight border border-moon-gold/30 text-moon-silver hover:bg-moon-gold hover:text-moon-night'
                            : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-600 hover:text-purple-600'
                        }`}
                      >
                        {pagination.totalPages}
                      </motion.button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  pagination.currentPage === pagination.totalPages
                    ? darkMode 
                      ? 'bg-moon-midnight/30 text-moon-silver/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : darkMode
                      ? 'bg-moon-midnight border border-moon-gold/30 text-moon-gold hover:bg-moon-gold hover:text-moon-night'
                      : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                Next →
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
      )}
    </>
  );
}
