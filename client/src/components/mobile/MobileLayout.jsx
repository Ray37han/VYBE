import { useEffect, useState } from 'react';
import BottomDock from './BottomDock';

export default function MobileLayout({ children, showBottomDock = true }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Listen for theme changes
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

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

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
          : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
      }`}
      style={{
        paddingBottom: showBottomDock
          ? 'calc(env(safe-area-inset-bottom) + 100px)'
          : 'env(safe-area-inset-bottom)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Main Content */}
      <main className="relative z-0">
        {children}
      </main>

      {/* Bottom Navigation Dock */}
      {showBottomDock && <BottomDock darkMode={darkMode} />}

      {/* Global Tap Effect Styles */}
      <style jsx global>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Smooth scrolling for iOS */
        html {
          -webkit-overflow-scrolling: touch;
        }

        /* Prevent horizontal scroll */
        body {
          overflow-x: hidden;
        }

        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
