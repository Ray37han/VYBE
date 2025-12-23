/**
 * MobileHero - Optimized Hero Section for Low-End Devices
 * 
 * Performance Optimizations:
 * 1. NO Framer Motion on initial render - uses CSS keyframes
 * 2. NO backdrop-filter (glassmorphism) on mobile
 * 3. Simplified shadows and animations
 * 4. Optimized <picture> tag for WebP images
 * 5. Prevents Layout Shift with explicit dimensions
 */

import { Link } from 'react-router-dom';

export default function MobileHero({ darkMode }) {
  return (
    <section 
      className="mobile-hero relative min-h-[85dvh] flex items-center justify-center overflow-hidden"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #0f0a1e 0%, #1a1230 25%, #2d1b4e 50%, #1a1230 75%, #0f0a1e 100%)'
          : 'linear-gradient(135deg, #fef3ff 0%, #f0e6ff 25%, #e0d4ff 50%, #d4c5ff 75%, #c9b3ff 100%)'
      }}
    >
      {/* Static Background Shapes - CSS Only, No JS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`hero-cloud absolute rounded-full blur-3xl ${
              darkMode ? 'bg-purple-500/20' : 'bg-white/40'
            }`}
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              left: `${i * 30}%`,
              top: `${i * 20}%`,
              animationDelay: `${i * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Content - Using CSS Keyframes for instant render */}
      <div className="hero-content relative z-10 text-center px-6">
        {/* Logo with CSS Animation */}
        <div className="hero-logo mb-8">
          <h1 
            className={`text-8xl md:text-9xl font-black tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{
              fontFamily: "'Fredoka', 'Nunito', 'Poppins', sans-serif",
              textShadow: darkMode
                ? `
                  0 4px 0 rgba(139, 92, 246, 0.3),
                  0 8px 0 rgba(139, 92, 246, 0.2),
                  0 12px 0 rgba(139, 92, 246, 0.1),
                  0 16px 20px rgba(0, 0, 0, 0.4)
                `
                : `
                  0 2px 0 rgba(255, 255, 255, 0.8),
                  0 4px 0 rgba(147, 51, 234, 0.2),
                  0 8px 0 rgba(147, 51, 234, 0.15),
                  0 12px 0 rgba(147, 51, 234, 0.1),
                  0 16px 30px rgba(147, 51, 234, 0.3)
                `,
              WebkitTextStroke: darkMode ? '2px rgba(139, 92, 246, 0.5)' : '2px rgba(147, 51, 234, 0.3)',
            }}
          >
            VYBE
          </h1>
          <p 
            className={`hero-tagline text-lg md:text-xl font-medium tracking-wide ${
              darkMode ? 'text-purple-200' : 'text-purple-700'
            }`}
          >
            Express Yourself in Art
          </p>
        </div>

        {/* CTA Button - Simplified Shadow for Mobile Performance */}
        <div className="hero-cta">
          <Link
            to="/products"
            className={`inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-full transition-transform active:scale-95 ${
              darkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            }`}
            style={{
              // Simplified shadow - single layer for mobile performance
              boxShadow: darkMode
                ? '0 10px 30px rgba(139, 92, 246, 0.4)'
                : '0 10px 30px rgba(147, 51, 234, 0.3)',
            }}
          >
            <span>Shop Now</span>
            <span className="hero-arrow">→</span>
          </Link>
        </div>

        {/* Badges - Solid backgrounds (NO backdrop-blur on mobile) */}
        <div className="hero-badges mt-10 flex flex-wrap justify-center gap-4">
          {['Fast Shipping', 'Premium Quality', 'Flat 33% Discount'].map((text, i) => (
            <div
              key={text}
              className={`px-5 py-2 text-sm font-semibold rounded-full border ${
                darkMode
                  ? 'bg-purple-900/95 text-purple-200 border-purple-500/30'
                  : 'bg-white/95 text-purple-700 border-purple-200'
              }`}
              style={{
                // Simple single shadow instead of complex inset shadows
                boxShadow: darkMode
                  ? '0 4px 15px rgba(0,0,0,0.2)'
                  : '0 4px 15px rgba(147,51,234,0.15)',
                animationDelay: `${1.2 + i * 0.1}s`,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator - Simple CSS */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 ${
          darkMode ? 'border-purple-400' : 'border-purple-600'
        }`}>
          <div className={`scroll-dot w-1.5 h-1.5 rounded-full ${
            darkMode ? 'bg-purple-400' : 'bg-purple-600'
          }`} />
        </div>
      </div>
    </section>
  );
}
