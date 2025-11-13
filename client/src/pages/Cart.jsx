import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import { cartAPI } from '../api';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/PageTransition';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false); // Default to light theme

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

  const handleRemove = async (itemId) => {
    try {
      if (isAuthenticated) {
        await cartAPI.remove(itemId);
      }
      removeItem(itemId);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Update local state immediately for better UX
    updateQuantity(item._id, newQuantity);
    
    // Try to sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await cartAPI.update(item._id, { quantity: newQuantity });
      } catch (error) {
        console.error('Failed to sync quantity with server:', error);
        // Silent fail - local state is already updated
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className={`pt-24 pb-12 min-h-screen flex items-center justify-center ${
        darkMode
          ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
          : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className="text-center">
          <FiShoppingBag className={`w-24 h-24 mx-auto mb-4 ${
            darkMode ? 'text-moon-gold/40' : 'text-purple-300'
          }`} />
          <h2 className={`text-3xl font-bold mb-4 ${
            darkMode ? 'text-moon-silver' : 'text-gray-900'
          }`}>Your cart is empty</h2>
          <p className={`mb-8 ${
            darkMode ? 'text-moon-silver/60' : 'text-gray-600'
          }`}>Start shopping to add items to your cart</p>
          <Link 
            to="/products" 
            className={`inline-block px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              darkMode
                ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
            }`}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const originalPrice = Math.round(subtotal / 0.75);
  const savings = originalPrice - subtotal;
  const shipping = subtotal > 1000 ? 0 : 60;
  const total = subtotal + shipping;

  return (
    <div className={`pt-24 pb-12 min-h-screen ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-4xl font-bold mb-8 ${
          darkMode
            ? 'moon-gradient-text animate-glow'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
        }`}>Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const sizePrice = item.product.sizes.find(s => s.name === item.size)?.price || item.product.basePrice;
              return (
                <div 
                  key={item._id} 
                  className={`p-4 flex gap-4 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    darkMode
                      ? 'bg-moon-midnight/50 border-moon-gold/20 hover:border-moon-gold/40'
                      : 'bg-white border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${
                      darkMode ? 'text-moon-silver' : 'text-gray-900'
                    }`}>{item.product.name}</h3>
                    <p className={`text-sm mb-2 ${
                      darkMode ? 'text-moon-silver/60' : 'text-gray-600'
                    }`}>Size: {item.size}</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-moon-gold' : 'text-purple-600'
                      }`}>৳{sizePrice}</p>
                      <span className={`text-xs line-through ${
                        darkMode ? 'text-moon-silver/40' : 'text-gray-400'
                      }`}>
                        ৳{Math.round(sizePrice / 0.75)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        25% OFF
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item._id)}
                      className={`transition-colors p-2 rounded-lg ${
                        darkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                      }`}
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`w-9 h-9 rounded-lg border font-bold text-lg transition-all flex items-center justify-center ${
                          item.quantity <= 1
                            ? darkMode
                              ? 'border-moon-silver/20 text-moon-silver/30 cursor-not-allowed'
                              : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : darkMode
                              ? 'border-moon-gold/30 hover:bg-moon-gold hover:text-moon-night text-moon-gold active:scale-95'
                              : 'border-purple-300 hover:bg-purple-600 hover:text-white text-purple-600 active:scale-95'
                        }`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          handleQuantityChange(item, Math.max(1, val));
                        }}
                        className={`w-14 h-9 text-center font-semibold border rounded-lg focus:outline-none transition-all ${
                          darkMode
                            ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:border-moon-gold'
                            : 'bg-white border-purple-200 text-gray-900 focus:border-purple-600'
                        }`}
                      />
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className={`w-9 h-9 rounded-lg border font-bold text-lg transition-all flex items-center justify-center ${
                          darkMode
                            ? 'border-moon-gold/30 hover:bg-moon-gold hover:text-moon-night text-moon-gold'
                            : 'border-purple-300 hover:bg-purple-600 hover:text-white text-purple-600'
                        } active:scale-95`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className={`p-6 sticky top-24 rounded-2xl border shadow-lg ${
              darkMode
                ? 'bg-moon-midnight/50 border-moon-gold/20'
                : 'bg-white border-purple-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-moon-silver' : 'text-gray-900'
              }`}>Order Summary</h2>
              
              {/* Discount Banner */}
              <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                darkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
              }`}>
                <div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                    🎉 You're saving ৳{savings.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-green-300/70' : 'text-green-600'}`}>
                    with 25% off!
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className={`flex justify-between ${
                  darkMode ? 'text-moon-silver/80' : 'text-gray-700'
                }`}>
                  <span>Subtotal</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between ${
                  darkMode ? 'text-moon-silver/80' : 'text-gray-700'
                }`}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `৳${shipping}`}</span>
                </div>
                <div className={`border-t pt-3 flex justify-between text-lg font-bold ${
                  darkMode
                    ? 'border-moon-gold/20 text-moon-silver'
                    : 'border-purple-100 text-gray-900'
                }`}>
                  <span>Total</span>
                  <span className={darkMode ? 'text-moon-gold' : 'text-purple-600'}>৳{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className={`w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  darkMode
                    ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
                }`}
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className={`block text-center mt-4 hover:underline transition-colors ${
                  darkMode ? 'text-moon-gold hover:text-moon-gold/80' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
