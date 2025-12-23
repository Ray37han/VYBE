import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ClayCard - Safari-Optimized Clay UI Container (60FPS Guaranteed)
 * 
 * SAFARI OPTIMIZATIONS APPLIED:
 * 1. No backdrop-filter (solid backgrounds only)
 * 2. Simplified shadows on mobile (shadow-clay-lite)
 * 3. GPU acceleration enforced with .gpu-safe
 * 4. No layout-shifting animations
 * 5. Transform-only interactions (whileHover/whileTap)
 * 
 * @param {object} props
 * @param {('sm'|'md'|'lg')} props.size - Shadow depth variant
 * @param {boolean} props.hoverable - Enable hover lift effect
 * @param {boolean} props.clickable - Enable click/tap effect
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Card content
 */
const ClayCard = forwardRef(({ 
  size = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  children,
  ...props 
}, ref) => {
  
  // Safari-safe shadow mapping (lite on mobile, full on desktop)
  const shadowClasses = {
    sm: 'shadow-clay-lite md:shadow-clay-full',
    md: 'shadow-clay-lite md:shadow-clay-full',
    lg: 'shadow-clay-lite md:shadow-clay-full',
  };

  // Base classes with Safari GPU forcing
  const baseClasses = `
    bg-clay-100 dark:bg-clay-800
    rounded-[32px]
    transition-all duration-300 ease-out
    gpu-safe
    clay-optimized
    ${shadowClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Motion variants - TRANSFORM ONLY (no width/height/padding)
  const motionProps = {
    style: {
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      willChange: 'transform',
    }
  };
  
  if (hoverable) {
    motionProps.whileHover = { 
      y: -4,
      transition: { duration: 0.2, ease: 'easeOut' } 
    };
  }
  
  if (clickable) {
    motionProps.whileTap = { 
      scale: 0.96,
      transition: { duration: 0.1, ease: 'easeOut' } 
    };
  }

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
});

ClayCard.displayName = 'ClayCard';

export default ClayCard;
