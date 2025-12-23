import { useState, useEffect } from 'react';

/**
 * usePageLoad Hook - Staggered Load Strategy
 * 
 * Purpose: Prevent jank by ensuring React Hydration completes BEFORE animations start.
 * 
 * How it works:
 * 1. Waits for window.onload (all resources loaded, including images/fonts)
 * 2. Adds 500ms safety delay for React Hydration to fully complete
 * 3. Returns true only when safe to start animating
 * 
 * Why 500ms?
 * - React Hydration typically takes 200-400ms on low-end devices
 * - 500ms ensures even slow devices are ready
 * - Main thread is completely free before animations begin
 * 
 * Usage:
 * const isLoaded = usePageLoad();
 * if (!isLoaded) return <div className="opacity-0">Loading...</div>;
 * return <motion.div animate={{ opacity: 1 }}>Content</motion.div>;
 */
export function usePageLoad(safetyDelayMs = 500) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Flag to track if component is still mounted
    let isMounted = true;

    // Handler for when page is fully loaded
    const handleLoad = () => {
      // Add safety delay AFTER window.onload
      setTimeout(() => {
        if (isMounted) {
          setIsLoaded(true);
          
          // Optional: Log performance metrics
          if (window.performance && process.env.NODE_ENV === 'development') {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('🎯 Page Load Complete:', {
              domContentLoaded: Math.round(perfData.domContentLoadedEventEnd),
              loadComplete: Math.round(perfData.loadEventEnd),
              safetyDelay: safetyDelayMs,
              animationsReady: true,
            });
          }
        }
      }, safetyDelayMs);
    };

    // Check if page is already loaded (for client-side navigation)
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('load', handleLoad);
    };
  }, [safetyDelayMs]);

  return isLoaded;
}

/**
 * useDelayedLoad Hook - For component-specific delays
 * 
 * Purpose: Stagger animations for different components to prevent simultaneous GPU load
 * 
 * Usage:
 * const isLoaded = useDelayedLoad(800); // Wait 800ms after page load
 */
export function useDelayedLoad(additionalDelayMs = 0) {
  const isPageLoaded = usePageLoad();
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (!isPageLoaded || additionalDelayMs === 0) {
      setIsDelayed(isPageLoaded);
      return;
    }

    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, additionalDelayMs);

    return () => clearTimeout(timer);
  }, [isPageLoaded, additionalDelayMs]);

  return additionalDelayMs === 0 ? isPageLoaded : isDelayed;
}
