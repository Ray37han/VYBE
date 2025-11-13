import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * 
 * Wraps page content to provide smooth transitions between routes.
 * Makes the site feel like a cohesive app rather than separate pages.
 * 
 * Usage in App.jsx:
 * <AnimatePresence mode="wait">
 *   <Routes location={location} key={location.pathname}>
 *     <Route path="/" element={<PageTransition><Home /></PageTransition>} />
 *     <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
 *   </Routes>
 * </AnimatePresence>
 */

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.6, 0.05, 0.01, 0.9],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScrollReveal Component
 * 
 * Reveals elements as user scrolls down the page.
 * Perfect for product cards, category titles, etc.
 * 
 * Usage:
 * <ScrollReveal>
 *   <ProductCard {...product} />
 * </ScrollReveal>
 */
export const ScrollReveal = ({ 
  children, 
  direction = 'up', // 'up', 'down', 'left', 'right', 'scale'
  delay = 0,
  className = '',
}) => {
  const directionVariants = {
    up: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  const selectedVariant = directionVariants[direction] || directionVariants.up;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={selectedVariant}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.6, 0.05, 0.01, 0.9],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerContainer Component
 * 
 * Staggers the animation of child elements for a cascading effect.
 * Perfect for product grids or lists.
 * 
 * Usage:
 * <StaggerContainer>
 *   {products.map((product, index) => (
 *     <StaggerItem key={product.id} index={index}>
 *       <ProductCard {...product} />
 *     </StaggerItem>
 *   ))}
 * </StaggerContainer>
 */
export const StaggerContainer = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.6, 0.05, 0.01, 0.9],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeInWhenVisible Component
 * 
 * Simple fade in animation when element becomes visible.
 * 
 * Usage:
 * <FadeInWhenVisible>
 *   <h1>Title</h1>
 * </FadeInWhenVisible>
 */
export const FadeInWhenVisible = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
