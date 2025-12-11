import { motion } from 'framer-motion';

/**
 * ClayWrapper - Higher Order Component for tactile Clay interactions
 * 
 * Wraps any element with standardized Clay UI interaction physics:
 * - Hover: Slight lift (y: -4px)
 * - Tap: Subtle scale down (scale: 0.96)
 * - GPU optimized for performance
 * 
 * @param {object} props
 * @param {boolean} props.enableHover - Enable hover lift effect (default: true)
 * @param {boolean} props.enableTap - Enable tap scale effect (default: true)
 * @param {number} props.hoverY - Custom hover Y offset (default: -4)
 * @param {number} props.tapScale - Custom tap scale (default: 0.96)
 * @param {ReactNode} props.children - Wrapped content
 */
export default function ClayWrapper({ 
  enableHover = true,
  enableTap = true,
  hoverY = -4,
  tapScale = 0.96,
  className = '',
  children,
  ...props 
}) {
  
  const motionProps = {};
  
  if (enableHover) {
    motionProps.whileHover = { 
      y: hoverY, 
      transition: { duration: 0.2, ease: 'easeOut' } 
    };
  }
  
  if (enableTap) {
    motionProps.whileTap = { 
      scale: tapScale, 
      transition: { duration: 0.1, ease: 'easeOut' } 
    };
  }

  return (
    <motion.div
      className={`clay-optimized ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Example Usage:
 * 
 * <ClayWrapper>
 *   <ClayCard>
 *     <h3>Interactive Card</h3>
 *     <p>This card will lift on hover and shrink on tap</p>
 *   </ClayCard>
 * </ClayWrapper>
 * 
 * // Custom interaction values:
 * <ClayWrapper hoverY={-8} tapScale={0.92}>
 *   <ClayButton>More dramatic effect</ClayButton>
 * </ClayWrapper>
 * 
 * // Disable specific interactions:
 * <ClayWrapper enableHover={false}>
 *   <div>Only tap effect, no hover</div>
 * </ClayWrapper>
 */
