/**
 * MobileHome - Optimized Mobile Landing Page
 * 
 * Performance Optimizations Applied:
 * 1. Code Splitting - Hero loads immediately, heavy sections lazy-loaded
 * 2. Intersection Observer - Components only mount when user scrolls near them
 * 3. Skeleton Loaders - Show placeholders while data loads
 * 4. NO backdrop-filter on mobile (< md breakpoint)
 * 5. Simplified shadows for low-end devices
 * 6. Suspense boundaries for graceful loading
 * 
 * Target: TTI < 2 seconds on 4G, 3GB RAM Android
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { productsAPI } from '../api';
import MobileLayout from '../components/mobile/MobileLayout';
import { FullPageLoader } from '../components/LoadingSpinner';
import useInView from '../hooks/useInView';
import { SkeletonCarousel, SkeletonFeatureGrid } from '../components/mobile/SkeletonCard';

// ✅ ZERO-LAG HERO: Load immediately (no lazy loading)
import MobileHero from '../components/mobile/MobileHero.optimized';

// ⚡ CODE SPLITTING: Heavy components loaded on-demand
const SnapCarousel = lazy(() => import('../components/mobile/SnapCarousel'));
const MarqueeBar = lazy(() => import('../components/mobile/MarqueeBar'));

/**
 * LazySection - Wrapper that only mounts children when in viewport
 * Uses Intersection Observer for optimal performance
 */
function LazySection({ children, skeleton, className = '' }) {
  const [ref, isInView] = useInView({ 
    rootMargin: '100px', // Start loading 100px before visible
    triggerOnce: true 
  });

  return (
    <div ref={ref} className={className}>
      {isInView ? (
        <Suspense fallback={skeleton}>
          {children}
        </Suspense>
      ) : (
        skeleton
      )}
    </div>
  );
}

/**
 * FeatureSection - Lightweight component with mobile-optimized styles
 * NO Framer Motion, NO backdrop-filter, Simple shadows
 */
function FeatureSection({ darkMode }) {
  return (
    <section className="px-4 py-12">
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: '🚀', title: 'Fast Shipping', desc: 'Delivered in days' },
          { icon: '💎', title: 'Premium Quality', desc: 'Museum-grade prints' },
          { icon: '🎁', title: 'Flat 33% Discount', desc: 'Special offer' },
          { icon: '✨', title: 'Custom Design', desc: 'Your vision, our art' },
        ].map((feature, i) => (
          <div
            key={i}
            className={`feature-card p-6 rounded-3xl text-center transition-transform active:scale-95 ${
              darkMode
                ? 'bg-gray-800/95 border border-purple-500/20' // Solid bg, no backdrop-blur
                : 'bg-white/95 border border-purple-200/50'
            }`}
            style={{
              // Single simple shadow for mobile performance
              boxShadow: darkMode
                ? '0 10px 20px rgba(0,0,0,0.3)'
                : '0 10px 20px rgba(0,0,0,0.08)',
              animationDelay: `${i * 0.1}s`,
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
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * CTASection - Call-to-action with optimized styles
 */
function CTASection({ darkMode }) {
  return (
    <section className="px-4 py-12 mb-20">
      <div
        className={`cta-card p-8 rounded-3xl text-center ${
          darkMode
            ? 'bg-gradient-to-br from-purple-900/95 to-pink-900/95 border border-purple-500/30'
            : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'
        }`}
        style={{
          // Single shadow for performance
          boxShadow: darkMode
            ? '0 15px 40px rgba(0,0,0,0.4)'
            : '0 15px 40px rgba(147,51,234,0.2)',
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
        <a
          href="/customize"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full transition-transform active:scale-95"
          style={{
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)',
          }}
        >
          <span>Start Creating</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}

export default function MobileHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [heroItems, setHeroItems] = useState([]);
  const [featuredPosters, setFeaturedPosters] = useState([]);
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const [heroResponse, recentProductsResponse] = await Promise.all([
        fetch(`${API_URL}/hero-items`).then(res => res.json()),
        productsAPI.getAll({ limit: 10, sortBy: 'createdAt', order: 'desc' })
      ]);
      
      // Hero items for Trending Now section
      const heroData = heroResponse.data || [];
      const heroProducts = heroData
        .filter(item => item.product && item.product.images && item.product.images.length > 0)
        .map(item => item.product);
      setHeroItems(heroProducts);
      
      // Most recently added products for Fresh Drops section
      const recentProducts = recentProductsResponse.data || recentProductsResponse.products || [];
      setFeaturedPosters(recentProducts);
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
      {/* ✅ HERO SECTION: Loads immediately - highest priority */}
      <MobileHero darkMode={darkMode} />

      {/* ⚡ MARQUEE BAR: Lazy-loaded when near viewport */}
      <LazySection 
        skeleton={<div className="h-12 bg-transparent" />}
      >
        <MarqueeBar darkMode={darkMode} />
      </LazySection>

      {/* ⚡ TRENDING CAROUSEL: Lazy-loaded with skeleton */}
      <LazySection 
        skeleton={<SkeletonCarousel darkMode={darkMode} />}
      >
        <SnapCarousel 
          title="🔥 Trending Now" 
          products={heroItems} 
          darkMode={darkMode} 
        />
      </LazySection>

      {/* ⚡ FEATURE SECTION: Lightweight, but still lazy-loaded */}
      <LazySection 
        skeleton={<SkeletonFeatureGrid darkMode={darkMode} />}
      >
        <FeatureSection darkMode={darkMode} />
      </LazySection>

      {/* ⚡ FRESH DROPS CAROUSEL: Lazy-loaded with skeleton */}
      <LazySection 
        skeleton={<SkeletonCarousel darkMode={darkMode} />}
      >
        <SnapCarousel 
          title="✨ Fresh Drops" 
          products={featuredPosters} 
          darkMode={darkMode} 
        />
      </LazySection>

      {/* ⚡ CTA SECTION: Last priority, lazy-loaded */}
      <LazySection 
        skeleton={<div className="h-64 bg-transparent" />}
      >
        <CTASection darkMode={darkMode} />
      </LazySection>
    </MobileLayout>
  );
}
