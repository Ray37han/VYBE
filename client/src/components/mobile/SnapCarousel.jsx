import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';

export default function SnapCarousel({ title, products, darkMode }) {
  const scrollRef = useRef(null);

  return (
    <section className="py-8 px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <h2 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h2>
        <div className={`w-20 h-1 rounded-full ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-purple-600 to-pink-600'
        }`} />
      </motion.div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          willChange: 'transform',
        }}
      >
        {products?.map((product, index) => (
          <motion.div
            key={product._id || index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 snap-center"
          >
            <Link to={`/product/${product._id}`}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`relative w-[200px] sm:w-[240px] h-[320px] sm:h-[360px] rounded-3xl overflow-hidden ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                style={{
                  boxShadow: darkMode
                    ? `
                      inset 2px 2px 4px rgba(255, 255, 255, 0.05),
                      inset -2px -2px 4px rgba(0, 0, 0, 0.3),
                      0px 10px 30px rgba(0, 0, 0, 0.5)
                    `
                    : `
                      inset 2px 2px 4px rgba(255, 255, 255, 0.5),
                      inset -2px -2px 4px rgba(0, 0, 0, 0.05),
                      0px 10px 20px rgba(0, 0, 0, 0.1)
                    `,
                }}
              >
                {/* Image Container */}
                <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || product.image || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 ${
                    darkMode
                      ? 'bg-gradient-to-t from-gray-800 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-white via-transparent to-transparent'
                  }`} />

                  {/* Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md ${
                      darkMode
                        ? 'bg-white/10 text-white'
                        : 'bg-white/70 text-gray-700'
                    }`}
                    style={{
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}
                  >
                    <FiHeart className="w-5 h-5" />
                  </motion.button>

                  {/* Badge */}
                  {product.stock < 10 && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                      darkMode
                        ? 'bg-red-500/90 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      Limited
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <div>
                    <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.name}
                    </h3>
                    <p className={`text-xs mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${
                      darkMode
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}>
                      ৳{product.basePrice || product.price}
                    </span>
                    
                    {/* Rating */}
                    {product.rating?.average && (
                      <div className="flex items-center gap-1">
                        <FiStar className={`w-3 h-3 fill-current ${
                          darkMode ? 'text-yellow-400' : 'text-yellow-500'
                        }`} />
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {product.rating.average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {/* View All Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-shrink-0 snap-center"
        >
          <Link to="/products">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`w-[200px] sm:w-[240px] h-[320px] sm:h-[360px] rounded-3xl flex items-center justify-center ${
                darkMode
                  ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30'
                  : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'
              }`}
              style={{
                boxShadow: darkMode
                  ? 'inset 2px 2px 4px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5)'
                  : 'inset 2px 2px 4px rgba(255,255,255,0.5), 0 10px 20px rgba(0,0,0,0.1)',
              }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className={`text-5xl mb-4 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}
                >
                  →
                </motion.div>
                <p className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  View All
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
