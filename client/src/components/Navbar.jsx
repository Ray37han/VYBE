import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiStar, FiMoon, FiSun } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();

  // Listen for theme changes from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme');
      if (theme) {
        setDarkMode(theme === 'dark');
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
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-2xl transition-colors duration-500 ${
      darkMode 
        ? 'bg-moon-night/95 border-moon-gold/20' 
        : 'bg-white/95 border-purple-200'
    }`}>
      {/* Glow Effect */}
      <div className={`absolute inset-0 animate-pulse-slow pointer-events-none ${
        darkMode 
          ? 'bg-gradient-to-r from-moon-mystical/5 via-moon-gold/5 to-moon-mystical/5'
          : 'bg-gradient-to-r from-purple-100/5 via-blue-100/5 to-pink-100/5'
      }`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-wider ${
                darkMode ? 'moon-gradient-text animate-glow' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
              }`}>
                VYBE
              </h1>
              <div className={`absolute -inset-1 rounded-lg blur-lg transition-opacity duration-500 -z-10 ${
                darkMode 
                  ? 'bg-gradient-to-r from-moon-mystical to-moon-gold opacity-0 group-hover:opacity-30'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20'
              }`}></div>
            </motion.div>
            <div className="hidden sm:block">
              <p className={`text-[10px] tracking-widest uppercase leading-tight ${
                darkMode ? 'text-moon-silver/80' : 'text-gray-500'
              }`}>Visualize Your</p>
              <p className={`text-xs font-bold tracking-wider leading-tight ${
                darkMode ? 'text-moon-gold' : 'text-purple-600'
              }`}>Best Essence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={FiStar} darkMode={darkMode}>Home</NavLink>
            <NavLink to="/products" icon={FiPackage} darkMode={darkMode}>Shop</NavLink>
            <NavLink to="/products?category=custom" icon={FiStar} darkMode={darkMode}>Customize</NavLink>
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
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link 
                to="/cart" 
                className={`relative p-2.5 rounded-xl transition-all duration-300 border group block ${
                  darkMode
                    ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 border-moon-gold/20 hover:border-moon-gold/50'
                    : 'bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400'
                }`}
              >
                <FiShoppingCart className={`w-5 h-5 transition-colors duration-300 relative z-10 ${
                  darkMode
                    ? 'text-moon-silver group-hover:text-moon-gold'
                    : 'text-purple-600 group-hover:text-purple-700'
                }`} />
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg z-20"
                  >
                    {itemCount}
                  </motion.span>
                )}
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 pointer-events-none -z-10 ${
                  darkMode ? 'bg-moon-gold/20' : 'bg-purple-400/20'
                }`}></div>
              </Link>
            </motion.div>

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

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 border ${
                darkMode
                  ? 'bg-moon-midnight/50 hover:bg-moon-blue/50 border-moon-gold/20 hover:border-moon-gold/50'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400'
              }`}
            >
              {mobileMenuOpen ? (
                <FiX className={`w-5 h-5 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`} />
              ) : (
                <FiMenu className={`w-5 h-5 transition-colors ${
                  darkMode 
                    ? 'text-moon-silver hover:text-moon-gold' 
                    : 'text-purple-600 hover:text-purple-700'
                }`} />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`md:hidden backdrop-blur-xl border-t ${
            darkMode
              ? 'bg-moon-midnight/98 border-moon-gold/20'
              : 'bg-white/98 border-purple-200'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
              🏠 Home
            </MobileNavLink>
            <MobileNavLink to="/products" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
              🛍️ Shop Collection
            </MobileNavLink>
            <MobileNavLink to="/products?category=custom" onClick={() => setMobileMenuOpen(false)} darkMode={darkMode}>
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
