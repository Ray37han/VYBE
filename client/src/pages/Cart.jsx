import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import { cartAPI } from '../api';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);

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
    try {
      if (isAuthenticated) {
        await cartAPI.update(item._id, { quantity: newQuantity });
      }
      updateQuantity(item._id, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
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
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-moon-gold' : 'text-purple-600'
                    }`}>৳{sizePrice}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className={`w-8 h-8 rounded border transition-all ${
                          darkMode
                            ? 'border-moon-gold/30 hover:bg-moon-blue/50 text-moon-silver'
                            : 'border-purple-200 hover:bg-purple-50 text-gray-900'
                        }`}
                      >
                        -
                      </button>
                      <span className={`w-8 text-center ${
                        darkMode ? 'text-moon-silver' : 'text-gray-900'
                      }`}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className={`w-8 h-8 rounded border transition-all ${
                          darkMode
                            ? 'border-moon-gold/30 hover:bg-moon-blue/50 text-moon-silver'
                            : 'border-purple-200 hover:bg-purple-50 text-gray-900'
                        }`}
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
