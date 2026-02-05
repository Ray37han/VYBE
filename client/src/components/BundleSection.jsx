import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPercent, FiPackage } from 'react-icons/fi';

/**
 * BundleSection - Promote bundles and offers
 */

export default function BundleSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiPercent className="w-4 h-4" />
              Limited Time Offer
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Bundle & Save<br />
              <span className="text-purple-300">Up to 40% OFF</span>
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg">
              Create your perfect gallery wall. Buy 3 or more posters and unlock exclusive discounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-all min-h-[48px]"
              >
                <FiPackage className="w-5 h-5" />
                Shop Bundles
              </Link>
            </div>

            {/* Bundle Perks */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-300">3+</p>
                <p className="text-sm text-white/70">Buy 3, Get 15% OFF</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">5+</p>
                <p className="text-sm text-white/70">Buy 5, Get 25% OFF</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">10+</p>
                <p className="text-sm text-white/70">Buy 10, Get 40% OFF</p>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Stacked Posters Effect */}
              <div className="absolute -top-4 -left-4 w-48 h-64 bg-white/10 rounded-2xl transform -rotate-6" />
              <div className="absolute -top-2 -left-2 w-48 h-64 bg-white/20 rounded-2xl transform -rotate-3" />
              <div className="relative w-48 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🖼️</span>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -right-4 top-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full shadow-lg"
              >
                SAVE 40%
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
