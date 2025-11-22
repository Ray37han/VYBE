import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Customize() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Listen for theme changes
  useEffect(() => {
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

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/8801410809138', '_blank');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night' : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`rounded-3xl p-8 md:p-12 shadow-2xl border-2 ${
            darkMode 
              ? 'bg-moon-midnight/80 backdrop-blur-xl border-moon-gold/30' 
              : 'bg-white/80 backdrop-blur-xl border-purple-200'
          }`}
        >
          {/* Icon/Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
              darkMode 
                ? 'bg-gradient-to-br from-moon-mystical to-moon-gold' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              <FiMessageCircle className="text-5xl text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-4xl md:text-5xl font-bold text-center mb-4 ${
              darkMode ? 'moon-gradient-text animate-glow' : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
            }`}
          >
            Coming Soon
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-center text-lg mb-8 ${
              darkMode ? 'text-moon-silver' : 'text-gray-600'
            }`}
          >
            Our custom creation feature is currently under development. 
            We're working hard to bring you an amazing customization experience!
          </motion.p>

          {/* WhatsApp Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppClick}
              className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <FaWhatsapp className="text-2xl" />
              Contact Us on WhatsApp
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-moon-night text-moon-silver hover:bg-moon-midnight border-2 border-moon-gold/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
              }`}
            >
              <FiArrowLeft />
              Go Back
            </motion.button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`mt-8 p-4 rounded-xl text-center text-sm ${
              darkMode 
                ? 'bg-moon-night/50 text-moon-silver/70' 
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            <p>For custom orders, please reach out to us via WhatsApp.</p>
            <p className="mt-1">We'll help you create your perfect design!</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
