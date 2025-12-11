import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest } from 'react-icons/fa';

export default function Footer() {
  const [darkMode, setDarkMode] = useState(true);

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

  return (
    <footer className={`mt-20 transition-colors duration-500 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'gradient-text' : 'text-purple-600'}`}>VYBE</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Transform your space with personalized art that reflects your unique style.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61580594942475" target="_blank" rel="noopener noreferrer" className={`transition ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
              }`}>
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="#" className={`transition ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
              }`}>
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" className={`transition ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
              }`}>
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="#" className={`transition ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
              }`}>
                <FaPinterest className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/products?category=custom" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Customize
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a href="#" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Newsletter</h4>
            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Subscribe for exclusive offers and updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className={`flex-1 px-4 py-2 rounded-l-lg focus:outline-none ${
                  darkMode ? 'text-gray-900 bg-white' : 'text-gray-900 bg-white border border-gray-300'
                }`}
              />
              <button className="px-4 py-2 bg-gradient-to-r from-vybe-purple to-vybe-pink rounded-r-lg hover:opacity-90 transition text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-8 pt-8 text-center text-sm ${
          darkMode ? 'border-t border-gray-800 text-gray-400' : 'border-t border-gray-300 text-gray-600'
        }`}>
          <p>&copy; {new Date().getFullYear()} VYBE. All rights reserved. Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
