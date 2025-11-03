import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiX, FiZoomIn } from 'react-icons/fi';
import { productsAPI, cartAPI } from '../api';
import { useAuthStore, useCartStore } from '../store';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((state) => state.addItem);

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
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    try {
      const cartItem = {
        productId: product._id,
        quantity,
        size: selectedSize,
      };

      if (isAuthenticated) {
        await cartAPI.add(cartItem);
      }
      
      addToCart({
        product,
        quantity,
        size: selectedSize,
        _id: Date.now().toString(),
      });
      
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
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
    return (
      <div className={`pt-24 pb-12 min-h-screen ${
        darkMode
          ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
          : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <ProductDetailSkeleton darkMode={darkMode} />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = product.sizes.find(s => s.name === selectedSize)?.price || product.basePrice;

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
                src={product.images[selectedImage]?.url}
                alt={product.name}
                loading="lazy"
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
                    <img src={img.url} alt="" loading="lazy" className="w-full h-20 object-cover" />
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
              🎉 25% OFF - Limited Time!
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating.average) ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              {selectedSize ? (
                <>
                  <p className="text-4xl font-bold text-vybe-purple">৳{currentPrice}</p>
                  <div className="flex flex-col">
                    <span className="text-2xl text-gray-400 line-through">৳{Math.round(currentPrice / 0.75)}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      25% OFF
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
                    <span className="w-2 h-2 bg-vybe-purple rounded-full animate-pulse"></span>
                    Please choose a size
                  </motion.span>
                )}
              </div>
              <div className={`flex flex-wrap gap-3 p-4 rounded-lg border-2 transition-all ${
                !selectedSize 
                  ? 'border-vybe-purple/30 bg-vybe-purple/5 shadow-lg shadow-vybe-purple/10' 
                  : 'border-transparent bg-transparent'
              }`}>
                {product.sizes.map((size) => (
                  <motion.button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full border-2 transition-all ${
                      selectedSize === size.name
                        ? 'border-vybe-purple bg-vybe-purple text-white shadow-lg'
                        : 'border-gray-300 hover:border-vybe-purple hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{size.name}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={selectedSize === size.name ? 'text-white font-bold' : 'text-vybe-purple font-bold'}>
                          ৳{size.price}
                        </span>
                        <span className="text-xs line-through opacity-60">
                          ৳{Math.round(size.price / 0.75)}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
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
            <div className="flex gap-4">
              <motion.button 
                onClick={handleAddToCart} 
                disabled={!selectedSize}
                whileTap={selectedSize ? { scale: 0.95 } : {}}
                className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                  !selectedSize
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <FiShoppingCart />
                {!selectedSize ? 'Select Size First' : 'Add to Cart'}
              </motion.button>
              <button className="btn-secondary">
                <FiHeart className="w-6 h-6" />
              </button>
            </div>
            
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
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  ✨ This product is customizable! You can upload your own image during checkout.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
                src={product.images[selectedImage]?.url}
                alt={product.name}
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
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
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
                <p className="text-xs text-vybe-purple dark:text-moon-gold font-semibold animate-pulse">
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
