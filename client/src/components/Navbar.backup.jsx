import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiStar, FiMoon, FiSun, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import { authAPI } from '../api';
import { CartButton, MenuButton } from '../components/AnimatedIcon';
import toast from 'react-hot-toast';

// Categories with subcategories for dropdown
const categories = [
  {
    label: 'All Posters',
    icon: '🌟',
    subcategories: [
      { value: '', label: 'New Arrivals', icon: '✨' },
      { value: 'best-selling', label: 'Best Selling', icon: '🔥' },
      { value: 'motivational', label: 'Motivational', icon: '💪' },
    ]
  },
  {
    label: 'Cars & Bikes',
    icon: '🏎️',
    subcategories: [
      { value: 'bikes', label: 'Bikes', icon: '🏍️' },
      { value: 'sports-cars', label: 'Sports Cars', icon: '🏎️' },
      { value: 'vintage-cars', label: 'Vintage Cars', icon: '🚗' },
      { value: 'muscle-cars', label: 'Muscle Cars', icon: '💨' },
      { value: 'vector-cars', label: 'Vector Cars', icon: '🎨' },
    ]
  },
  {
    label: 'Sports',
    icon: '⚽',
    subcategories: [
      { value: 'football', label: 'Football', icon: '⚽' },
      { value: 'football-motivational', label: 'Football Motivational', icon: '⚽' },
      { value: 'cricket', label: 'Cricket', icon: '🏏' },
      { value: 'ufc', label: 'UFC', icon: '🥊' },
      { value: 'nba', label: 'NBA', icon: '🏀' },
      { value: 'f1', label: 'F1', icon: '🏁' },
      { value: 'f1-motivational', label: 'F1 Motivational', icon: '🏎️' },
    ]
  },
  {
    label: 'Pop Culture',
    icon: '🎬',
    subcategories: [
      { value: 'marvel', label: 'Marvel', icon: '🦸' },
      { value: 'dc', label: 'DC', icon: '🦇' },
      { value: 'movies', label: 'Movies', icon: '🎬' },
      { value: 'tv-series', label: 'TV Series', icon: '📺' },
      { value: 'music', label: 'Music', icon: '🎵' },
      { value: 'games', label: 'Games', icon: '🎮' },
    ]
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Default to light theme
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();

  // Listen for theme changes from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    
    if (savedTheme) {
      setDarkMode(isDark);
      // Apply dark class to HTML element
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Set default light theme
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }

    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme');
      if (theme) {
        const isDarkTheme = theme === 'dark';
        setDarkMode(isDarkTheme);
        // Apply dark class to HTML element
        if (isDarkTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Apply dark class to HTML element
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
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b shadow-2xl transition-colors duration-500 ${
      darkMode 
        ? 'bg-moon-night border-moon-gold/20' 
        : 'bg-white border-purple-200'
    }`}>
      {/* Glow Effect */}
      <div className={`absolute inset-0 animate-pulse-slow pointer-events-none ${
        darkMode 
          ? 'bg-gradient-to-r from-moon-mystical/5 via-moon-gold/5 to-moon-mystical/5'
          : 'bg-gradient-to-r from-purple-100/5 via-blue-100/5 to-pink-100/5'
      }`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Typewriter Animation */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div className="relative py-2">
              {/* VYBE Text with Typewriter Effect */}
              <h1 className={`text-3xl sm:text-4xl font-bold tracking-wider ${
                darkMode ? 'text-moon-gold' : 'text-purple-600'
              }`}>
                {/* Individual Letters with Typewriter Animation */}
                {['V', 'Y', 'B', 'E'].map((letter, index) => (
                  <motion.span
                    key={letter}
                    className="inline-block"
                    initial={{ opacity: 0, scale: 0, y: -20 }}
                    animate={{ 
                      opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                      scale: [0, 1.3, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                      y: [-20, 0, 0, 0, 0, 0, 0, 0, 0, 0, -20],
                      transition: { 
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.3,
                        times: [0, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 1],
                        ease: "easeOut"
                      }
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>

              {/* Pulsing Glow Background */}
              <motion.div 
                className={`absolute -inset-3 rounded-xl blur-xl -z-10 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-moon-mystical/40 via-moon-gold/40 to-moon-mystical/40'
                    : 'bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30'
                }`}
                animate={{ 
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              />

              {/* Subtle Sparkle Effects */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    darkMode ? 'bg-moon-gold' : 'bg-purple-400'
                  }`}
                  style={{
                    top: `${20 + i * 30}%`,
                    left: `${85 + i * 5}%`,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    transition: { 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut"
                    }
                  }}
                />
              ))}
            </motion.div>
          </Link>

          {/* Tagline - Hidden on mobile */}
          <div className="hidden lg:block ml-4">
            <p className={`text-xs tracking-widest uppercase ${
              darkMode ? 'text-moon-silver/60' : 'text-gray-400'
            }`}>
              Visualize Your
            </p>
            <p className={`text-sm font-bold tracking-wider ${
              darkMode ? 'text-moon-gold' : 'text-purple-600'
            }`}>
              Best Essence
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={FiStar} darkMode={darkMode}>Home</NavLink>
            
            {/* Products Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/products')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300 ease-out border font-semibold text-sm group relative overflow-hidden ${
                  darkMode
                    ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver hover:text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-400'
                }`}
              >
                <FiPackage className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 ease-out" />
                <span>Shop</span>
                <motion.div
                  animate={{ rotate: productsDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown className="w-4 h-4" />
                </motion.div>
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out ${
                  darkMode ? 'via-moon-gold/20' : 'via-purple-400/20'
                }`}></div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {productsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
                      darkMode
                        ? 'bg-moon-midnight border-moon-gold/30'
                        : 'bg-white border-purple-200'
                    }`}
                  >
                    {/* Dropdown Header */}
                    <div className={`px-4 py-3 border-b ${
                      darkMode ? 'border-moon-gold/20' : 'border-purple-200'
                    }`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        darkMode ? 'text-moon-gold' : 'text-purple-600'
                      }`}>
                        Browse Categories
                      </p>
                    </div>

                    {/* Categories List */}
                    <div className="py-2 max-h-[32rem] overflow-y-auto custom-scrollbar">
                      {categories.map((category, categoryIndex) => (
                        <div key={category.label} className="mb-1">
                          {/* Category Header */}
                          <div className={`px-4 py-2 flex items-center space-x-2 ${
                            darkMode ? 'text-moon-gold' : 'text-purple-600'
                          }`}>
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-bold text-xs uppercase tracking-wider">
                              {category.label}
                            </span>
                          </div>
                          
                          {/* Subcategories */}
                          {category.subcategories.map((subcategory, subIndex) => (
                            <motion.div
                              key={subcategory.value}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (categoryIndex * 0.1) + (subIndex * 0.03), duration: 0.2 }}
                            >
                              <Link
                                to={subcategory.value ? `/products?category=${subcategory.value}` : '/products'}
                                className={`flex items-center space-x-3 pl-8 pr-4 py-2 transition-all duration-200 group ${
                                  darkMode
                                    ? 'hover:bg-moon-blue/30 text-moon-silver hover:text-moon-gold'
                                    : 'hover:bg-purple-50 text-gray-700 hover:text-purple-700'
                                }`}
                                onClick={() => setProductsDropdownOpen(false)}
                              >
                                <span className="text-base group-hover:scale-125 transition-transform duration-200">
                                  {subcategory.icon}
                                </span>
                                <span className="font-medium text-sm flex-1">
                                  {subcategory.label}
                                </span>
                                <motion.div
                                  className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                    darkMode ? 'bg-moon-gold' : 'bg-purple-600'
                                  }`}
                                  whileHover={{ scale: 1.5 }}
                                />
                              </Link>
                            </motion.div>
                          ))}
                          
                          {/* Divider between categories */}
                          {categoryIndex < categories.length - 1 && (
                            <div className={`mx-4 my-2 border-t ${
                              darkMode ? 'border-moon-gold/10' : 'border-purple-100'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Dropdown Footer */}
                    <div className={`px-4 py-3 border-t ${
                      darkMode ? 'border-moon-gold/20 bg-moon-night/50' : 'border-purple-200 bg-purple-50/50'
                    }`}>
                      <Link
                        to="/products"
                        className={`block text-center text-xs font-bold uppercase tracking-wider py-2 rounded-lg transition-all duration-200 ${
                          darkMode
                            ? 'text-moon-gold hover:bg-moon-gold/10'
                            : 'text-purple-600 hover:bg-purple-100'
                        }`}
                        onClick={() => setProductsDropdownOpen(false)}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/customize" icon={FiStar} darkMode={darkMode}>Customize</NavLink>
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink to="/admin" icon={FiUser} darkMode={darkMode}>Admin</NavLink>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 border group ${
                darkMode
                  ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 border-moon-gold/20 hover:border-moon-gold/50'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400'
              }`}
            >
              {darkMode ? (
                <FiSun className="w-5 h-5 text-moon-gold group-hover:rotate-90 transition-all duration-500" />
              ) : (
                <FiMoon className="w-5 h-5 text-purple-600 group-hover:rotate-[-90deg] transition-all duration-500" />
              )}
            </motion.button>

            {/* Cart */}
            {/* Cart Icon - Animated */}
            <Link to="/cart">
              <CartButton 
                onClick={() => {}}
                itemCount={itemCount}
                className={`${
                  darkMode
                    ? 'text-moon-silver hover:text-moon-gold'
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              />
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/my-orders" 
                    className={`px-3 py-2 rounded-xl transition-all duration-300 border font-semibold text-sm ${
                      darkMode
                        ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver hover:text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    Orders
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/60 font-semibold text-sm"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/login" 
                  className={`hidden md:flex items-center space-x-1 px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group ${
                    darkMode
                      ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
                  }`}
                >
                  <FiUser className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Login</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile menu button - Animated */}
            <div className="md:hidden">
              <MenuButton 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                isOpen={mobileMenuOpen}
                className={`${
                  darkMode 
                    ? 'text-moon-silver hover:text-moon-gold' 
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`md:hidden border-t ${
            darkMode
              ? 'bg-moon-midnight border-moon-gold/20'
              : 'bg-white border-purple-200'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
              🏠 Home
            </MobileNavLink>
            <MobileNavLink to="/products" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
              🛍️ Shop Collection
            </MobileNavLink>
            <MobileNavLink to="/customize" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
              ✨ Customize Art
            </MobileNavLink>
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/my-orders" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
                  📦 My Orders
                </MobileNavLink>
                {user?.role === 'admin' && (
                  <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
                    👑 Admin Portal
                  </MobileNavLink>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-red-400 bg-red-600/20 hover:bg-red-600/40 rounded-xl border border-red-500/30 font-semibold transition-all duration-300"
                >
                  🚪 Logout
                </motion.button>
              </>
            ) : (
              <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
                🔐 Enter Portal
              </MobileNavLink>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Desktop Nav Link Component
function NavLink({ to, icon: Icon, children, darkMode }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link 
        to={to} 
        className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300 ease-out border font-semibold text-sm group relative overflow-hidden ${
          darkMode
            ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-silver hover:text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-400'
        }`}
      >
        <Icon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 ease-out" />
        <span>{children}</span>
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out ${
          darkMode ? 'via-moon-gold/20' : 'via-purple-400/20'
        }`}></div>
      </Link>
    </motion.div>
  );
}

// Mobile Nav Link Component  
function MobileNavLink({ to, onClick, children, darkMode }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link 
        to={to} 
        className={`block py-3 px-4 rounded-xl border transition-all duration-300 font-semibold ${
          darkMode
            ? 'text-moon-silver hover:text-moon-gold bg-moon-night/50 hover:bg-moon-blue/50 border-moon-gold/20 hover:border-moon-gold/50'
            : 'text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400'
        }`}
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
}
