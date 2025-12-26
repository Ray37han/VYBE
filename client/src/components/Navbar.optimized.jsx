import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome, FiEdit, FiMoon, FiSun, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import { authAPI } from '../api';
import { CartButton, MenuButton } from '../components/AnimatedIcon';
import { usePageLoad } from '../hooks/usePageLoad';
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

export default function NavbarOptimized() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();
  
  // CRITICAL: Wait for page load before animating
  const isLoaded = usePageLoad(500);

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
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
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
                      
                      <div className="py-2 max-h-96 overflow-y-auto">
                        {categories.map((category) => (
                          <div key={category.label}>
                            <div className={`px-4 py-2 text-xs font-semibold ${
                              darkMode ? 'text-moon-silver' : 'text-gray-500'
                            }`}>
                              {category.icon} {category.label}
                            </div>
                            {category.subcategories.map((sub) => (
                              <button
                                key={sub.value || sub.label}
                                onClick={() => {
                                  navigate(`/products${sub.value ? `?category=${sub.value}` : ''}`);
                                  setProductsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-6 py-2 text-sm transition-colors ${
                                  darkMode
                                    ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold'
                                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                              >
                                <span className="mr-2">{sub.icon}</span>
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          </div>

          {/* Mobile Menu Button & Theme Toggle - CSS Animation */}
          <div className={`md:hidden flex items-center gap-2 ${!isLoaded ? 'navbar-hidden' : 'navbar-menu-button'}`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 border active:scale-95 ${
                darkMode
                  ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 text-moon-gold border-moon-gold/20 hover:border-moon-gold/50'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400'
              }`}
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-all duration-300 border active:scale-95 ${
                darkMode
                  ? 'bg-moon-midnight/50 text-moon-silver border-moon-gold/20'
                  : 'bg-purple-50 text-purple-600 border-purple-200'
              }`}
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
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

// Mobile NavLink Component
function MobileNavLink({ to, icon: Icon, children, darkMode, onClick, badge }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
        darkMode
          ? 'text-moon-silver hover:bg-moon-blue/30 hover:text-moon-gold'
          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{children}</span>
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
