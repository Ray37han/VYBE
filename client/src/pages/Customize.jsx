import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiImage, FiType, FiPackage, FiFileText, 
  FiCheck, FiX, FiAlertCircle, FiDownload, FiZap 
} from 'react-icons/fi';
import { productsAPI } from '../api';
import axios from 'axios';
import { useCartStore } from '../store';
import { toast } from 'react-hot-toast';

// Size options with prices (after 30% discount)
const SIZES = [
  { id: 'A5', name: 'A5', dimensions: '5.8" × 8.3"', price: 150, available: false },
  { id: 'A4', name: 'A4', dimensions: '8.3" × 11.7"', price: 800, available: true, originalPrice: 1143 }, // 30% off
  { id: 'A3', name: 'A3', dimensions: '11.7" × 16.5"', price: 1000, available: true, originalPrice: 1429 }, // 30% off
  { id: '12x18', name: '12" × 18"', dimensions: '12" × 18"', price: 600, available: false },
  { id: '13x19', name: '13" × 19"', dimensions: '13" × 19"', price: 700, available: false },
];

// Frame colors
const FRAME_COLORS = [
  { id: 'none', name: 'No Frame', color: 'transparent', border: '#d1d5db', available: false },
  { id: 'black', name: 'Black', color: '#000000', available: true },
  { id: 'white', name: 'White', color: '#ffffff', available: false },
  { id: 'gold', name: 'Gold', color: '#f59e0b', available: false },
  { id: 'silver', name: 'Silver', color: '#9ca3af', available: false },
  { id: 'wood', name: 'Wood', color: '#92400e', available: false },
];

