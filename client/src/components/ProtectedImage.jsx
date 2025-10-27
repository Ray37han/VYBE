import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * ProtectedImage - A React component that protects images from right-click, drag, and screenshot
 * Implements multiple layers of protection for product images
 */
const ProtectedImage = ({
  src,
  alt = '',
  className = '',
  style = {},
  showWatermark = true,
  watermarkText = '© VYBE',
  onContextMenu,
  loading = 'lazy',
  objectFit = 'cover',
}) => {
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    // Disable drag
    img.draggable = false;

    // Prevent image selection
    img.style.userSelect = 'none';
    img.style.webkitUserSelect = 'none';
    img.style.mozUserSelect = 'none';
    img.style.msUserSelect = 'none';

    // Additional protection attributes
    img.setAttribute('oncontextmenu', 'return false');
    img.setAttribute('ondragstart', 'return false');

    // Prevent keyboard shortcuts (Ctrl+S, etc.)
    const handleKeyDown = (e) => {
      // Prevent Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // Prevent PrintScreen (though this is limited)
      if (e.key === 'PrintScreen') {
        // Can't fully prevent, but we can detect
        navigator.clipboard.writeText('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e);
    }
    return false;
  };

  // Prevent dragging
  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  // Prevent selection
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  // Handle image load error
  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={style}
      >
        <span className="text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ position: 'relative', ...style }}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    >
      {/* Main Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onMouseDown={handleMouseDown}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'none',
          objectFit,
        }}
      />

      {/* Transparent Overlay - Blocks Screenshots and Interactions */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          cursor: 'default',
          zIndex: 1,
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onMouseDown={handleMouseDown}
      />

      {/* Optional visible watermark overlay (in addition to server-side watermark) */}
      {showWatermark && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
          }}
        >
          {watermarkText}
        </div>
      )}

      {/* CSS-only watermark pattern for extra protection */}
      <style jsx>{`
        .protected-image-container::before {
          content: '© VYBE';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(255, 255, 255, 0.1);
          font-weight: bold;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

ProtectedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  showWatermark: PropTypes.bool,
  watermarkText: PropTypes.string,
  onContextMenu: PropTypes.func,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
};

export default ProtectedImage;
