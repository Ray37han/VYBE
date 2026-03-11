import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiZap } from 'react-icons/fi';
import { featuredPostersAPI } from '../api';
import LoadingStore from './LoadingStore';

/**
 * FeaturedProducts - Trending Now section, controlled from admin dashboard
 */

export default function FeaturedProducts({ darkMode = false }) {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await featuredPostersAPI.getAll();
        setPosters(data || []);
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const cleanName = (name) => {
    if (!name) return '';
    return name
      .replace(/\s*\|\|\s*#\d+/g, '')
      .replace(/\s*#\d+$/g, '')
      .trim();
  };

  const getDiscountPct = (base, original) => {
    if (!base || !original || original <= base) return 25;
    return Math.round(((original - base) / original) * 100);
  };

  if (loading) return <LoadingStore text="Loading trending drops" />;
  if (posters.length === 0) return null;

  return (
    <section className={`relative py-16 sm:py-24 overflow-hidden ${
      darkMode ? 'bg-[#060610]' : 'bg-[#f7f3ff]'
    }`}>
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full blur-[140px] ${
          darkMode ? 'bg-violet-800/40' : 'bg-violet-300/50'
        }`} />
        <div className={`absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full blur-[140px] ${
          darkMode ? 'bg-pink-800/30' : 'bg-pink-300/40'
        }`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] ${
          darkMode ? 'bg-cyan-700/20' : 'bg-indigo-200/40'
        }`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-5"
        >
          <div>
            {/* Hot drops pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 mb-4 px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/40 text-pink-400"
            >
              <FiZap className="w-3 h-3 fill-current" />
              Hot Drops
            </motion.div>

            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-950'
            }`}>
              Trending{' '}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Now
              </span>{' '}
              <span className="inline-block animate-bounce">🔥</span>
            </h2>

            <p className={`mt-3 text-sm font-medium tracking-wide ${
              darkMode ? 'text-white/35' : 'text-gray-500'
            }`}>
              What everyone's copping right now
            </p>
          </div>

          <Link
            to="/products"
            className={`group hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
              darkMode
                ? 'border-white/20 text-white hover:bg-white hover:text-black hover:border-white'
                : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
            }`}
          >
            View All
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {posters.slice(0, 8).map((poster, index) => {
            const product = poster.productId;
            const productId = product?._id;
            const name = cleanName(product?.name || poster.title);
            const image =
              product?.images?.[0]?.urls?.thumbnail ||
              product?.images?.[0]?.url ||
              poster.image;
            const basePrice = product?.basePrice ?? poster.basePrice;
            const originalPrice =
              product?.originalPrice ??
              poster.originalPrice ??
              (basePrice ? Math.round(basePrice / 0.8) : null);
            const rating = product?.rating?.average || 0;
            const discountPct = getDiscountPct(basePrice, originalPrice);
            const rank = String(index + 1).padStart(2, '0');
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={poster._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative"
              >
                {/* Glow ring on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 blur-xl ${
                    isHovered
                      ? 'bg-gradient-to-br from-violet-500/30 to-pink-500/30 opacity-100'
                      : 'opacity-0'
                  }`}
                />

                <Link to={productId ? `/products/${productId}` : '/products'} className="group block relative">
                  <motion.div
                    animate={isHovered ? { y: -6, scale: 1.02 } : { y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`rounded-2xl overflow-hidden transition-shadow duration-500 ${
                      isHovered ? 'shadow-2xl shadow-purple-500/20' : 'shadow-sm'
                    } ${
                      darkMode
                        ? 'bg-white/[0.05] border border-white/10 backdrop-blur-sm'
                        : 'bg-white border border-gray-100/80'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-900/20">
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Dark gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                      {/* Rank number */}
                      <div className={`absolute top-2.5 left-3 text-3xl font-black leading-none select-none ${
                        darkMode ? 'text-white/15' : 'text-black/10'
                      }`}>
                        {rank}
                      </div>

                      {/* Discount badge */}
                      {basePrice && discountPct > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -15 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.07 + 0.25,
                            type: 'spring',
                            stiffness: 260,
                            damping: 14,
                          }}
                          className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/40"
                        >
                          -{discountPct}%
                        </motion.div>
                      )}

                      {/* Quick View CTA */}
                      <div className="absolute bottom-3 inset-x-0 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-gray-900 text-xs font-bold shadow-xl">
                          <FiShoppingCart className="w-3.5 h-3.5" />
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Info bar */}
                    <div className={`p-3 sm:p-3.5 ${
                      darkMode ? 'border-t border-white/8' : 'border-t border-gray-100'
                    }`}>
                      <h3 className={`font-bold text-[13px] leading-snug line-clamp-1 mb-2.5 ${
                        darkMode ? 'text-white/90' : 'text-gray-900'
                      }`}>
                        {name}
                      </h3>

                      <div className="flex items-center justify-between gap-2">
                        {basePrice ? (
                          <div className="flex flex-col leading-none gap-0.5">
                            <span className="text-base font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                              ৳{basePrice.toLocaleString()}
                            </span>
                            {originalPrice && (
                              <span className={`text-[10px] line-through ${
                                darkMode ? 'text-white/25' : 'text-gray-400'
                              }`}>
                                ৳{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-300'}`}>—</span>
                        )}

                        {rating > 0 && (
                          <div className={`flex items-center gap-1 shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
                            darkMode
                              ? 'bg-yellow-400/15 text-yellow-400'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                          }`}>
                            <FiStar className="w-2.5 h-2.5 fill-current" />
                            {rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="sm:hidden text-center mt-10"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-pink-600 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
          >
            See All Drops →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
