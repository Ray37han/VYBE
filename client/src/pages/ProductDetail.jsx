import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiX, FiZoomIn, FiImage } from 'react-icons/fi';
import { productsAPI, cartAPI } from '../api';
import { useAuthStore, useCartStore } from '../store';
import { ScrollReveal } from '../components/PageTransition';
import LoadingStore from '../components/LoadingStore';
import { HeartButton } from '../components/AnimatedIcon';
import MagneticButton from '../components/MagneticButton';
import { TrustBanner } from '../components/TrustBadges';
import StickyAddToCart from '../components/StickyAddToCart';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('Standard');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false); // Default to light theme
  const { isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((state) => state.addItem);
  
  // Ref for sticky cart intersection observer
  const priceAreaRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

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
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getOne(id);
      const productData = response.data || response;
      setProduct(productData);
      // Don't auto-select size - force user to make explicit choice
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Defensive check for product
    if (!product) {
      toast.error('Product not found');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    try {
      // Always add to local cart first for immediate feedback
      addToCart({
        product,
        quantity,
        size: selectedSize,
        tier: selectedTier,
        frame: selectedFrame || 'No Frame',
        _id: Date.now().toString(),
      });
      
      console.log('✅ Added to local cart');
      toast.success('Added to cart!');

      // Then sync with backend if authenticated (don't block on this)
      if (isAuthenticated) {
        const cartItem = {
          productId: product._id,
          quantity,
          size: selectedSize,
          tier: selectedTier,
          frame: selectedFrame || 'No Frame',
        };

        try {
          await cartAPI.add(cartItem);
          console.log('✅ Synced with backend');
        } catch (apiError) {
          console.warn('⚠️ Failed to sync with backend, but item is in local cart:', apiError);
          // Don't show error to user - local cart is updated successfully
        }
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  /**
   * Buy Now - Add to cart and go directly to checkout
   * Skips the cart page for faster purchase flow
   */
  const handleBuyNow = async () => {
    if (!selectedSize) {
      toast.error('Please select a size first');
      return;
    }

    try {
      // First, add to cart (same logic as Add to Cart)
      await handleAddToCart();
      
      // Then immediately navigate to checkout
      toast.success('Proceeding to checkout...', { duration: 1500 });
      
      // Small delay for better UX (let user see the success message)
      setTimeout(() => {
        navigate('/checkout');
      }, 500);
    } catch (error) {
      console.error('❌ Buy now failed:', error);
      toast.error('Failed to proceed. Please try again.');
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return <LoadingStore text="Loading product details" />;
  }

  if (!product) return null;

  const currentVariant = product.sizes.find(
    (s) => s.name === selectedSize && (s.tier || 'Standard') === selectedTier
  );
  const currentPrice = currentVariant?.price || product.basePrice;
  const currentOriginalPrice =
    currentVariant?.originalPrice || product.originalPrice || Math.round(currentPrice / 0.80);

  const availableSizes = product.sizes
    .filter((s) => (s.tier || 'Standard') === selectedTier)
    .map((s) => s.name);
  const uniqueAvailableSizes = Array.from(new Set(availableSizes));

  return (
    <div className="pt-24 pb-12 md:pb-12 pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative card overflow-hidden mb-4 group cursor-pointer"
              onClick={() => setIsZoomed(true)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[selectedImage]?.urls?.large || product.images[selectedImage]?.url}
                alt={product.name}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                className="w-full h-auto object-contain max-h-[600px]"
                style={{ 
                  aspectRatio: 'auto',
                  width: '100%',
                  height: 'auto'
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <FiZoomIn className="w-5 h-5" />
                  <span className="text-sm font-medium">Click to zoom</span>
                </div>
              </div>
            </motion.div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`card overflow-hidden transition-all ${
                      selectedImage === idx ? 'ring-2 ring-vybe-purple' : ''
                    }`}
                  >
                    <img src={img.urls?.thumbnail || img.url} alt="" loading="lazy" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg"
            >
              🎉 20% OFF - Limited Time!
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating?.average || 0) ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {(product.rating?.average || 0).toFixed(1)} ({product.rating?.count || 0} reviews)
              </span>
            </div>
            
            <div ref={priceAreaRef} className="flex items-center gap-4 mb-6">
              {selectedSize ? (
                <>
                  <p className="text-4xl font-bold text-vybe-purple">৳{currentPrice}</p>
                  <div className="flex flex-col">
                    <span className="text-2xl text-gray-400 line-through">৳{currentOriginalPrice}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      20% OFF
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-gray-400">৳{product.basePrice}+</p>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Starting price
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Tier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Select Option:</label>
              <div className="flex gap-3">
                {['Standard', 'Premium'].map((tier) => (
                  <motion.button
                    key={tier}
                    onClick={() => {
                      setSelectedTier(tier);
                      setSelectedSize('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 px-5 py-3 rounded-xl border-2 font-bold transition-all ${
                      selectedTier === tier
                        ? 'border-vybe-purple bg-vybe-purple text-white shadow-lg'
                        : 'border-gray-300 hover:border-vybe-purple'
                    }`}
                  >
                    {tier}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Select Size: <span className="text-red-500">*</span></label>
                {!selectedSize && (
                  <motion.span 
                    className="text-xs text-vybe-purple font-semibold flex items-center gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="w-2 h-2 bg-vybe-purple rounded-full animate-pulse-gpu"></span>
                    Please choose a size
                  </motion.span>
                )}
              </div>
              <div className={`flex flex-wrap gap-3 p-4 rounded-lg border-2 transition-all ${
                !selectedSize 
                  ? 'border-vybe-purple/30 bg-vybe-purple/5 shadow-lg shadow-vybe-purple/10' 
                  : 'border-transparent bg-transparent'
              }`}>
                {uniqueAvailableSizes.map((sizeName) => {
                  const sizeVariant = product.sizes.find(
                    (s) => s.name === sizeName && (s.tier || 'Standard') === selectedTier
                  );
                  if (!sizeVariant) return null;

                  return (
                  <motion.button
                    key={`${selectedTier}-${sizeName}`}
                    onClick={() => setSelectedSize(sizeName)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full border-2 transition-all ${
                      selectedSize === sizeName
                        ? 'border-vybe-purple bg-vybe-purple text-white shadow-lg'
                        : 'border-gray-300 hover:border-vybe-purple hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{sizeVariant.name}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={selectedSize === sizeName ? 'text-white font-bold' : 'text-vybe-purple font-bold'}>
                          ৳{sizeVariant.price}
                        </span>
                        <span className="text-xs line-through opacity-60">
                          ৳{sizeVariant.originalPrice || Math.round(sizeVariant.price / 0.80)}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                  );
                })}
              </div>
              {!selectedSize && (
                <motion.p 
                  className="text-xs text-gray-500 mt-2 flex items-center gap-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>💡</span>
                  Tip: Select your preferred poster size to see the price
                </motion.p>
              )}
            </div>

            {/* Frame Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Choose Frame: <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '', label: 'No Frame', color: 'bg-gray-100 border-2 border-dashed border-gray-300', textColor: 'text-gray-700' },
                  { value: 'black', label: 'Black', color: 'bg-black', textColor: 'text-white', ring: 'ring-gray-800' },
                  { value: 'white', label: 'White', color: 'bg-white border-2 border-gray-300', textColor: 'text-gray-900', ring: 'ring-gray-300' },
                  { value: 'woody', label: 'Woody', color: 'bg-gradient-to-br from-amber-700 to-amber-900', textColor: 'text-white', ring: 'ring-amber-700' }
                ].map((frame) => (
                  <motion.button
                    key={frame.value}
                    onClick={() => setSelectedFrame(frame.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-4 rounded-xl transition-all ${frame.color} ${
                      selectedFrame === frame.value
                        ? `ring-4 ${frame.ring || 'ring-vybe-purple'} shadow-lg`
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg ${frame.color} flex items-center justify-center`}>
                        {selectedFrame === frame.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${frame.textColor}`}>
                        {frame.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedFrame ? `✓ ${selectedFrame.charAt(0).toUpperCase() + selectedFrame.slice(1)} frame selected` : 'Poster only (no frame)'}
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`w-12 h-12 rounded-lg border-2 font-bold text-xl transition-all flex items-center justify-center ${
                    quantity <= 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-vybe-purple text-vybe-purple hover:bg-vybe-purple hover:text-white active:scale-95'
                  }`}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="w-20 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-vybe-purple focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-lg border-2 border-vybe-purple text-vybe-purple hover:bg-vybe-purple hover:text-white font-bold text-xl transition-all flex items-center justify-center active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Customize Button - Coming Soon */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 cursor-not-allowed opacity-60 ${
                  darkMode
                    ? 'bg-moon-midnight border-2 border-moon-silver/30 text-moon-silver'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                }`}
              >
                <FiImage className="text-xl" />
                <span>Customize This Poster</span>
                <span className={`text-sm font-normal ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  (Coming Soon...)
                </span>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => {
                    e.currentTarget.classList.add('active');
                    handleAddToCart();
                    setTimeout(() => {
                      e.currentTarget.classList.remove('active');
                    }, 2500);
                  }}
                  disabled={!selectedSize}
                  className={`btn-cart flex-1 ${!selectedSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>
                    <span className="flex items-center justify-center gap-2">
                      <FiShoppingCart />
                      {!selectedSize ? 'Select Size' : 'Add to Cart'}
                    </span>
                  </span>
                </button>

                {/* Buy Now Button */}
                <motion.button
                  onClick={handleBuyNow}
                  disabled={!selectedSize}
                  whileHover={selectedSize ? { scale: 1.02 } : {}}
                  whileTap={selectedSize ? { scale: 0.98 } : {}}
                  className={`flex-1 px-6 py-4 rounded-lg font-bold text-white transition-all ${
                    !selectedSize
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {!selectedSize ? 'Select Size' : 'Buy Now'}
                  </span>
                </motion.button>
              </div>
            </div>
            
            {/* Trust Banner - Critical for BD market conversion */}
            <TrustBanner darkMode={darkMode} />
            
            {!selectedSize && (
              <motion.div 
                className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ⚠️ Please select a size above to add this product to your cart
              </motion.div>
            )}

            {product.customizable && (
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-moon-midnight/50 border border-moon-gold/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-moon-gold' : 'text-yellow-800'}`}>
                  🎨 Customization feature coming soon! You'll be able to upload your own images and create personalized posters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Add to Cart - Mobile Only */}
      <StickyAddToCart
        product={product}
        selectedSize={selectedSize}
        currentPrice={currentPrice}
        onAddToCart={handleAddToCart}
        disabled={!selectedSize}
        darkMode={darkMode}
        targetRef={priceAreaRef}
      />

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {selectedImage + 1} / {product.images.length}
            </div>

            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                {selectedImage > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(selectedImage - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all z-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {selectedImage < product.images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(selectedImage + 1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all z-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[selectedImage]?.urls?.full || product.images[selectedImage]?.url}
                alt={product.name}
                decoding="async"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '90vh'
                }}
              />
            </motion.div>

            {/* Thumbnail navigation */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(idx);
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx 
                        ? 'ring-2 ring-white scale-110' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.urls?.thumbnail || img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              Scroll to zoom • Click outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-moon-midnight border-t border-gray-200 dark:border-moon-gold/20 p-4 shadow-2xl z-50">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {selectedSize ? (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-moon-gold">
                  ৳{currentPrice}
                </p>
                <p className="text-xs text-gray-500 dark:text-moon-silver/60">
                  Size: {selectedSize}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-400">
                  ৳{product.basePrice}+
                </p>
                <p className="text-xs text-vybe-purple dark:text-moon-gold font-semibold animate-pulse-gpu">
                  ⚠️ Select a size first
                </p>
              </>
            )}
          </div>
          <motion.button
            whileTap={selectedSize ? { scale: 0.95 } : {}}
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
              !selectedSize
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-vybe-purple to-vybe-pink text-white hover:shadow-xl active:scale-95'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5" />
              <span>{!selectedSize ? 'Select Size' : 'Add to Cart'}</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
