import { useEffect } from 'react';

/**
 * Custom hook to add global image protection
 * Prevents right-click, drag, and keyboard shortcuts on all images
 */
export const useImageProtection = (options = {}) => {
  const {
    preventRightClick = true,
    preventDrag = true,
    preventKeyboardShortcuts = true,
    preventDevTools = false,
    showWarning = true,
  } = options;

  useEffect(() => {
    // Prevent right-click on images
    const handleContextMenu = (e) => {
      if (preventRightClick && e.target.tagName === 'IMG') {
        e.preventDefault();
        if (showWarning) {
          console.warn('Image protection: Right-click disabled');
        }
        return false;
      }
    };

    // Prevent dragging images
    const handleDragStart = (e) => {
      if (preventDrag && e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      if (!preventKeyboardShortcuts) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Prevent Ctrl+S (Save)
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        if (showWarning) {
          console.warn('Image protection: Save disabled');
        }
        return false;
      }

      // Prevent Ctrl+P (Print)
      if (ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (showWarning) {
          console.warn('Image protection: Print disabled');
        }
        return false;
      }

      // Prevent Ctrl+Shift+I (Developer Tools)
      if (preventDevTools && ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Prevent F12 (Developer Tools)
      if (preventDevTools && e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if (preventDevTools && ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // Disable text selection on images via CSS
    const style = document.createElement('style');
    style.innerHTML = `
      img {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, [preventRightClick, preventDrag, preventKeyboardShortcuts, preventDevTools, showWarning]);
};

/**
 * Hook to detect screenshot attempts (limited effectiveness)
 */
export const useScreenshotDetection = (callback) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - could be screenshot or screen recording
        if (callback) {
          callback('visibility_hidden');
        }
      }
    };

    const handleBlur = () => {
      // Window lost focus - could be screenshot
      if (callback) {
        callback('window_blur');
      }
    };

    // PrintScreen key detection (very limited)
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        if (callback) {
          callback('printscreen_detected');
        }
        // Clear clipboard as a countermeasure
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [callback]);
};

/**
 * Hook to add dynamic watermarks that change position
 */
export const useDynamicWatermark = (elementRef, text = '© VYBE', interval = 5000) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const positions = [
      { top: '10%', left: '10%' },
      { top: '10%', right: '10%' },
      { bottom: '10%', left: '10%' },
      { bottom: '10%', right: '10%' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    ];

    let currentIndex = 0;

    // Create watermark element
    const watermark = document.createElement('div');
    watermark.textContent = text;
    watermark.style.cssText = `
      position: absolute;
      color: rgba(255, 255, 255, 0.3);
      font-size: 16px;
      font-weight: bold;
      pointer-events: none;
      user-select: none;
      z-index: 1000;
      transition: all 1s ease;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    `;

    elementRef.current.style.position = 'relative';
    elementRef.current.appendChild(watermark);

    // Update position periodically
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % positions.length;
      const pos = positions[currentIndex];

      // Reset all position properties
      watermark.style.top = 'auto';
      watermark.style.right = 'auto';
      watermark.style.bottom = 'auto';
      watermark.style.left = 'auto';
      watermark.style.transform = '';

      // Apply new position
      Object.keys(pos).forEach((key) => {
        watermark.style[key] = pos[key];
      });
    }, interval);

    return () => {
      clearInterval(intervalId);
      if (elementRef.current && watermark.parentNode) {
        elementRef.current.removeChild(watermark);
      }
    };
  }, [elementRef, text, interval]);
};

export default useImageProtection;
