import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiX, FiZoomIn } from 'react-icons/fi';
import { productsAPI, cartAPI } from '../api';
import { useAuthStore, useCartStore } from '../store';
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
  const { isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getOne(id);
      const productData = response.data || response;
      setProduct(productData);
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0].name);
      }
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-vybe-purple"></div>
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = product.sizes.find(s => s.name === selectedSize)?.price || product.basePrice;

  return (
    <div className="pt-24 pb-12 min-h-screen">
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
                    <img src={img.url} alt="" className="w-full h-20 object-cover" />
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
              <p className="text-4xl font-bold text-vybe-purple">৳{currentPrice}</p>
              <div className="flex flex-col">
                <span className="text-2xl text-gray-400 line-through">৳{Math.round(currentPrice / 0.75)}</span>
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  25% OFF
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Size:</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-6 py-3 rounded-full border-2 transition-all ${
                      selectedSize === size.name
                        ? 'border-vybe-purple bg-vybe-purple text-white'
                        : 'border-gray-300 hover:border-vybe-purple'
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
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Quantity:</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-vybe-purple"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-vybe-purple"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <FiShoppingCart />
                Add to Cart
              </button>
              <button className="btn-secondary">
                <FiHeart className="w-6 h-6" />
              </button>
            </div>

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
    </div>
  );
}
