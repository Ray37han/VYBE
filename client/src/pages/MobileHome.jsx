import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productsAPI } from '../api';
import MobileHero from '../components/mobile/MobileHero';
import SnapCarousel from '../components/mobile/SnapCarousel';
import MarqueeBar from '../components/mobile/MarqueeBar';
import MobileLayout from '../components/mobile/MobileLayout';
import { FullPageLoader } from '../components/LoadingSpinner';

export default function MobileHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Theme detection
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    // Fetch products
    fetchProducts();

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 20 });
      const allProducts = response.data || response || [];
      
      setProducts(allProducts);
      
      // Split into trending (by rating) and new arrivals (by date)
      const sorted = [...allProducts].sort((a, b) => 
        (b.rating?.average || 0) - (a.rating?.average || 0)
      );
      setTrendingProducts(sorted.slice(0, 10));
      
      const newSorted = [...allProducts].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNewArrivals(newSorted.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullPageLoader text="Loading your VYBE..." />;
  }

  return (
    <MobileLayout>
      {/* Hero Section with Parallax */}
      <MobileHero darkMode={darkMode} />

      {/* Marquee Banner */}
      <MarqueeBar darkMode={darkMode} />

      {/* Trending Products Carousel */}
      <SnapCarousel 
        title="🔥 Trending Now" 
        products={trendingProducts} 
        darkMode={darkMode} 
      />

      {/* Feature Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-4 py-12"
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '✨', title: 'Custom Design', desc: 'Your vision, our art' },
            { icon: '🚀', title: 'Fast Shipping', desc: 'Delivered in days' },
            { icon: '💎', title: 'Premium Quality', desc: 'Museum-grade prints' },
            { icon: '💯', title: '100% Original', desc: 'Unique creations' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-3xl text-center ${
                darkMode
                  ? 'bg-gray-800/50 border border-purple-500/20'
                  : 'bg-white/60 border border-purple-200/50'
              }`}
              style={{
                boxShadow: darkMode
                  ? 'inset 2px 2px 4px rgba(255,255,255,0.05), 0 10px 20px rgba(0,0,0,0.3)'
                  : 'inset 2px 2px 4px rgba(255,255,255,0.5), 0 10px 20px rgba(0,0,0,0.08)',
              }}
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className={`font-bold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* New Arrivals Carousel */}
      <SnapCarousel 
        title="✨ Fresh Drops" 
        products={newArrivals} 
        darkMode={darkMode} 
      />

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-4 py-12 mb-20"
      >
        <div
          className={`p-8 rounded-3xl text-center ${
            darkMode
              ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30'
              : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'
          }`}
          style={{
            boxShadow: darkMode
              ? 'inset 2px 2px 6px rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.4)'
              : 'inset 2px 2px 6px rgba(255,255,255,0.6), 0 15px 40px rgba(147,51,234,0.2)',
          }}
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Create?
          </h2>
          <p className={`mb-6 ${
            darkMode ? 'text-purple-200' : 'text-purple-700'
          }`}>
            Design your custom poster in minutes
          </p>
          <motion.a
            href="/customize"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full"
            style={{
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)',
            }}
          >
            <span>Start Creating</span>
            <span>→</span>
          </motion.a>
        </div>
      </motion.section>
    </MobileLayout>
  );
}