export default function Customize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const addToCart = useCartStore((state) => state.addItem);

  // Product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customization state
  const [selectedSize, setSelectedSize] = useState(SIZES.find(s => s.id === 'A4')); // Default A4
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageData, setUploadedImageData] = useState(null); // { url, publicId }
  const [textOverlay, setTextOverlay] = useState('');
  const [frameColor, setFrameColor] = useState(FRAME_COLORS.find(f => f.id === 'black')); // Default black frame
  const [adminInstructions, setAdminInstructions] = useState('');

  // UI state
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsRead, setInstructionsRead] = useState(false);
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

  // Debug: Monitor uploadedImageData changes
  useEffect(() => {
    console.log('🔍 uploadedImageData changed:', uploadedImageData);
    console.log('🔍 Button should be:', uploadedImageData ? 'ENABLED ✅' : 'DISABLED ❌');
  }, [uploadedImageData]);

  // Fetch product data
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (0.1MB to 50MB)
    const minSize = 0.1 * 1024 * 1024; // 0.1MB
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size < minSize) {
      toast.error('File size must be at least 0.1MB');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must not exceed 50MB');
      return;
    }

    // Preview image locally FIRST (always show preview)
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Check minimum dimensions
        if (img.width < 300 || img.height < 300) {
          toast.error('Image must be at least 300x300 pixels');
          setUploadedImage(null);
          return;
        }
        setUploadedImage(readerEvent.target.result);
        console.log(`Image dimensions: ${img.width}x${img.height}`);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image to server...');
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      console.log('=== UPLOAD DEBUG START ===');
      console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('API URL (resolved):', apiUrl);
      console.log('API URL ends with /api?', apiUrl.endsWith('/api'));

      // Build the correct URL - if apiUrl already ends with /api, don't add it again
      const uploadUrl = apiUrl.endsWith('/api') 
        ? `${apiUrl}/customizations/upload-image`
        : `${apiUrl}/api/customizations/upload-image`;
      
      console.log('Final Upload URL:', uploadUrl);
      console.log('=== UPLOAD DEBUG END ===');

      const response = await axios.post(
        uploadUrl,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log('Upload response:', response.data);
      console.log('Response has url?', !!response.data.url);
      console.log('Response has publicId?', !!response.data.publicId);

      // Check response data - handle both direct response and nested data
      const responseData = response.data.data || response.data;
      
      if (responseData && (responseData.url || responseData.secure_url) && responseData.publicId) {
        const imageData = {
          url: responseData.url || responseData.secure_url,
          publicId: responseData.publicId,
        };
        
        console.log('Setting uploadedImageData:', imageData);
        setUploadedImageData(imageData);
        
        console.log('✅ Image data saved, Add to Cart button should be enabled');
        console.log('uploadedImageData will be:', imageData);
        
        toast.success('Image uploaded successfully! You can now add to cart.');
      } else {
        console.error('Invalid response format:', response.data);
        console.error('Expected: { url, publicId }');
        console.error('Got:', responseData);
        toast.error('Upload succeeded but response was invalid');
      }
    } catch (error) {
      console.error('=== UPLOAD ERROR START ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Response status:', error.response?.status);
      console.error('Response statusText:', error.response?.statusText);
      console.error('Response data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('=== UPLOAD ERROR END ===');
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to upload image';
      
      toast.error(errorMessage);
      
      // Keep the preview but clear server data
      setUploadedImageData(null);
    } finally {
      setUploading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    console.log('=== handleAddToCart START ===');
    
    // FIX #1: Guard clause - Check if product data is loaded
    if (!product) {
      console.error('Add to cart failed: Product data is not loaded yet.');
      toast.error('Please wait, product is loading...');
      return;
    }
    
    console.log('Product loaded:', product.name);
    console.log('uploadedImage:', uploadedImage);
    console.log('uploadedImageData:', uploadedImageData);
    console.log('uploading:', uploading);

    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    // If upload is still in progress, wait for it
    if (!uploadedImageData) {
      toast.error('Please wait for image upload to complete');
      console.log('Upload still in progress, cannot add to cart yet');
      return;
    }

    const customizationData = {
      uploadedImageUrl: uploadedImageData.url,
      uploadedImagePublicId: uploadedImageData.publicId,
      textOverlay: textOverlay.trim(),
      frameColor: frameColor.id,
      adminInstructions: adminInstructions.trim(),
    };

    console.log('Customization data being sent:');
    console.log('- uploadedImageUrl:', customizationData.uploadedImageUrl);
    console.log('- uploadedImagePublicId:', customizationData.uploadedImagePublicId);
    console.log('- textOverlay:', customizationData.textOverlay);
    console.log('- frameColor:', customizationData.frameColor);
    console.log('- adminInstructions:', customizationData.adminInstructions);

    const cartItem = {
      product: {
        _id: product._id,
        name: product.name,
        images: product.images && product.images.length > 0 
          ? product.images 
          : (product.image ? [{ url: product.image }] : [{ url: '' }]), // Ensure proper format
        basePrice: selectedSize.price,
        sizes: [{ name: selectedSize.name, price: selectedSize.price }],
      },
      size: selectedSize.name,
      quantity: 1,
      customization: customizationData,
    };

    console.log('Complete cart item:', JSON.stringify(cartItem, null, 2));
    console.log('Calling addToCart...');
    addToCart(cartItem);
    console.log('addToCart called successfully');
    console.log('=== handleAddToCart END ===');
    
    toast.success('Custom poster added to cart!');
    navigate('/cart');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!instructionsRead) {
      setShowInstructions(true);
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const fakeEvent = { target: { files: [file] } };
        handleImageSelect(fakeEvent);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gradient-to-b from-moon-night to-moon-midnight' : 'bg-gradient-to-b from-gray-50 to-blue-50'
      }`}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-moon-gold mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-20 w-20 border-4 border-moon-mystical opacity-20 mx-auto"></div>
          </div>
          <p className={`mt-6 text-lg font-semibold ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
            Loading Customization Page...
          </p>
          <p className={`mt-2 text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
            Preparing your canvas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-moon-night to-moon-midnight text-white' : 'bg-gradient-to-b from-gray-50 to-blue-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? 'border-moon-midnight bg-moon-night/50' : 'border-gray-200 bg-white/50'} backdrop-blur-xl sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'moon-gradient-text' : 'gradient-text'}`}>
                <FiZap className="inline mr-2" />
                Customize Your Poster
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                {product?.name || 'Custom Poster'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/products/${id}`)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-moon-midnight text-moon-silver hover:bg-moon-night' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiX className="inline mr-2" />
              Cancel
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Instructions Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInstructions(true)}
          className={`mb-6 w-full p-4 rounded-xl flex items-center justify-between ${
            darkMode 
              ? 'bg-moon-gold/10 border-2 border-moon-gold text-moon-gold hover:bg-moon-gold/20' 
              : 'bg-yellow-50 border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-100'
          } transition-all`}
        >
          <div className="flex items-center">
            <FiAlertCircle className="text-2xl mr-3" />
            <div className="text-left">
              <p className="font-bold">Important: Read Before Uploading</p>
              <p className={`text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                Click to view upload guidelines and terms
              </p>
            </div>
          </div>
          {instructionsRead && <FiCheck className="text-2xl" />}
        </motion.button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Live Preview */}
          <div className="space-y-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
              <FiImage className="inline mr-2" />
              Live Preview
            </h2>

            <div
              className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ${
                darkMode ? 'bg-moon-midnight' : 'bg-white'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Frame */}
              {frameColor.id !== 'none' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: `12px solid ${frameColor.color}`,
                    boxShadow: frameColor.id === 'wood' ? 'inset 0 0 20px rgba(0,0,0,0.5)' : 'inset 0 0 20px rgba(0,0,0,0.2)',
                  }}
                ></div>
              )}

              {/* Image Preview */}
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <FiUpload className={`text-6xl mb-4 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`} />
                  <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                    Drag & drop your image here
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
                    or click "Upload Image" below
                  </p>
                  <p className={`text-xs mt-4 ${darkMode ? 'text-moon-silver/40' : 'text-gray-400'}`}>
                    Supported: JPG, PNG, WebP (0.1MB - 50MB)
                  </p>
                </div>
              )}

              {/* Text Overlay */}
              {textOverlay && uploadedImage && (
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <p
                    className="text-white font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    }}
                  >
                    {textOverlay}
                  </p>
                </div>
              )}

              {/* Uploading Overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-moon-gold mx-auto mb-4"></div>
                    <p className="text-white font-semibold">Uploading...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Info */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-moon-midnight/50' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-moon-silver' : 'text-gray-600'}>
                  Selected Size: <strong>{selectedSize.name}</strong> ({selectedSize.dimensions})
                </span>
                <span className={`font-bold text-xl ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                  ৳{selectedSize.price}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Customization Controls */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div>
              <label className={`block text-lg font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                <FiPackage className="inline mr-2" />
                Select Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SIZES.map((size) => (
                  <motion.button
                    key={size.id}
                    whileHover={size.available ? { scale: 1.05 } : {}}
                    whileTap={size.available ? { scale: 0.95 } : {}}
                    onClick={() => size.available && setSelectedSize(size)}
                    disabled={!size.available}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      !size.available
                        ? darkMode
                          ? 'bg-moon-midnight/30 border-moon-midnight/50 text-moon-silver/30 cursor-not-allowed'
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : selectedSize.id === size.id
                        ? darkMode
                          ? 'bg-moon-gold/20 border-moon-gold text-moon-gold'
                          : 'bg-purple-100 border-purple-600 text-purple-600'
                        : darkMode
                        ? 'bg-moon-midnight border-moon-midnight text-moon-silver hover:border-moon-gold/50'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-bold">{size.name}</p>
                    <p className="text-xs opacity-70">{size.dimensions}</p>
                    {size.available ? (
                      <div>
                        {size.originalPrice && (
                          <p className="text-xs line-through opacity-50">৳{size.originalPrice}</p>
                        )}
                        <p className="text-sm font-semibold mt-1">৳{size.price}</p>
                        {size.originalPrice && (
                          <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            30% OFF
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs mt-1 font-semibold">Coming Soon</p>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className={`block text-lg font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                <FiUpload className="inline mr-2" />
                Upload Your Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!instructionsRead) {
                    setShowInstructions(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={uploading}
                className={`w-full p-4 rounded-xl border-2 border-dashed transition-all ${
                  uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'bg-moon-midnight border-moon-gold text-moon-gold hover:bg-moon-gold/10'
                    : 'bg-white border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}
              >
                <FiUpload className="text-3xl mx-auto mb-2" />
                <p className="font-semibold">
                  {uploadedImage ? 'Change Image' : 'Click to Upload'}
                </p>
                <p className="text-sm opacity-70 mt-1">
                  {uploading ? 'Uploading...' : 'JPG, PNG, WebP (0.1MB - 50MB)'}
                </p>
              </motion.button>
            </div>

            {/* Text Overlay */}
            <div>
              <label className={`block text-lg font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                <FiType className="inline mr-2" />
                Text Overlay (Optional)
              </label>
              <input
                type="text"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                placeholder="Enter text to display on poster..."
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-moon-midnight border-moon-midnight text-white placeholder-moon-silver/50 focus:border-moon-gold'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                } outline-none`}
              />
            </div>

            {/* Frame Color */}
            <div>
              <label className={`block text-lg font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                <FiImage className="inline mr-2" />
                Frame Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {FRAME_COLORS.map((frame) => (
                  <motion.button
                    key={frame.id}
                    whileHover={frame.available ? { scale: 1.1 } : {}}
                    whileTap={frame.available ? { scale: 0.9 } : {}}
                    onClick={() => frame.available && setFrameColor(frame)}
                    disabled={!frame.available}
                    className={`p-2 rounded-xl border-2 transition-all relative ${
                      !frame.available
                        ? 'opacity-40 cursor-not-allowed'
                        : frameColor.id === frame.id
                        ? 'border-moon-gold scale-110'
                        : darkMode
                        ? 'border-moon-midnight hover:border-moon-gold/50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg mb-1"
                      style={{
                        backgroundColor: frame.color,
                        border: frame.id === 'none' ? `2px dashed ${frame.border}` : 'none',
                      }}
                    ></div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                      {frame.name}
                    </p>
                    {!frame.available && (
                      <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                        Coming Soon
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Admin Instructions */}
            <div>
              <label className={`block text-lg font-semibold mb-3 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                <FiFileText className="inline mr-2" />
                Special Instructions (Optional)
              </label>
              <textarea
                value={adminInstructions}
                onChange={(e) => setAdminInstructions(e.target.value)}
                placeholder="Any special requests or instructions for our team..."
                rows={4}
                className={`w-full p-4 rounded-xl border-2 transition-all resize-none ${
                  darkMode
                    ? 'bg-moon-midnight border-moon-midnight text-white placeholder-moon-silver/50 focus:border-moon-gold'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                } outline-none`}
              />
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: (loading || !uploadedImageData || uploading) ? 1 : 1.01 }}
              whileTap={{ scale: (loading || !uploadedImageData || uploading) ? 1 : 0.99 }}
              onClick={handleAddToCart}
              disabled={loading || !uploadedImageData || uploading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                loading || !uploadedImageData || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode
                  ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
              }`}
            >
              <FiCheck className="inline mr-2" />
              {loading
                ? 'Loading Product...'
                : uploading 
                ? 'Uploading...' 
                : !uploadedImageData && uploadedImage
                ? 'Processing...'
                : !uploadedImage
                ? 'Upload Image First'
                : `Add to Cart - ৳${selectedSize.price}`
              }
            </motion.button>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-2xl w-full my-8 rounded-2xl shadow-2xl ${
                darkMode ? 'bg-moon-midnight border-2 border-moon-mystical/30' : 'bg-white border-2 border-purple-200'
              }`}
            >
              {/* Modal Header - Sticky */}
              <div className={`sticky top-0 z-10 rounded-t-2xl border-b p-6 ${
                darkMode ? 'bg-moon-midnight/95 backdrop-blur-xl border-moon-mystical/30' : 'bg-white/95 backdrop-blur-xl border-purple-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`}>
                    <FiAlertCircle className="text-2xl animate-pulse" />
                    Important: Read Before Uploading
                  </h2>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode ? 'hover:bg-moon-night text-moon-silver hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className={`space-y-4 ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>
                  <div className={`p-4 rounded-xl border-2 ${
                    darkMode ? 'bg-moon-night/50 border-moon-mystical/30' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <h3 className={`font-bold mb-3 text-lg flex items-center gap-2 ${
                      darkMode ? 'text-moon-gold' : 'text-purple-600'
                    }`}>
                      <FiUpload />
                      Upload Guidelines:
                    </h3>
                    <ul className="space-y-2.5 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Select Size:</strong> Choose the size for your poster (e.g., A4, A3, 12x18, or 13x19).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Upload Image:</strong> Click the upload button to select your image file from your device.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Edit Image:</strong> After uploading, use the edit option to adjust your image as needed.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Check File Size:</strong> Ensure your file size is between 0.1MB and 50MB.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Review Content:</strong> Make sure your image does not contain explicit or nudity content.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-moon-gold' : 'text-purple-500'}`}>•</span>
                        <span><strong>Finalize:</strong> Confirm your image fits within the chosen dimensions.</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    darkMode ? 'bg-moon-night/50 border-yellow-600/30' : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <h3 className={`font-bold mb-3 text-lg flex items-center gap-2 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-700'
                    }`}>
                      <FiAlertCircle />
                      Terms and Conditions:
                    </h3>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>VYBE may reject images that violate content guidelines.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>Uploaded images will be reviewed before printing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>Orders with rejected images will be canceled and refunded.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>VYBE is not liable for copyright infringements from uploaded images.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>By uploading, you confirm you have the right to use the image.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>•</span>
                        <span>Processing time: 1-2 business days for approval after order placement.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Sticky */}
              <div className={`sticky bottom-0 rounded-b-2xl border-t p-6 ${
                darkMode ? 'bg-moon-midnight/95 backdrop-blur-xl border-moon-mystical/30' : 'bg-white/95 backdrop-blur-xl border-purple-200'
              }`}>
                <div className="flex gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInstructions(false)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? 'bg-moon-night text-moon-silver hover:bg-moon-midnight border-2 border-moon-mystical/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                    }`}
                  >
                    <FiX className="inline mr-2" />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInstructionsRead(true);
                      setShowInstructions(false);
                      toast.success('You can now upload your image!');
                      setTimeout(() => fileInputRef.current?.click(), 300);
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg ${
                      darkMode
                        ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
                    }`}
                  >
                    <FiCheck className="inline mr-2" />
                    I Understand & Agree
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
