/**
 * usePageRefreshProtection Hook
 * 
 * Protects against data loss during page refresh
 * Warns users if they try to refresh during critical operations
 * Saves and restores state across refreshes
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to protect against page refresh during sensitive operations
 * 
 * @param {boolean} isActive - Whether protection is currently needed
 * @param {string} warningMessage - Message to show on refresh attempt
 * @param {Function} onBeforeUnload - Optional callback before page unload
 * 
 * @returns {Object} { saveState, restoreState, clearState }
 * 
 * @example
 * ```jsx
 * const { saveState, restoreState } = usePageRefreshProtection(
 *   isVerifying,
 *   'Are you sure? Your verification will be lost.'
 * );
 * 
 * // Save critical data
 * saveState('checkout', { phone, items });
 * 
 * // Restore on mount
 * const savedData = restoreState('checkout');
 * ```
 */
export function usePageRefreshProtection(
  isActive = false,
  warningMessage = 'Are you sure you want to leave? Your progress will be lost.',
  onBeforeUnload = null
) {
  const isActiveRef = useRef(isActive);
  
  // Update ref when isActive changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Handle beforeunload event
  const handleBeforeUnload = useCallback((e) => {
    if (isActiveRef.current) {
      // Call custom callback if provided
      if (onBeforeUnload) {
        onBeforeUnload();
      }

      // Standard way to show confirmation dialog
      e.preventDefault();
      e.returnValue = warningMessage;
      return warningMessage;
    }
  }, [warningMessage, onBeforeUnload]);

  // Add/remove event listener
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // State management functions
  const saveState = useCallback((key, data) => {
    try {
      const stateData = {
        ...data,
        timestamp: Date.now(),
        version: '1.0'
      };
      sessionStorage.setItem(`vybe_${key}`, JSON.stringify(stateData));
      console.log(`💾 Saved state: ${key}`);
    } catch (error) {
      console.error('❌ Failed to save state:', error);
    }
  }, []);

  const restoreState = useCallback((key, maxAge = 5 * 60 * 1000) => {
    try {
      const stored = sessionStorage.getItem(`vybe_${key}`);
      if (!stored) {
        console.log(`📭 No saved state found: ${key}`);
        return null;
      }

      const data = JSON.parse(stored);
      const age = Date.now() - data.timestamp;

      // Check if data is stale
      if (age > maxAge) {
        console.log(`⏰ Saved state expired: ${key} (${Math.round(age / 1000)}s old)`);
        sessionStorage.removeItem(`vybe_${key}`);
        return null;
      }

      console.log(`📦 Restored state: ${key} (${Math.round(age / 1000)}s old)`);
      return data;
    } catch (error) {
      console.error('❌ Failed to restore state:', error);
      return null;
    }
  }, []);

  const clearState = useCallback((key) => {
    try {
      sessionStorage.removeItem(`vybe_${key}`);
      console.log(`🗑️ Cleared state: ${key}`);
    } catch (error) {
      console.error('❌ Failed to clear state:', error);
    }
  }, []);

  return {
    saveState,
    restoreState,
    clearState
  };
}

/**
 * Hook for auto-saving form data
 * Automatically saves form data on changes and restores on mount
 * 
 * @param {string} key - Storage key for the form
 * @param {Object} formData - Current form data
 * @param {Function} setFormData - Function to update form data
 * @param {boolean} enabled - Whether auto-save is enabled
 * 
 * @example
 * ```jsx
 * const [formData, setFormData] = useState({});
 * 
 * useAutoSaveForm('checkout-form', formData, setFormData, true);
 * // Form data is automatically saved and restored
 * ```
 */
export function useAutoSaveForm(key, formData, setFormData, enabled = true) {
  const { saveState, restoreState, clearState } = usePageRefreshProtection(false);
  const isInitialMount = useRef(true);

  // Restore on mount
  useEffect(() => {
    if (enabled && isInitialMount.current) {
      const restored = restoreState(key);
      if (restored && setFormData) {
        console.log('🔄 Auto-restoring form data...');
        setFormData(restored);
      }
      isInitialMount.current = false;
    }
  }, [key, enabled, restoreState, setFormData]);

  // Auto-save on changes
  useEffect(() => {
    if (enabled && !isInitialMount.current && formData) {
      // Debounce saves to avoid too many writes
      const timeoutId = setTimeout(() => {
        saveState(key, formData);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [key, formData, enabled, saveState]);

  // Clear on unmount if needed
  useEffect(() => {
    return () => {
      if (enabled) {
        // Optional: clear saved data on unmount
        // clearState(key);
      }
    };
  }, []);

  return { clearState };
}

/**
 * Hook to detect when user navigates away
 * Useful for cleaning up or saving state
 * 
 * @param {Function} callback - Function to call on navigation
 * 
 * @example
 * ```jsx
 * useNavigationDetection(() => {
 *   console.log('User is leaving the page');
 *   // Save critical data or clean up
 * });
 * ```
 */
export function useNavigationDetection(callback) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        callback();
      }
    };

    const handlePageHide = () => {
      callback();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', handlePageHide);
    };
  }, [callback]);
}

export default {
  usePageRefreshProtection,
  useAutoSaveForm,
  useNavigationDetection
};
