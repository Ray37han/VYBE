import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Modern Loading Spinner with Moon Knight Theme
 * Features:
 * - Animated crescent moon spinner
 * - Smooth pulsing effects
 * - Theme-aware colors
 * - Multiple size options
 */
export default function LoadingSpinner({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  showText = true 
}) {
  const { darkMode } = useContext(ThemeContext);

  // Size configurations
  const sizes = {
    small: {
      spinner: 'w-8 h-8',
      text: 'text-sm',
      gap: 'gap-2'
    },
    medium: {
      spinner: 'w-16 h-16',
      text: 'text-base',
      gap: 'gap-3'
    },
    large: {
      spinner: 'w-24 h-24',
      text: 'text-xl',
      gap: 'gap-4'
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  // Container classes
  const containerClasses = fullScreen
    ? `fixed inset-0 flex items-center justify-center z-50 ${
        darkMode ? 'bg-moon-night/95' : 'bg-white/95'
      } backdrop-blur-sm`
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className={`flex flex-col items-center ${sizeConfig.gap}`}>
        {/* Animated Moon Spinner */}
        <div className="relative">
          {/* Outer rotating circle */}
          <motion.div
            className={`${sizeConfig.spinner} rounded-full border-4 ${
              darkMode
                ? 'border-moon-gold/20 border-t-moon-gold'
                : 'border-purple-200 border-t-purple-600'
            }`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Inner pulsing circle */}
          <motion.div
            className={`absolute inset-0 m-auto ${
              size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8'
            } rounded-full ${
              darkMode
                ? 'bg-moon-gold/30'
                : 'bg-purple-400/30'
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Center glow */}
          <motion.div
            className={`absolute inset-0 m-auto ${
              size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-6 h-6' : 'w-4 h-4'
            } rounded-full ${
              darkMode
                ? 'bg-moon-gold shadow-[0_0_20px_rgba(218,165,32,0.5)]'
                : 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.5)]'
            }`}
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        {/* Loading Text */}
        {showText && (
          <motion.p
            className={`${sizeConfig.text} font-medium ${
              darkMode ? 'text-moon-silver' : 'text-gray-700'
            }`}
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {text}
          </motion.p>
        )}

        {/* Animated dots */}
        {showText && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  darkMode ? 'bg-moon-gold' : 'bg-purple-600'
                }`}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Full Page Loading Screen
 * Use this for page transitions and initial loads
 */
export function FullPageLoader({ text = 'Loading...' }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        darkMode
          ? 'bg-gradient-to-br from-moon-night via-moon-midnight to-moon-night'
          : 'bg-gradient-to-br from-white via-purple-50 to-white'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 ${
          darkMode ? 'bg-[radial-gradient(circle_at_50%_50%,_rgba(218,165,32,0.1)_1px,_transparent_1px)]' : 'bg-[radial-gradient(circle_at_50%_50%,_rgba(147,51,234,0.1)_1px,_transparent_1px)]'
        } bg-[length:24px_24px]`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <LoadingSpinner size="large" text={text} showText={true} />
      </div>

      {/* Brand Name */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className={`text-4xl font-bold ${
          darkMode
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-moon-gold via-moon-mystical to-moon-gold'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600'
        }`}>
          VYBE
        </h1>
        <p className={`text-sm mt-2 ${
          darkMode ? 'text-moon-silver/60' : 'text-gray-500'
        }`}>
          Knight Warriors Collection
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Button Loading Spinner
 * Use inside buttons during form submissions
 */
export function ButtonSpinner({ darkMode, size = 'small' }) {
  const spinnerSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <motion.div
      className={`${spinnerSize} rounded-full border-2 ${
        darkMode
          ? 'border-moon-night/30 border-t-moon-night'
          : 'border-white/30 border-t-white'
      }`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}

/**
 * Card Loading Placeholder
 * Use for lazy-loaded content cards
 */
export function CardLoader({ darkMode }) {
  return (
    <div className={`p-6 rounded-2xl ${
      darkMode ? 'bg-moon-midnight/50' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="medium" text="Loading content..." showText={true} />
      </div>
    </div>
  );
}

/**
 * Inline Loading Spinner
 * Use for small inline loading states
 */
export function InlineSpinner({ darkMode, text = '' }) {
  return (
    <div className="inline-flex items-center gap-2">
      <motion.div
        className={`w-4 h-4 rounded-full border-2 ${
          darkMode
            ? 'border-moon-gold/30 border-t-moon-gold'
            : 'border-purple-200 border-t-purple-600'
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <span className={`text-sm ${
          darkMode ? 'text-moon-silver' : 'text-gray-600'
        }`}>
          {text}
        </span>
      )}
    </div>
  );
}
