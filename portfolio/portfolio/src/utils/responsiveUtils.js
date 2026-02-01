/**
 * Responsive Utility Functions
 * Helper functions for device detection and responsive calculations
 */

/**
 * Get device type based on window width
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Get responsive card width based on device type
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @param {number} containerWidth - Container width in pixels
 * @param {Object} cardRef - React ref to card element (optional)
 * @returns {number} Card width in pixels (including gap for scroll calculation)
 */
export const getResponsiveCardWidth = (deviceType, containerWidth = null, cardRef = null) => {
  if (typeof window === 'undefined') {
    return deviceType === 'mobile' ? 320 : 400;
  }

  const actualWidth = window.innerWidth;
  
  switch (deviceType) {
    case 'mobile':
      // Mobile: full viewport width minus section padding (px-4 = 1rem each side = 2rem total)
      // The card itself uses calc(100vw - 2rem) which accounts for section padding
      // For scroll calculation, we need card width + gap
      if (cardRef?.current) {
        const cardElement = cardRef.current;
        const cardWidth = cardElement.offsetWidth;
        const gap = getResponsiveGap(deviceType);
        return cardWidth + gap;
      }
      // Section has px-4 (1rem = 16px each side), so card is calc(100vw - 2rem)
      // For scroll, we need: (viewport width - 2rem) + gap
      return (actualWidth - 32) + getResponsiveGap(deviceType);
    
    case 'tablet':
      // Tablet: half screen or max 400px
      const tabletMax = 400;
      const tabletCardWidth = Math.min(tabletMax, (actualWidth - 64) / 2);
      return Math.max(320, tabletCardWidth) + getResponsiveGap(deviceType);
    
    case 'desktop':
    default:
      // Desktop: fixed 400px + gap
      return 400 + getResponsiveGap(deviceType);
  }
};

/**
 * Get responsive gap value based on device type
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @returns {number} Gap in pixels
 */
export const getResponsiveGap = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return 16; // gap-4 = 1rem = 16px
    case 'tablet':
      return 20; // gap-5 = 1.25rem = 20px
    case 'desktop':
    default:
      return 24; // gap-6 = 1.5rem = 24px
  }
};

/**
 * Check if browser supports backdrop-filter
 * @returns {boolean} True if backdrop-filter is supported
 */
export const supportsBackdropFilter = () => {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
};

/**
 * Get device-aware blur value
 * @param {string} baseBlur - Base blur size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @returns {string} Blur value in pixels
 */
export const getDeviceAwareBlur = (baseBlur, deviceType) => {
  const blurMap = {
    xs: { mobile: '2px', tablet: '4px', desktop: '2px' },
    sm: { mobile: '6px', tablet: '8px', desktop: '10px' },
    md: { mobile: '8px', tablet: '12px', desktop: '12px' },
    lg: { mobile: '12px', tablet: '16px', desktop: '20px' },
    xl: { mobile: '16px', tablet: '24px', desktop: '32px' },
  };

  return blurMap[baseBlur]?.[deviceType] || blurMap[baseBlur]?.desktop || '12px';
};

/**
 * Get responsive scroll padding
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @returns {string} Scroll padding value
 */
export const getResponsiveScrollPadding = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return '1rem'; // 16px
    case 'tablet':
      return '1.5rem'; // 24px
    case 'desktop':
    default:
      return '2rem'; // 32px
  }
};

/**
 * Check if device is touch-enabled
 * @returns {boolean} True if device supports touch
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         navigator.msMaxTouchPoints > 0;
};

/**
 * Get mask-image fade width based on device type
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @returns {number} Fade width in pixels
 */
export const getMaskFadeWidth = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return 0; // No fade on mobile
    case 'tablet':
      return 60; // Smaller fade on tablet
    case 'desktop':
    default:
      return 80; // Full fade on desktop
  }
};
