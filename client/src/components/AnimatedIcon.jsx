import { motion } from 'framer-motion';

/**
 * AnimatedIcon Component
 * 
 * Provides delightful micro-interactions for icon buttons.
 * Each icon type has its own unique animation.
 * 
 * Usage:
 * <AnimatedIcon type="heart" className="w-6 h-6">
 *   <HeartIcon />
 * </AnimatedIcon>
 */
const AnimatedIcon = ({ 
  type = 'default', 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  // Define animation variants for different icon types
  const variants = {
    heart: {
      tap: { scale: [1, 1.3, 1.1, 1.25, 1] },
      hover: { scale: 1.1 },
    },
    cart: {
      tap: { 
        y: [0, -10, -5, -8, 0],
        rotate: [0, -5, 5, -2, 0],
      },
      hover: { scale: 1.1 },
    },
    menu: {
      tap: { rotate: 90 },
      hover: { scale: 1.1 },
    },
    default: {
      tap: { scale: 0.9 },
      hover: { scale: 1.1 },
    },
  };

  const selectedVariant = variants[type] || variants.default;

  return (
    <motion.div
      className={`btn-icon inline-flex items-center justify-center cursor-pointer ${className}`}
      whileHover="hover"
      whileTap="tap"
      variants={selectedVariant}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * HeartButton - Animated Wishlist Button
 */
export const HeartButton = ({ onClick, filled = false, className = '' }) => {
  return (
    <AnimatedIcon type="heart" onClick={onClick} className={className}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-6 h-6"
        initial={{ scale: 1 }}
        animate={{ scale: filled ? 1 : 1 }}
      >
        <motion.path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill={filled ? '#ec4899' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: 1,
            fill: filled ? '#ec4899' : 'none',
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
    </AnimatedIcon>
  );
};

/**
 * CartButton - Animated Shopping Cart Button
 */
export const CartButton = ({ onClick, itemCount = 0, className = '' }) => {
  return (
    <AnimatedIcon type="cart" onClick={onClick} className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {itemCount > 0 && (
        <motion.span
          className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {itemCount}
        </motion.span>
      )}
    </AnimatedIcon>
  );
};

/**
 * MenuButton - Animated Hamburger Menu (transforms to X)
 */
export const MenuButton = ({ onClick, isOpen = false, className = '' }) => {
  return (
    <AnimatedIcon type="menu" onClick={onClick} className={className}>
      <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
        <motion.span
          className="block h-0.5 w-6 bg-current"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-current"
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-current"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </AnimatedIcon>
  );
};

export default AnimatedIcon;
