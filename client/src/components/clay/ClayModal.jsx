import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/**
 * ClayModal - Floating dialog with extreme elevation
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {('sm'|'md'|'lg'|'xl')} props.size - Modal width
 * @param {boolean} props.showCloseButton - Show X button
 * @param {ReactNode} props.children - Modal content
 */
export default function ClayModal({ 
  isOpen = false,
  onClose = () => {},
  title = '',
  size = 'md',
  showCloseButton = true,
  children,
  className = '',
}) {
  
  // Size variants
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                w-full ${sizeClasses[size]} pointer-events-auto
                bg-clay-100 dark:bg-clay-800
                rounded-[32px]
                shadow-clay-float dark:shadow-clay-float-dark
                overflow-hidden
                ${className}
              `.trim().replace(/\s+/g, ' ')}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-clay-300 dark:border-clay-700">
                  {title && (
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="
                        p-2 rounded-full
                        bg-clay-200 dark:bg-clay-700
                        text-slate-600 dark:text-slate-300
                        hover:bg-clay-300 dark:hover:bg-clay-600
                        transition-colors duration-200
                      "
                      aria-label="Close modal"
                    >
                      <FiX className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
