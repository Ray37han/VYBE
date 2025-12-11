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
      size: 'w-6 h-6'
    },
    { 
      path: '/products', 
      icon: FiSearch, 
      label: 'Search',
      size: 'w-6 h-6'
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
      size: 'w-6 h-6',
      badge: items.length
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl border ${
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
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className="relative mx-2"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 30px rgba(236, 72, 153, 0.6)',
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center"
                    style={{
                      boxShadow: `
                        inset 2px 2px 6px rgba(255, 255, 255, 0.3),
                        inset -2px -2px 6px rgba(0, 0, 0, 0.2),
                        0 8px 25px rgba(168, 85, 247, 0.5)
                      `,
                    }}
                  >
                    {/* Custom Icon */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <svg 
                        className="w-8 h-8 text-white" 
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
                    </motion.div>

                    {/* Pulsing Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          }

          // Regular Navigation Items
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.path)}
                className="relative"
              >
                <div
                  className={`p-3 rounded-full transition-all duration-300 ${
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center"
                      style={{
                        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)',
                      }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
