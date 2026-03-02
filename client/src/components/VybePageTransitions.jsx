import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './PageTransitions.css';

const VybePageTransitions = ({ children, className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(location.pathname);
  const [animationType, setAnimationType] = useState(1);
  const pageRef = useRef(null);

  // Array of available transition effects
  const transitions = [
    { 
      id: 1, 
      name: 'Slide Left', 
      outClass: 'pt-page-moveToLeft', 
      inClass: 'pt-page-moveFromRight' 
    },
    { 
      id: 2, 
      name: 'Slide Right', 
      outClass: 'pt-page-moveToRight', 
      inClass: 'pt-page-moveFromLeft' 
    },
    { 
      id: 3, 
      name: 'Slide Up', 
      outClass: 'pt-page-moveToTop', 
      inClass: 'pt-page-moveFromBottom' 
    },
    { 
      id: 4, 
      name: 'Slide Down', 
      outClass: 'pt-page-moveToBottom', 
      inClass: 'pt-page-moveFromTop' 
    },
    { 
      id: 5, 
      name: 'Fade', 
      outClass: 'pt-page-fade', 
      inClass: 'pt-page-moveFromRight pt-page-ontop' 
    },
    { 
      id: 6, 
      name: 'Scale Down', 
      outClass: 'pt-page-scaleDown', 
      inClass: 'pt-page-moveFromRight pt-page-ontop' 
    },
    { 
      id: 7, 
      name: 'Scale Up', 
      outClass: 'pt-page-scaleDownCenter', 
      inClass: 'pt-page-scaleUpCenter pt-page-delay400' 
    },
    { 
      id: 8, 
      name: 'Flip Right', 
      outClass: 'pt-page-flipOutRight', 
      inClass: 'pt-page-flipInLeft pt-page-delay500' 
    },
    { 
      id: 9, 
      name: 'Flip Left', 
      outClass: 'pt-page-flipOutLeft', 
      inClass: 'pt-page-flipInRight pt-page-delay500' 
    },
    { 
      id: 10, 
      name: 'Flip Down', 
      outClass: 'pt-page-flipOutTop', 
      inClass: 'pt-page-flipInBottom pt-page-delay500' 
    },
    { 
      id: 11, 
      name: 'Cube Left', 
      outClass: 'pt-page-rotateCubeLeftOut pt-page-ontop', 
      inClass: 'pt-page-rotateCubeLeftIn' 
    },
    { 
      id: 12, 
      name: 'Cube Right', 
      outClass: 'pt-page-rotateCubeRightOut pt-page-ontop', 
      inClass: 'pt-page-rotateCubeRightIn' 
    },
    { 
      id: 13, 
      name: 'Cube Up', 
      outClass: 'pt-page-rotateCubeTopOut pt-page-ontop', 
      inClass: 'pt-page-rotateCubeTopIn' 
    },
    { 
      id: 14, 
      name: 'Cube Down', 
      outClass: 'pt-page-rotateCubeBottomOut pt-page-ontop', 
      inClass: 'pt-page-rotateCubeBottomIn' 
    },
    { 
      id: 15, 
      name: 'Carousel Left', 
      outClass: 'pt-page-rotateCarouselLeftOut pt-page-ontop', 
      inClass: 'pt-page-rotateCarouselLeftIn' 
    },
    { 
      id: 16, 
      name: 'Carousel Right', 
      outClass: 'pt-page-rotateCarouselRightOut pt-page-ontop', 
      inClass: 'pt-page-rotateCarouselRightIn' 
    },
    { 
      id: 17, 
      name: 'Fall', 
      outClass: 'pt-page-rotateFall pt-page-ontop', 
      inClass: 'pt-page-scaleUp' 
    },
    { 
      id: 18, 
      name: 'Newspaper', 
      outClass: 'pt-page-rotateOutNewspaper', 
      inClass: 'pt-page-rotateInNewspaper pt-page-delay500' 
    },
    { 
      id: 19, 
      name: 'Push Left', 
      outClass: 'pt-page-rotatePushLeft', 
      inClass: 'pt-page-moveFromRight' 
    },
    { 
      id: 20, 
      name: 'Push Right', 
      outClass: 'pt-page-rotatePushRight', 
      inClass: 'pt-page-moveFromLeft' 
    }
  ];

  // Choose transition based on route
  const getTransitionType = (fromPath, toPath) => {
    const routeTransitions = {
      '/': { home: true, type: 1 }, // Slide left for home
      '/products': { type: Math.random() > 0.5 ? 11 : 12 }, // Cube transitions
      '/about': { type: 5 }, // Fade
      '/contact': { type: 8 }, // Flip
      '/cart': { type: 15 }, // Carousel
      '/login': { type: 6 }, // Scale
      '/register': { type: 7 }, // Scale up
    };

    // Get transition for current route or random
    const transition = routeTransitions[toPath] || { type: Math.floor(Math.random() * transitions.length) + 1 };
    return transition.type;
  };

  // Handle route changes
  useEffect(() => {
    if (location.pathname !== currentPage) {
      const newTransition = getTransitionType(currentPage, location.pathname);
      setAnimationType(newTransition);
      setCurrentPage(location.pathname);
    }
  }, [location.pathname, currentPage]);

  // Get current transition
  const currentTransition = transitions.find(t => t.id === animationType) || transitions[0];

  return (
    <div className="pt-perspective">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className={`pt-page pt-page-current ${className}`}
          ref={pageRef}
          initial={{ 
            opacity: 0,
            transform: getInitialTransform(currentTransition.inClass)
          }}
          animate={{ 
            opacity: 1,
            transform: 'translate3d(0, 0, 0) scale(1) rotateX(0) rotateY(0) rotateZ(0)'
          }}
          exit={{ 
            opacity: getExitOpacity(currentTransition.outClass),
            transform: getExitTransform(currentTransition.outClass)
          }}
          transition={{
            duration: getDuration(currentTransition.outClass),
            ease: getEasing(currentTransition.outClass)
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Helper functions for transition values
const getInitialTransform = (inClass) => {
  if (inClass.includes('moveFromLeft')) return 'translateX(-100%)';
  if (inClass.includes('moveFromRight')) return 'translateX(100%)';
  if (inClass.includes('moveFromTop')) return 'translateY(-100%)';
  if (inClass.includes('moveFromBottom')) return 'translateY(100%)';
  if (inClass.includes('scaleUp')) return 'scale(0.8)';
  if (inClass.includes('flipIn')) return 'translateZ(-1000px) rotateY(-90deg)';
  if (inClass.includes('rotateCube')) return 'translateX(100%) rotateY(90deg)';
  if (inClass.includes('rotateCarousel')) return 'translateX(200%) scale(0.4) rotateY(65deg)';
  return 'translate3d(0, 0, 0)';
};

const getExitTransform = (outClass) => {
  if (outClass.includes('moveToLeft')) return 'translateX(-100%)';
  if (outClass.includes('moveToRight')) return 'translateX(100%)';
  if (outClass.includes('moveToTop')) return 'translateY(-100%)';
  if (outClass.includes('moveToBottom')) return 'translateY(100%)';
  if (outClass.includes('scaleDown')) return 'scale(0.8)';
  if (outClass.includes('flipOut')) return 'translateZ(-1000px) rotateY(90deg)';
  if (outClass.includes('rotateCube')) return 'translateX(-100%) rotateY(-90deg)';
  if (outClass.includes('rotateCarousel')) return 'translateX(-150%) scale(0.4) rotateY(-65deg)';
  if (outClass.includes('rotateFall')) return 'translateY(100%) rotateZ(17deg)';
  if (outClass.includes('rotateOutNewspaper')) return 'translateZ(-3000px) rotateZ(360deg)';
  return 'translate3d(0, 0, 0)';
};

const getExitOpacity = (outClass) => {
  if (outClass.includes('fade') || outClass.includes('scale') || outClass.includes('flip')) return 0.3;
  if (outClass.includes('rotateOut') || outClass.includes('rotateFall')) return 0;
  return 1;
};

const getDuration = (outClass) => {
  if (outClass.includes('flip') || outClass.includes('newspaper')) return 0.5;
  if (outClass.includes('cube')) return 0.6;
  if (outClass.includes('carousel') || outClass.includes('push')) return 0.8;
  if (outClass.includes('fall')) return 1;
  return 0.7;
};

const getEasing = (outClass) => {
  if (outClass.includes('cube') || outClass.includes('flip')) return 'easeIn';
  if (outClass.includes('scale')) return 'easeOut';
  if (outClass.includes('fall')) return 'easeIn';
  return 'easeInOut';
};

// Higher Order Component for pages
export const withVybeTransition = (Component, transitionType = null) => {
  return (props) => (
    <VybePageTransitions className="min-h-screen">
      <Component {...props} />
    </VybePageTransitions>
  );
};

// Hook for manual transitions
export const useVybeTransition = () => {
  const navigate = useNavigate();
  
  const transitionTo = (path, transitionType = null) => {
    if (transitionType) {
      // Store transition type in sessionStorage for next render
      sessionStorage.setItem('nextTransition', transitionType.toString());
    }
    navigate(path);
  };

  return { transitionTo };
};

export default VybePageTransitions;