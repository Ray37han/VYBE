import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ClayButton - Tactile, high-contrast buttons with Clay UI aesthetic
 * 
 * @param {object} props
 * @param {('primary'|'secondary'|'ghost')} props.variant - Button style variant
 * @param {('sm'|'md'|'lg')} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 * @param {ReactNode} props.children - Button content
 * @param {ReactNode} props.icon - Optional icon element
 */
const ClayButton = forwardRef(({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  children,
  icon = null,
  className = '',
  ...props 
}, ref) => {
  
  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-[20px]',
    md: 'px-6 py-3 text-base rounded-[24px]',
    lg: 'px-8 py-4 text-lg rounded-[28px]',
  };

  // Variant styles
  const variantClasses = {
    primary: `
      bg-gradient-to-br from-purple-500 to-pink-500
      text-white font-semibold
      shadow-clay-md dark:shadow-clay-dark-md
      hover:shadow-clay-lg hover:dark:shadow-clay-dark-lg
      hover:from-purple-600 hover:to-pink-600
      active:shadow-clay-sm active:dark:shadow-clay-dark-sm
    `,
    secondary: `
      bg-clay-100 dark:bg-clay-700
      text-slate-700 dark:text-slate-200 font-semibold
      shadow-clay-md dark:shadow-clay-dark-md
      hover:shadow-clay-lg hover:dark:shadow-clay-dark-lg
      active:shadow-clay-sm active:dark:shadow-clay-dark-sm
      border-2 border-clay-300 dark:border-clay-600
    `,
    ghost: `
      bg-transparent
      text-slate-700 dark:text-slate-200 font-medium
      hover:bg-clay-200 dark:hover:bg-clay-700
      active:bg-clay-300 dark:active:bg-clay-600
      rounded-[20px]
    `,
  };

  // Disabled styles
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    transition-all duration-200 ease-out
    clay-optimized
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabledClasses}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
});

ClayButton.displayName = 'ClayButton';

export default ClayButton;
