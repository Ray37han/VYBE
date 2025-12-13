import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ClayCard - The foundational Clay UI container (Mobile Optimized for 60FPS)
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
  
  // Mobile-optimized shadow mapping (lighter shadows on mobile)
  const shadowClasses = {
    sm: 'shadow-clay-mobile md:shadow-clay-sm dark:shadow-clay-mobile-dark md:dark:shadow-clay-dark-sm',
    md: 'shadow-clay-mobile md:shadow-clay-md dark:shadow-clay-mobile-dark md:dark:shadow-clay-dark-md',
    lg: 'shadow-clay-mobile-lg md:shadow-clay-lg dark:shadow-clay-mobile-dark md:dark:shadow-clay-dark-lg',
  };

  // Base classes for Clay aesthetic with GPU acceleration
  const baseClasses = `
    bg-clay-100 dark:bg-clay-800
    rounded-[32px]
    transition-all duration-300 ease-out
    will-change-transform transform-gpu
    clay-optimized
    ${shadowClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Motion variants for interaction (transform-only for performance)
  const motionProps = {};
  
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
