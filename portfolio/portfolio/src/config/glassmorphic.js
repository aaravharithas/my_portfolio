/**
 * Centralized Glassmorphic Effects Configuration
 * All glassmorphic styling values for the portfolio application
 */

export const glassmorphic = {
  // Backdrop blur values - base values (device-aware variants available via responsiveUtils)
  blur: {
    xs: '2px',
    sm: '10px',
    md: '12px',
    lg: '20px',
    xl: '32px',
  },

  // Device-aware blur values for performance optimization
  blurDevice: {
    mobile: {
      xs: '2px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    tablet: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    },
    desktop: {
      xs: '2px',
      sm: '10px',
      md: '12px',
      lg: '20px',
      xl: '32px',
    },
  },

  // Background opacity values - enhanced for better readability in light mode
  background: {
    light: {
      base: 'rgba(255,255,255,0.9)',
      elevated: 'rgba(255,255,255,0.95)',
      card: 'rgba(248,248,250,0.8)', // Increased from 0.6 to 0.8 for better readability
      cardHover: 'rgba(252,252,253,0.85)', // Increased from 0.75 to 0.85
      button: 'rgba(255,255,255,0.9)',
      buttonHover: 'rgba(255,255,255,0.95)',
      form: 'rgba(255,255,255,0.8)', // Increased from 0.75 to 0.8
      navbar: 'rgba(255,255,255,0.8)', // Increased from 0.75 to 0.8
    },
    dark: {
      base: 'rgba(255,255,255,0.05)',
      elevated: 'rgba(255,255,255,0.1)',
      card: 'rgba(255,255,255,0.08)',
      cardHover: 'rgba(255,255,255,0.12)',
      button: 'rgba(255,255,255,0.1)',
      buttonHover: 'rgba(255,255,255,0.2)',
      form: 'rgba(255,255,255,0.1)',
      navbar: 'rgba(255,255,255,0.1)',
    },
  },

  // Border opacity values - enhanced visibility in light mode
  borders: {
    light: {
      base: 'rgba(150,150,150,0.65)', // Increased from 0.6 to 0.65
      elevated: 'rgba(120,120,120,0.75)', // Increased from 0.7 to 0.75
      card: 'rgba(200,200,200,0.75)', // Increased from 0.6 to 0.75 for better visibility
      button: 'rgba(180,180,180,0.75)', // Increased from 0.7 to 0.75
      form: 'rgba(180,180,180,0.6)', // Increased from 0.5 to 0.6
      navbar: 'rgba(150,150,150,0.65)', // Increased from 0.6 to 0.65
    },
    dark: {
      base: 'rgba(255,255,255,0.2)',
      elevated: 'rgba(255,255,255,0.3)',
      card: 'rgba(255,255,255,0.2)',
      button: 'rgba(255,255,255,0.3)',
      form: 'rgba(255,255,255,0.2)',
      navbar: 'rgba(255,255,255,0.2)',
    },
  },

  // Box shadow definitions - theme-specific for better depth perception
  shadows: {
    // Light mode shadows - darker for better contrast
    light: {
      glass: '0 4px 32px 0 rgba(0,0,0,0.12)',
      glassHover: '0 8px 40px 0 rgba(0,0,0,0.18)',
      button: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
      buttonHover: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
      card: '0 12px 40px 0 rgba(0,0,0,0.15)',
      navbar: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
    },
    // Dark mode shadows - keep existing (they work well)
    dark: {
      glass: '0 4px 32px 0 rgba(31, 38, 135, 0.15)',
      glassHover: '0 8px 40px 0 rgba(31, 38, 135, 0.2)',
      button: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
      buttonHover: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
      card: '0 12px 40px 0 rgba(31,38,135,0.2)',
      navbar: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    // Legacy support - default to dark mode shadows
    glass: '0 4px 32px 0 rgba(31, 38, 135, 0.15)',
    glassHover: '0 8px 40px 0 rgba(31, 38, 135, 0.2)',
    button: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
    buttonHover: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
    card: '0 12px 40px 0 rgba(31,38,135,0.2)',
    navbar: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
  },

  // Liquid glass gradient colors - theme-specific for better visibility
  liquidGlass: {
    colors: [
      'rgba(96,165,250,0.3)',
      'rgba(167,139,250,0.3)',
      'rgba(244,114,182,0.3)',
    ],
    colorsLight: [
      'rgba(96,165,250,0.2)',
      'rgba(167,139,250,0.2)',
      'rgba(244,114,182,0.2)',
    ],
    // Light mode gradients - higher opacity for better visibility
    gradientsLight: {
      gradient1: 'linear-gradient(135deg, rgba(96,165,250,0.4), rgba(167,139,250,0.4))',
      gradient2: 'linear-gradient(225deg, rgba(167,139,250,0.4), rgba(244,114,182,0.4))',
      gradient3: 'linear-gradient(315deg, rgba(244,114,182,0.4), rgba(96,165,250,0.4))',
    },
    // Dark mode gradients - keep existing
    gradients: {
      gradient1: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3))',
      gradient2: 'linear-gradient(225deg, rgba(167,139,250,0.3), rgba(244,114,182,0.3))',
      gradient3: 'linear-gradient(315deg, rgba(244,114,182,0.3), rgba(96,165,250,0.3))',
    },
  },

  // Hover effect configurations
  hover: {
    scale: 1.05,
    blur: {
      default: '2px',
      hover: '12px',
    },
    // Device-aware hover blur
    blurDevice: {
      mobile: {
        default: '2px',
        hover: '8px', // Reduced for performance
      },
      tablet: {
        default: '2px',
        hover: '10px',
      },
      desktop: {
        default: '2px',
        hover: '12px',
      },
    },
  },

  // Performance optimizations
  performance: {
    // Use reduced blur on low-end devices
    reduceBlurOnMobile: true,
    // GPU acceleration hints
    useGPUAcceleration: true,
    // Lazy load glass effects on low-end devices
    lazyLoadEffects: false, // Can be enabled for very low-end devices
  },

  // Touch-friendly alternatives (for devices without hover)
  touch: {
    // Active state scale (when tapped)
    activeScale: 0.98,
    // Touch feedback opacity
    activeOpacity: 0.9,
  },
};
