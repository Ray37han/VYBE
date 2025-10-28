import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiStar, FiZap, FiPackage, FiGrid } from 'react-icons/fi';
import { productsAPI } from '../api';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
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
  { value: 'cricket', label: 'Cricket', icon: '🏏' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'nba', label: 'NBA', icon: '🏀' },
  { value: 'cars', label: 'Cars', icon: '🏎️' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
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
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await productsAPI.getAll(params);
      setProducts(response.data || response || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  return (
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
          className={`mb-12 backdrop-blur-xl p-6 rounded-2xl border shadow-2xl relative overflow-hidden group ${
            darkMode
              ? 'bg-moon-midnight/50 border-moon-gold/20'
              : 'bg-white/70 border-purple-200'
          }`}
        >
          {/* Animated Background */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            darkMode
              ? 'bg-gradient-to-r from-moon-mystical/5 via-moon-gold/5 to-moon-mystical/5'
              : 'bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-purple-100/50'
          }`}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {/* Search */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative group/search"
            >
              <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 group-hover/search:${
                darkMode ? 'text-moon-gold' : 'text-purple-600'
              } transition-colors animate-pulse-slow w-5 h-5 ${
                darkMode ? 'text-moon-gold/60' : 'text-purple-400'
              }`} />
              <input
                type="text"
                placeholder="Search mystical art..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  darkMode
                    ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold focus:ring-moon-gold/20'
                    : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-purple-200'
                }`}
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.03,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <Link to={`/products/${product._id}`} className="block group">
                  <div className={`card-moon overflow-hidden h-full flex flex-col relative ${
                    !darkMode && 'bg-white border-2 border-purple-100'
                  }`}>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 ${
                      darkMode
                        ? 'bg-gradient-to-b from-moon-mystical/0 via-moon-gold/0 to-moon-mystical/20'
                        : 'bg-gradient-to-b from-purple-100/0 via-pink-100/0 to-purple-100/30'
                    }`}></div>
                    
                    <div className={`relative aspect-[3/4] overflow-hidden border-b ${
                      darkMode
                        ? 'bg-moon-night/30 border-moon-gold/20'
                        : 'bg-gray-50 border-purple-100'
                    }`}>
                      <img
                        src={product.images[0]?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%230a0e27" width="400" height="500"/%3E%3Ctext fill="%23cbd5e1" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                        alt={product.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700 ease-out"
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
                        🎉 25% OFF
                      </motion.span>
                      
                      {product.customizable && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute top-4 right-4 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse-slow ${
                            darkMode
                              ? 'bg-gradient-to-r from-moon-mystical to-moon-gold'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600'
                          }`}
                        >
                          ⚡ Customizable
                        </motion.span>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex items-end justify-center pb-4 ${
                        darkMode ? 'from-moon-night/90' : 'from-white/90'
                      }`}>
                        <motion.span
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className={`font-bold text-lg tracking-wider ${
                            darkMode ? 'text-moon-gold' : 'text-purple-600'
                          }`}
                        >
                          View Details →
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className={darkMode ? 'p-5 flex-1 flex flex-col bg-moon-midnight/30' : 'p-5 flex-1 flex flex-col bg-white'}>
                      <h3 className={`font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-moon-silver group-hover:text-moon-gold'
                          : 'text-gray-900 group-hover:text-purple-600'
                      }`}>
                        {product.name}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 flex-1 ${
                        darkMode ? 'text-moon-silver/60' : 'text-gray-600'
                      }`}>
                        {product.description}
                      </p>
                      <div className={`flex items-center justify-between pt-3 border-t ${
                        darkMode ? 'border-moon-gold/20' : 'border-purple-100'
                      }`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold animate-glow ${
                              darkMode ? 'text-moon-gold' : 'text-purple-600'
                            }`}>
                              ৳{product.basePrice}
                            </span>
                            <span className={`text-sm line-through ${
                              darkMode ? 'text-moon-silver/40' : 'text-gray-400'
                            }`}>
                              ৳{Math.round(product.basePrice / 0.75)}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            25% OFF
                          </span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${
                          darkMode ? 'text-moon-silver/80' : 'text-gray-600'
                        }`}>
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse-slow" />
                          <span className="font-semibold">{product.rating.average.toFixed(1)}</span>
                          <span className={darkMode ? 'text-moon-silver/40' : 'text-gray-400'}>({product.rating.count})</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Border Glow on Hover */}
                    <div className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-500 ease-out pointer-events-none ${
                      darkMode ? 'group-hover:border-moon-gold/50' : 'group-hover:border-purple-400/50'
                    }`}></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
