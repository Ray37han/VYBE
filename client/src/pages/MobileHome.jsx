import { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom'; // ✅ Makes buttons work without page reload
import { motion } from 'framer-motion';
import { productsAPI } from '../api';

// Critical Import
import MobileHero from '../components/mobile/MobileHero.lcp';
import MobileLayout from '../components/mobile/MobileLayout';

// Lazy Imports
const SnapCarousel = lazy(() => import('../components/mobile/SnapCarousel'));
const MarqueeBar = lazy(() => import('../components/mobile/MarqueeBar'));

// 🦴 The "Clay" Skeleton Loader (Matches the rounded aesthetics)
const CarouselSkeleton = () => (
  <div className="py-8 pl-4">
    <div className="h-8 w-48 bg-gray-200/50 rounded-xl mb-6 animate-pulse" />
    <div className="flex gap-4 overflow-hidden pr-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[70%] aspect-[3/4] bg-gray-100 rounded-[32px] border-2 border-white/50 animate-pulse" />
      ))}
    </div>
  </div>
);

export default function MobileHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [heroItems, setHeroItems] = useState([]);
  const [featuredPosters, setFeaturedPosters] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
    
    fetchData();

    const handleThemeChange = () => setDarkMode(localStorage.getItem('theme') === 'dark');
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      fetch(`${API_URL}/hero-items`)
        .then(res => res.json())
        .then(data => setHeroItems((data.data || []).map(item => item.product).filter(Boolean)))
        .catch(console.error);

      productsAPI.getAll({ limit: 10, sortBy: 'createdAt', order: 'desc' })
        .then(res => setFeaturedPosters(res.data || res.products || []))
        .catch(console.error);
    } catch (error) { console.error(error); }
  };

  return (
    <MobileLayout showBottomDock={false}>
      <MobileHero darkMode={darkMode} />

      <Suspense fallback={<div className="h-12 w-full" />}>
        <MarqueeBar darkMode={darkMode} />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        {heroItems.length > 0 && (
            <SnapCarousel title="🔥 Trending Now" products={heroItems} darkMode={darkMode} />
        )}
      </Suspense>

      {/* ✨ Refreshed Feature Section */}
      <FeatureSection darkMode={darkMode} />

      <Suspense fallback={<CarouselSkeleton />}>
        {featuredPosters.length > 0 && (
            <SnapCarousel title="✨ Fresh Drops" products={featuredPosters} darkMode={darkMode} />
        )}
      </Suspense>

      {/* 🚀 High-Performance CTA */}
      <CTASection darkMode={darkMode} />
      
    </MobileLayout>
  );
}

// ✨ The Attractive, Lag-Free Feature Grid
const FeatureSection = ({ darkMode }) => {
  const features = [
    { icon: '🚀', title: 'Fast Shipping', desc: 'In 3-5 days', link: '/shipping-policy' },
    { icon: '💎', title: 'Premium Art', desc: 'Museum Grade', link: '/quality' },
    { icon: '🎨', title: 'Custom Made', desc: 'Upload Yours', link: '/customize' },
    { icon: '🎁', title: 'Gift Wrap', desc: 'Available', link: '/gifts' },
  ];

  return (
    <section className="px-4 py-8">
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <Link 
            to={feature.link}
            key={i}
            className="group relative"
          >
            <div 
              className={`
                h-full p-5 rounded-[24px] border transition-all duration-300
                active:scale-95 active:shadow-none
                ${darkMode 
                  ? 'bg-[#1a1a2e] border-white/10 shadow-[4px_4px_0px_#4c1d95]' 
                  : 'bg-white border-slate-200 shadow-[4px_4px_0px_#e2e8f0]'
                }
              `}
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {feature.title}
              </h3>
              <p className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {feature.desc}
              </p>
              
              {/* Subtle visual indicator arrow */}
              <div className={`absolute top-4 right-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                ↗
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// 🚀 The "Pop" CTA Section (Looks 3D, Runs 2D)
const CTASection = ({ darkMode }) => (
  <section className="px-4 pb-24 pt-8">
    <div 
      className={`
        relative overflow-hidden rounded-[32px] p-8 text-center
        transition-transform duration-300 hover:scale-[1.01]
        ${darkMode 
          ? 'bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10' 
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100'
        }
      `}
    >
      {/* Background Decor (Cheap CSS Circles) */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 ${darkMode ? 'bg-purple-500' : 'bg-purple-300'}`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20 -ml-10 -mb-10 ${darkMode ? 'bg-blue-500' : 'bg-blue-300'}`} />

      <div className="relative z-10">
        <h2 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Your Vibe, <br/> Your Art.
        </h2>
        <p className={`mb-6 text-sm ${darkMode ? 'text-purple-200' : 'text-slate-600'}`}>
          Upload any image and we'll turn it into a premium poster instantly.
        </p>
        
        <Link
          to="/customize"
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white
            transform transition-all duration-200 
            active:scale-90 hover:shadow-xl hover:-translate-y-1
            ${darkMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_10px_20px_-10px_rgba(168,85,247,0.5)]' 
              : 'bg-slate-900 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)]'
            }
          `}
        >
          <span>Start Creating</span>
          {/* Animated Arrow */}
          <span className="animate-pulse">→</span>
        </Link>
      </div>
    </div>
  </section>
);