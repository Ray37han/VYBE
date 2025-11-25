import { useEffect, useRef } from 'react';

/**
 * SpotlightContainer Component
 * 
 * Creates a gallery-like spotlight effect that follows the mouse cursor.
 * Perfect for product grids to highlight items as users explore.
 * 
 * Usage:
 * <SpotlightContainer>
 *   <div className="grid grid-cols-3 gap-6">
 *     {products.map(product => (
 *       <ProductCard key={product.id} {...product} />
 *     ))}
 *   </div>
 * </SpotlightContainer>
 */
const SpotlightContainer = ({ children, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = null;
    
    const handleMouseMove = (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Update CSS custom properties for the spotlight position
        container.style.setProperty('--mouse-x', `${x}%`);
        container.style.setProperty('--mouse-y', `${y}%`);
        
        rafId = null;
      });
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`spotlight-container ${className}`}
    >
      {children}
    </div>
  );
};

export default SpotlightContainer;
