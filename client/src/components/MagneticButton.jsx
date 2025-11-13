import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticButton Component
 * 
 * A button that "magnetically" follows the cursor when you hover near it.
 * Perfect for secondary CTAs like "View Details" or "Filter"
 * 
 * Usage:
 * <MagneticButton onClick={handleClick} className="btn-secondary">
 *   View Details
 * </MagneticButton>
 */
const MagneticButton = ({ 
  children, 
  onClick, 
  className = '', 
  strength = 0.4, // How much the button moves (0-1)
  ...props 
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Apply magnetic effect with strength multiplier
    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });
  };

  const handleMouseLeave = () => {
    // Reset position smoothly
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
