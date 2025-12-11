import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ClayInput - Deeply recessed input fields with Clay UI aesthetic
 * 
 * @param {object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {ReactNode} props.leftIcon - Icon on left side
 * @param {ReactNode} props.rightIcon - Icon on right side
 * @param {boolean} props.disabled - Disabled state
 */
const ClayInput = forwardRef(({ 
  label = '',
  error = '',
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  
  // Base input classes with recessed shadow
  const inputClasses = `
    w-full px-4 py-3
    bg-clay-50 dark:bg-clay-900
    text-slate-700 dark:text-slate-200
    rounded-[20px]
    shadow-clay-recessed dark:shadow-clay-recessed-dark
    border-2 border-transparent
    focus:border-purple-400 dark:focus:border-purple-500
    focus:outline-none
    transition-all duration-200
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon ? 'pr-12' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${error ? 'border-red-400 dark:border-red-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <motion.input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

ClayInput.displayName = 'ClayInput';

export default ClayInput;
