import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { useCartStore } from '../../store';

export default function BottomDock({ darkMode }) {
  const location = useLocation();
  const { items } = useCartStore();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const navItems = [
    { 
      path: '/', 
      icon: FiHome, 
      label: 'Home',
      size: 'w-5 h-5'
    },
    { 
      path: '/products', 
      icon: FiSearch, 
      label: 'Search',
      size: 'w-5 h-5'
    },
    { 
      path: '/customize', 
      icon: null, // Custom center button
      label: 'Customize',
      isCenter: true
    },
    { 
      path: '/cart', 
      icon: FiShoppingCart, 
      label: 'Cart',
      size: 'w-5 h-5',
      badge: items.length
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div
        className={`flex items-center gap-1 px-4 py-2.5 rounded-full backdrop-blur-xl border ${
          darkMode
            ? 'bg-gray-900/70 border-white/20'
            : 'bg-white/70 border-white/40'
        }`}
        style={{
          boxShadow: darkMode
            ? `
              inset 1px 1px 2px rgba(255, 255, 255, 0.1),
              inset -1px -1px 2px rgba(0, 0, 0, 0.3),
              0 10px 40px rgba(0, 0, 0, 0.6)
            `
            : `
              inset 1px 1px 2px rgba(255, 255, 255, 0.8),
              inset -1px -1px 2px rgba(0, 0, 0, 0.05),
              0 10px 40px rgba(147, 51, 234, 0.3)
            `,
        }}
      >
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          // Center Customize Button (Star of the Show)
          if (item.isCenter) {
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className="relative mx-2 active:scale-90 transition-transform"
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center"
                    style={{
                      boxShadow: `
                        inset 2px 2px 6px rgba(255, 255, 255, 0.3),
                        inset -2px -2px 6px rgba(0, 0, 0, 0.2),
                        0 8px 25px rgba(168, 85, 247, 0.5)
                      `,
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  >
                    {/* Custom Icon */}
                    <div>
                      <svg 
                        className="w-7 h-7 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2.5} 
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                    style={{
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  >
                    {item.label}
                  </motion.span>
                </div>
              </Link>
            );
          }

          // Regular Navigation Items
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <div
                onClick={() => setActiveTab(item.path)}
                className="relative active:scale-95 transition-transform"
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                }}
              >
                <div
                  className={`p-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? darkMode
                        ? 'bg-purple-500/20'
                        : 'bg-purple-500/10'
                      : ''
                  }`}
                >
                  <Icon
                    className={`${item.size} transition-colors duration-300 ${
                      isActive
                        ? 'text-purple-500'
                        : darkMode
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }`}
                  />

                  {/* Cart Badge */}
                  {item.badge > 0 && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center"
                      style={{
                        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)',
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                      }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
                      style={{
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
