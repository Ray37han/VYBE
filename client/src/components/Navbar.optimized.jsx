import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome, FiEdit, FiMoon, FiSun, FiChevronDown, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import { authAPI, productsAPI } from '../api';
import { CartButton, MenuButton } from '../components/AnimatedIcon';
import { usePageLoad } from '../hooks/usePageLoad';
import toast from 'react-hot-toast';

// Main 10 categories matching the landing page
const categories = [
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'cars', label: 'Cars', icon: '🚗' },
  { value: 'bikes', label: 'Bikes', icon: '🏍️' },
  { value: 'f1', label: 'F1', icon: '🏁' },
  { value: 'tv-series', label: 'Series', icon: '📺' },
  { value: 'movies', label: 'Movies', icon: '🎬' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'games', label: 'Games', icon: '🎮' },
  { value: 'anime', label: 'Anime', icon: '⚡' },
  { value: 'motivational', label: 'Motivational', icon: '💪' },
];

export default function NavbarOptimized() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();
  
  // CRITICAL: Wait for page load before animating
  const isLoaded = usePageLoad(500);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchTimerRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions from server
  const fetchSuggestions = useCallback((query) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await productsAPI.searchSuggestions(query.trim());
        setSearchSuggestions(res.data || []);
        setShowSearchSuggestions(true);
      } catch {
        setShowSearchSuggestions(false);
      }
    }, 250);
  }, []);

  const handleSearchSubmit = (q) => {
    const term = (q || searchQuery).trim();
    if (!term) return;
    setShowSearchSuggestions(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleSuggestionClick = (product) => {
    setShowSearchSuggestions(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products/${product._id}`);
  };

  const cleanProductName = (name) => {
    if (!name) return '';
    return name
      .replace(/\s*\|\|\s*#\d+/g, '')
      .replace(/\s*#\d+$/g, '')
      .replace(/\s*\(\d+\)$/g, '')
      .replace(/\s*-\s*\d+$/g, '')
      .replace(/^\d+\.\s*/g, '')
      .trim();
  };

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    
    if (savedTheme) {
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference and use it as default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('theme', systemTheme);
      setDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme');
      if (theme) {
        const isDarkTheme = theme === 'dark';
        setDarkMode(isDarkTheme);
        if (isDarkTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      // Only auto-update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const prefersDark = e.matches;
        setDarkMode(prefersDark);
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        window.dispatchEvent(new Event('themeChange'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 border-b shadow-2xl transition-colors duration-500 gpu-safe ${
        darkMode 
          ? 'blur-safe dark blur-safe-desktop border-moon-gold/20' 
          : 'blur-safe blur-safe-desktop border-purple-200'
      }`}
      style={{
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 pointer-events-none ${
        darkMode 
          ? 'bg-gradient-to-r from-moon-mystical/5 via-moon-gold/5 to-moon-mystical/5'
          : 'bg-gradient-to-r from-purple-100/5 via-blue-100/5 to-pink-100/5'
      }`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Self-Drawing SVG Animation */}
          <Link to="/" className="flex items-center space-x-3">
            <div 
              className={`relative py-2 ${!isLoaded ? 'navbar-hidden' : 'navbar-logo-enter'}`}
            >
              {/* Snowfall effect container */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: '200px', height: '60px' }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute opacity-60 ${darkMode ? 'text-white' : 'text-purple-600'}`}
                    style={{
                      left: `${15 + i * 25}%`,
                      fontSize: `${8 + Math.random() * 6}px`,
                      animation: `snowfall ${3 + Math.random() * 2}s linear ${i * 0.3}s infinite`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  >
                    ❄
                  </div>
                ))}
              </div>
              
              <svg
                width="200"
                height="60"
                viewBox="0 0 200 60"
                className="overflow-visible relative z-10"
                style={{ transform: 'translateZ(0)', willChange: 'transform' }}
              >
                <defs>
                  {/* Gradient for the text */}
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: darkMode ? '#8B5CF6' : '#9333EA', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: darkMode ? '#A78BFA' : '#C084FC', stopOpacity: 1 }} />
                  </linearGradient>
                  
                  {/* Glow filter */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Self-drawing text paths */}
                <text
                  x="10"
                  y="45"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Fredoka', 'Nunito', 'Poppins', sans-serif"
                  fill="none"
                  stroke="url(#logoGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  className={isLoaded ? 'logo-draw' : ''}
                  style={{
                    strokeDasharray: 400,
                    strokeDashoffset: isLoaded ? 0 : 400,
                    animation: isLoaded ? 'drawLogo 2s ease-out forwards' : 'none',
                    paintOrder: 'stroke fill'
                  }}
                >
                  VYBE
                </text>
                
                {/* Filled text (appears after stroke animation) */}
                <text
                  x="10"
                  y="45"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Fredoka', 'Nunito', 'Poppins', sans-serif"
                  fill={darkMode ? '#FFFFFF' : '#111827'}
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    animation: isLoaded ? 'fadeInFill 0.5s ease-out 1.8s forwards' : 'none',
                  }}
                >
                  VYBE
                </text>
              </svg>
            </div>
          </Link>

          {/* Desktop Navigation - Staggered CSS Animation */}
          <div className={`hidden md:flex items-center space-x-1 ${!isLoaded ? 'navbar-hidden' : ''}`}>
            <div className={isLoaded ? 'navbar-item-enter' : ''}>
              <NavLink to="/" icon={FiHome} darkMode={darkMode}>Home</NavLink>
            </div>
            
            {/* Products Dropdown */}
            <div 
              className={`relative ${isLoaded ? 'navbar-item-enter' : ''}`}
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <button
                onClick={() => navigate('/products')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300 ease-out border font-semibold text-sm group relative overflow-hidden active:scale-95 ${
                  darkMode
                    ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver hover:text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-400'
                }`}
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                }}
              >
                <FiPackage className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 ease-out" />
                <span>Shop</span>
                <FiChevronDown 
                  className={`w-4 h-4 transition-transform duration-300 ${productsDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu - Only animate after page load */}
              {isLoaded && (
                <AnimatePresence>
                  {productsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-2xl border overflow-hidden z-50 gpu-safe ${
                        darkMode
                          ? 'blur-safe dark blur-safe-desktop border-moon-gold/30'
                          : 'blur-safe blur-safe-desktop border-purple-200'
                      }`}
                      style={{
                        transform: 'translate3d(0, 0, 0)',
                        WebkitTransform: 'translate3d(0, 0, 0)',
                        willChange: 'transform',
                      }}
                    >
                      <div className={`px-4 py-3 border-b ${
                        darkMode ? 'border-moon-gold/20' : 'border-purple-200'
                      }`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${
                          darkMode ? 'text-moon-gold' : 'text-purple-600'
                        }`}>
                          Browse Categories
                        </p>
                      </div>
                      
                      <div className="py-2">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            onClick={() => {
                              navigate(`/products?category=${category.value}`);
                              setProductsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                              darkMode
                                ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold'
                                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            <span className="mr-3 text-base">{category.icon}</span>
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Search Bar — Desktop */}
            <div className={`relative ${isLoaded ? 'navbar-item-enter' : ''}`} ref={searchRef}>
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                  darkMode ? 'text-moon-gold/60' : 'text-purple-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                    if (e.key === 'Escape') {
                      setShowSearchSuggestions(false);
                      e.target.blur();
                    }
                  }}
                  onFocus={() => searchQuery.length >= 2 && searchSuggestions.length > 0 && setShowSearchSuggestions(true)}
                  placeholder="Search posters..."
                  className={`w-40 lg:w-52 pl-9 pr-8 py-2 text-sm rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-moon-midnight/50 border-moon-gold/20 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold focus:ring-moon-gold/20'
                      : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200'
                  }`}
                  style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSearchSuggestions(false); }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                      darkMode ? 'hover:bg-moon-gold/20 text-moon-gold/60' : 'hover:bg-purple-100 text-purple-400'
                    }`}
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-[100] gpu-safe ${
                  darkMode
                    ? 'bg-moon-midnight/95 border-moon-gold/30'
                    : 'bg-white border-purple-200'
                }`} style={{ minWidth: '280px' }}>
                  <div className="max-h-80 overflow-y-auto">
                    {searchSuggestions.map((product) => (
                      <button
                        key={product._id}
                        onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(product); }}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                          darkMode ? 'hover:bg-moon-gold/10 text-moon-silver' : 'hover:bg-purple-50 text-gray-700'
                        }`}
                      >
                        {product.thumbnail && (
                          <img src={product.thumbnail} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" loading="lazy" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cleanProductName(product.name)}</div>
                          <div className={`text-xs ${darkMode ? 'text-moon-silver/50' : 'text-gray-400'}`}>{product.category}</div>
                        </div>
                        {product.basePrice && (
                          <span className={`text-sm font-bold flex-shrink-0 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>৳{product.basePrice}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* View All Results */}
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleSearchSubmit(); }}
                    className={`w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider border-t transition-colors ${
                      darkMode
                        ? 'border-moon-gold/20 text-moon-gold hover:bg-moon-gold/10'
                        : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    View All Results →
                  </button>
                </div>
              )}
            </div>

            <div className={isLoaded ? 'navbar-item-enter' : ''}>
              <NavLink to="/customize" icon={FiEdit} darkMode={darkMode}>Customize</NavLink>
            </div>

            {/* Admin Link - Only for admins */}
            {isAuthenticated && user?.role === 'admin' && (
              <div className={isLoaded ? 'navbar-item-enter' : ''}>
                <NavLink to="/admin" icon={FiUser} darkMode={darkMode}>Admin</NavLink>
              </div>
            )}

            {/* Cart Button */}
            <div className={isLoaded ? 'navbar-item-enter' : ''}>
              <Link 
                to="/cart" 
                aria-label="Cart"
                title="Cart"
                className={`relative h-10 w-10 inline-flex items-center justify-center leading-none p-2 rounded-xl transition-all duration-300 border active:scale-95 transform-gpu will-change-transform ${
                  darkMode
                    ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver border-moon-gold/20 hover:border-moon-gold/50'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400'
                }`}
              >
                <FiShoppingCart className="w-4 h-4" />
                {itemCount > 0 && isLoaded && (
                  <span className={`pointer-events-none absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold navbar-cart-badge ${
                    darkMode
                      ? 'bg-moon-gold text-moon-night'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User Menu */}
            <div className={isLoaded ? 'navbar-item-enter' : ''}>
              {isAuthenticated ? (
                <div className="relative group">
                  <button className={`h-10 w-10 inline-flex items-center justify-center leading-none p-2 rounded-xl transition-all duration-300 border active:scale-95 ${
                    darkMode
                      ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver border-moon-gold/20 hover:border-moon-gold/50'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400'
                  }`}
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                  }}>
                    <FiUser className="w-4 h-4" />
                  </button>
                  
                  {isLoaded && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                      darkMode
                        ? 'bg-moon-midnight/95 border-moon-gold/30'
                        : 'bg-white border-purple-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${
                        darkMode ? 'border-moon-gold/20' : 'border-purple-200'
                      }`}>
                        <p className={`text-sm font-semibold ${
                          darkMode ? 'text-moon-gold' : 'text-purple-600'
                        }`}>
                          {user?.name || 'User'}
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-moon-silver' : 'text-gray-500'
                        }`}>
                          {user?.email}
                        </p>
                      </div>
                      
                      <Link
                        to="/account"
                        className={`block px-4 py-2 text-sm transition-colors ${
                          darkMode
                            ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      >
                        <FiUser className="inline w-4 h-4 mr-2" />
                        My Account
                      </Link>
                      
                      <Link
                        to="/my-orders"
                        className={`block px-4 py-2 text-sm transition-colors ${
                          darkMode
                            ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      >
                        <FiPackage className="inline w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          darkMode
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <FiLogOut className="inline w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 border active:scale-95 ${
                    darkMode
                      ? 'bg-moon-gold text-moon-night border-moon-gold hover:bg-moon-gold/90'
                      : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                  }`}
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                  }}
                >
                  Login
                </Link>
              )}
            </div>

            {/* Theme Toggle - Desktop */}
            <div className={isLoaded ? 'navbar-item-enter' : ''}>
              <button
                onClick={toggleTheme}
                className={`h-10 w-10 inline-flex items-center justify-center leading-none p-2 rounded-xl transition-all duration-300 border active:scale-95 ${
                  darkMode
                    ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400'
                }`}
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                }}
                aria-label="Toggle theme"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle - CSS Animation */}
          <div className={`md:hidden flex items-center gap-2 ${!isLoaded ? 'navbar-hidden' : 'navbar-menu-button'}`}>
            {/* Theme Toggle - 44px min touch target */}
            <button
              onClick={toggleTheme}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-300 border active:scale-95 ${
                darkMode
                  ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400'
              }`}
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button - 44px min touch target with clear hamburger lines */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-300 border active:scale-95 ${
                darkMode
                  ? 'bg-moon-midnight/50 text-moon-silver border-moon-gold/20'
                  : 'bg-purple-50 text-purple-600 border-purple-200'
              }`}
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only render after page load */}
      {isLoaded && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`md:hidden border-t ${
                darkMode ? 'bg-moon-midnight border-moon-gold/20' : 'bg-white border-purple-200'
              }`}
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search Bar */}
                <div className="relative mb-2" ref={mobileSearchRef}>
                  <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    darkMode ? 'text-moon-gold/60' : 'text-purple-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      fetchSuggestions(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchSubmit();
                    }}
                    onFocus={() => searchQuery.length >= 2 && searchSuggestions.length > 0 && setShowSearchSuggestions(true)}
                    placeholder="Search posters by name, type..."
                    className={`w-full pl-9 pr-9 py-3 min-h-[48px] text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'bg-moon-night/50 border-moon-gold/20 text-moon-silver placeholder-moon-silver/40 focus:border-moon-gold focus:ring-moon-gold/20'
                        : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSearchSuggestions(false); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                        darkMode ? 'hover:bg-moon-gold/20 text-moon-gold/60' : 'hover:bg-purple-100 text-purple-400'
                      }`}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}

                  {/* Mobile Suggestions Dropdown */}
                  {showSearchSuggestions && searchSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border overflow-hidden z-[100] ${
                      darkMode
                        ? 'bg-moon-midnight border-moon-gold/30'
                        : 'bg-white border-purple-200'
                    }`}>
                      <div className="max-h-60 overflow-y-auto">
                        {searchSuggestions.map((product) => (
                          <button
                            key={product._id}
                            onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(product); }}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                              darkMode ? 'hover:bg-moon-gold/10 text-moon-silver' : 'hover:bg-purple-50 text-gray-700'
                            }`}
                          >
                            {product.thumbnail && (
                              <img src={product.thumbnail} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" loading="lazy" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{cleanProductName(product.name)}</div>
                              <div className={`text-xs ${darkMode ? 'text-moon-silver/50' : 'text-gray-400'}`}>{product.category}</div>
                            </div>
                            {product.basePrice && (
                              <span className={`text-sm font-bold flex-shrink-0 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>৳{product.basePrice}</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); handleSearchSubmit(); }}
                        className={`w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider border-t transition-colors ${
                          darkMode
                            ? 'border-moon-gold/20 text-moon-gold hover:bg-moon-gold/10'
                            : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        View All Results →
                      </button>
                    </div>
                  )}
                </div>

                <MobileNavLink to="/" icon={FiHome} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/products" icon={FiPackage} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                  Shop
                </MobileNavLink>
                <MobileNavLink to="/customize" icon={FiEdit} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                  Customize
                </MobileNavLink>
                <MobileNavLink to="/cart" icon={FiShoppingCart} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)} badge={itemCount}>
                  Cart
                </MobileNavLink>
                
                <div className={`pt-2 mt-2 border-t ${darkMode ? 'border-moon-gold/20' : 'border-purple-200'}`}>
                  {isAuthenticated ? (
                    <>
                      <MobileNavLink to="/account" icon={FiUser} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                        My Account
                      </MobileNavLink>
                      <MobileNavLink to="/my-orders" icon={FiPackage} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                        My Orders
                      </MobileNavLink>
                      {user?.role === 'admin' && (
                        <MobileNavLink to="/admin" icon={FiUser} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                          👑 Admin Panel
                        </MobileNavLink>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          darkMode
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <MobileNavLink to="/login" icon={FiUser} darkMode={darkMode} onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </MobileNavLink>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    darkMode
                      ? 'text-moon-gold hover:bg-moon-blue/30'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                  <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
}

// Desktop NavLink Component
function NavLink({ to, icon: Icon, children, darkMode }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ease-out border font-semibold text-sm group relative overflow-hidden active:scale-95 ${
        darkMode
          ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver hover:text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-400'
      }`}
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ease-out" />
      <span>{children}</span>
    </Link>
  );
}

// Mobile NavLink Component - 44px min touch target for accessibility
function MobileNavLink({ to, icon: Icon, children, darkMode, onClick, badge }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl transition-colors ${
        darkMode
          ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold active:bg-moon-blue/50'
          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-base">{children}</span>
      </div>
      {badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          darkMode
            ? 'bg-moon-gold text-moon-night'
            : 'bg-purple-600 text-white'
        }`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
