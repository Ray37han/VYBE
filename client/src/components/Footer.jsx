import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

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
            <div className="flex space-x-2">
              <a href="https://www.facebook.com/profile.php?id=61580594942475" target="_blank" rel="noopener noreferrer" 
                className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition ${
                  darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                }`}
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/vybebd/" target="_blank" rel="noopener noreferrer" 
                className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition ${
                  darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                }`}
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" 
                className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition ${
                  darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                }`}
                aria-label="Twitter"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="#" 
                className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition ${
                  darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                }`}
                aria-label="Pinterest"
              >
                <FaPinterest className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links - Mobile-friendly touch targets */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-1">
              <li>
                <Link to="/" className={`inline-block py-2 min-h-[44px] transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className={`inline-block py-2 min-h-[44px] transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/products?category=custom" className={`inline-block py-2 min-h-[44px] transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Customize
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className={`inline-block py-2 min-h-[44px] transition ${
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
              <li 
                className="relative"
                onMouseEnter={() => setShowShippingInfo(true)}
                onMouseLeave={() => setShowShippingInfo(false)}
              >
                <button 
                  onClick={() => setShowShippingInfo(!showShippingInfo)}
                  className={`transition font-semibold ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Shipping Info ▼
                </button>
                {showShippingInfo && (
                  <div className={`mt-2 p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    <p className="text-xs mb-1">Delivery all over Bangladesh</p>
                    <p className="text-xs">Inside Dhaka: ৳100</p>
                    <p className="text-xs">Outside Dhaka: ৳130</p>
                  </div>
                )}
              </li>
              <li>
                <a href="#" className={`transition ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'
                }`}>
                  Returns & Exchange
                </a>
              </li>
              <li 
                className="relative"
                onMouseEnter={() => setShowContactInfo(true)}
                onMouseLeave={() => setShowContactInfo(false)}
              >
                <button 
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className={`transition font-semibold ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Contact Us ▼
                </button>
                {showContactInfo && (
                  <div className={`mt-2 p-3 rounded-lg space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <a href="https://www.facebook.com/profile.php?id=61580594942475" target="_blank" rel="noopener noreferrer" className={`transition flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'}`}>
                      <FaFacebook className="w-4 h-4" />
                      Facebook
                    </a>
                    <a href="https://wa.me/8801772634466" target="_blank" rel="noopener noreferrer" className={`transition flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-purple-600'}`}>
                      <FaWhatsapp className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Newsletter</h4>
            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Subscribe for exclusive offers and updates
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (email && email.includes('@')) {
                setSubscribeStatus('success');
                setEmail('');
                setTimeout(() => setSubscribeStatus(''), 3000);
              } else {
                setSubscribeStatus('error');
                setTimeout(() => setSubscribeStatus(''), 3000);
              }
            }} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`flex-1 px-4 py-2 rounded-l-lg focus:outline-none ${
                    darkMode ? 'text-gray-900 bg-white' : 'text-gray-900 bg-white border border-gray-300'
                  }`}
                />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-vybe-purple to-vybe-pink rounded-r-lg hover:opacity-90 transition text-white">
                  Subscribe
                </button>
              </div>
              {subscribeStatus === 'success' && (
                <p className="text-sm text-green-500">✓ Successfully subscribed!</p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-sm text-red-500">✗ Please enter a valid email</p>
              )}
            </form>
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
