import { motion } from 'framer-motion';

// Product Card Skeleton
export function ProductCardSkeleton({ darkMode }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${
      darkMode ? 'bg-moon-midnight/50 border border-moon-gold/10' : 'bg-white border border-gray-100'
    }`}>
      {/* Image Skeleton */}
      <div className={`relative h-64 overflow-hidden animate-pulse ${
        darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'
      }`}>
        <div className={`absolute inset-0 shimmer ${
          darkMode ? 'bg-gradient-to-r from-transparent via-moon-gold/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
        }`} style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite'
        }}></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className={`h-6 rounded animate-pulse ${
          darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'
        }`}></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className={`h-4 rounded animate-pulse ${
            darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
          }`}></div>
          <div className={`h-4 w-2/3 rounded animate-pulse ${
            darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
          }`}></div>
        </div>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between pt-2">
          <div className={`h-8 w-24 rounded animate-pulse ${
            darkMode ? 'bg-moon-gold/20' : 'bg-purple-200'
          }`}></div>
          <div className={`h-10 w-32 rounded-xl animate-pulse ${
            darkMode ? 'bg-moon-mystical/20' : 'bg-purple-200'
          }`}></div>
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8, darkMode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ProductCardSkeleton darkMode={darkMode} />
        </motion.div>
      ))}
    </div>
  );
}

// Product Detail Skeleton
export function ProductDetailSkeleton({ darkMode }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className={`rounded-2xl overflow-hidden shadow-lg aspect-square animate-pulse ${
          darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'
        }`}></div>
        
        {/* Thumbnail Images */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`aspect-square rounded-lg animate-pulse ${
              darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
            }`}></div>
          ))}
        </div>
      </div>
      
      {/* Product Info Skeleton */}
      <div className="space-y-6">
        {/* Title */}
        <div className={`h-10 w-3/4 rounded animate-pulse ${
          darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'
        }`}></div>
        
        {/* Price */}
        <div className={`h-12 w-40 rounded animate-pulse ${
          darkMode ? 'bg-moon-gold/20' : 'bg-purple-200'
        }`}></div>
        
        {/* Description */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-4 rounded animate-pulse ${
              darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
            }`} style={{ width: i === 4 ? '60%' : '100%' }}></div>
          ))}
        </div>
        
        {/* Size Options */}
        <div className="space-y-3">
          <div className={`h-6 w-32 rounded animate-pulse ${
            darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
          }`}></div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-12 w-20 rounded-xl animate-pulse ${
                darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
              }`}></div>
            ))}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <div className={`h-14 flex-1 rounded-xl animate-pulse ${
            darkMode ? 'bg-moon-mystical/20' : 'bg-purple-200'
          }`}></div>
          <div className={`h-14 w-14 rounded-xl animate-pulse ${
            darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
          }`}></div>
        </div>
      </div>
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton({ darkMode }) {
  return (
    <div className={`rounded-2xl p-6 shadow-lg animate-pulse ${
      darkMode ? 'bg-moon-midnight/50 border border-moon-gold/10' : 'bg-white border border-gray-100'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className={`h-6 w-32 rounded ${darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'}`}></div>
          <div className={`h-4 w-48 rounded ${darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`h-8 w-24 rounded-full ${darkMode ? 'bg-moon-gold/20' : 'bg-purple-200'}`}></div>
      </div>
      
      <div className="space-y-3">
        <div className={`h-4 w-full rounded ${darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'}`}></div>
        <div className={`h-4 w-2/3 rounded ${darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'}`}></div>
      </div>
      
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-opacity-20">
        <div className={`h-8 w-28 rounded ${darkMode ? 'bg-moon-gold/30' : 'bg-purple-200'}`}></div>
        <div className={`h-10 w-32 rounded-xl ${darkMode ? 'bg-moon-mystical/20' : 'bg-purple-200'}`}></div>
      </div>
    </div>
  );
}

// Generic Page Skeleton
export function PageSkeleton({ darkMode }) {
  return (
    <div className={`pt-24 pb-12 min-h-screen ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className={`h-12 w-64 rounded animate-pulse ${
            darkMode ? 'bg-moon-gold/20' : 'bg-purple-200'
          }`}></div>
          <div className={`h-6 w-96 rounded animate-pulse ${
            darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'
          }`}></div>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${
              darkMode ? 'bg-moon-midnight/50' : 'bg-white'
            }`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cart Item Skeleton
export function CartItemSkeleton({ darkMode }) {
  return (
    <div className={`flex gap-4 p-4 rounded-xl animate-pulse ${
      darkMode ? 'bg-moon-midnight/30' : 'bg-gray-50'
    }`}>
      {/* Image */}
      <div className={`w-24 h-24 rounded-lg ${darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'}`}></div>
      
      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className={`h-5 w-48 rounded ${darkMode ? 'bg-moon-blue/30' : 'bg-gray-200'}`}></div>
        <div className={`h-4 w-32 rounded ${darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'}`}></div>
        <div className="flex justify-between items-center">
          <div className={`h-8 w-28 rounded ${darkMode ? 'bg-moon-gold/20' : 'bg-purple-200'}`}></div>
          <div className={`h-8 w-24 rounded ${darkMode ? 'bg-moon-blue/20' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
}
