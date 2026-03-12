import { useNavigate } from 'react-router-dom';
import './PageTransitions.css';

const VybePageTransitions = ({ children, className = '' }) => {
  // Reliability-first: disable animated route transitions to avoid blank screens
  // during rapid route changes with query params (e.g. Buy Now -> quick-checkout).
  return <div className={`pt-perspective ${className}`}>{children}</div>;
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