import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Modern Loading Spinner with +/- Signs Animation
 * Features:
 * - Animated +/- signs moving left to right
 * - Random vertical positions
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
      container: 'w-24 h-8',
      fontSize: 'text-xl',
      text: 'text-sm',
      gap: 'gap-2'
    },
    medium: {
      container: 'w-32 h-12',
      fontSize: 'text-3xl',
      text: 'text-base',
      gap: 'gap-3'
    },
    large: {
      container: 'w-40 h-16',
      fontSize: 'text-5xl',
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

  // Random +/- signs with different speeds and positions
  const signs = [
    { symbol: '+', delay: 0, duration: 2, y: -8 },
    { symbol: '-', delay: 0.2, duration: 2.3, y: 8 },
    { symbol: '+', delay: 0.4, duration: 1.8, y: -15 },
    { symbol: '-', delay: 0.6, duration: 2.1, y: 12 },
    { symbol: '+', delay: 0.8, duration: 1.9, y: -5 },
    { symbol: '-', delay: 1.0, duration: 2.2, y: 15 },
    { symbol: '+', delay: 1.2, duration: 2.0, y: -12 },
    { symbol: '-', delay: 1.4, duration: 1.85, y: 5 },
  ];

  const colors = {
    primary: darkMode ? '#DAA520' : '#9333EA',
    secondary: darkMode ? '#FFD700' : '#7C3AED'
  };

  return (
    <div className={containerClasses}>
      <div className={`flex flex-col items-center ${sizeConfig.gap}`}>
        {/* Animated +/- Signs Moving Left to Right */}
        <div className={`relative ${sizeConfig.container} overflow-hidden`}>
          {signs.map((sign, index) => (
            <motion.div
              key={index}
              className={`absolute ${sizeConfig.fontSize} font-bold`}
              style={{
                color: index % 2 === 0 ? colors.primary : colors.secondary,
                textShadow: `0 0 15px ${index % 2 === 0 ? colors.primary : colors.secondary}`,
                top: `calc(50% + ${sign.y}px)`,
                transform: 'translateY(-50%)',
                left: 0,
              }}
              initial={{ x: -30, opacity: 0 }}
              animate={{
                x: ['-30px', '150px'],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: sign.duration,
                delay: sign.delay,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 0
              }}
            >
              {sign.symbol}
            </motion.div>
          ))}
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
  const config = {
    small: { container: 'w-12 h-4', fontSize: 'text-sm' },
    medium: { container: 'w-16 h-5', fontSize: 'text-base' }
  };
  
  const sizeConfig = config[size] || config.small;
  
  const signs = [
    { symbol: '+', delay: 0, duration: 1.5, y: -3 },
    { symbol: '-', delay: 0.3, duration: 1.6, y: 3 },
    { symbol: '+', delay: 0.6, duration: 1.4, y: -2 },
  ];

  const color = darkMode ? '#1F2937' : '#FFFFFF';
  
  return (
    <div className={`relative ${sizeConfig.container} overflow-hidden inline-block`}>
      {signs.map((sign, index) => (
        <motion.div
          key={index}
          className={`absolute ${sizeConfig.fontSize} font-bold`}
          style={{
            color: color,
            textShadow: `0 0 8px ${color}`,
            top: `calc(50% + ${sign.y}px)`,
            transform: 'translateY(-50%)',
            left: 0,
          }}
          initial={{ x: -20, opacity: 0 }}
          animate={{
            x: ['-20px', '60px'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: sign.duration,
            delay: sign.delay,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0
          }}
        >
          {sign.symbol}
        </motion.div>
      ))}
    </div>
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
  const signs = [
    { symbol: '+', delay: 0, duration: 1.5, y: -2 },
    { symbol: '-', delay: 0.25, duration: 1.6, y: 2 },
    { symbol: '+', delay: 0.5, duration: 1.4, y: -1 },
  ];

  const color = darkMode ? '#DAA520' : '#9333EA';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative w-10 h-4 overflow-hidden">
        {signs.map((sign, index) => (
          <motion.div
            key={index}
            className="absolute text-sm font-bold"
            style={{
              color: color,
              textShadow: `0 0 8px ${color}`,
              top: `calc(50% + ${sign.y}px)`,
              transform: 'translateY(-50%)',
              left: 0,
            }}
            initial={{ x: -15, opacity: 0 }}
            animate={{
              x: ['-15px', '45px'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: sign.duration,
              delay: sign.delay,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0
            }}
          >
            {sign.symbol}
          </motion.div>
        ))}
      </div>
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
