/**
 * Centralized Theme Configuration
 * All color definitions for the portfolio application
 */

export const theme = {
  colors: {
    // Brand colors
    brand: {
      appleGray: '#f5f5f7',
      appleBlack: '#1d1d1f',
      appleBlue: '#0071e3',
      appleGradientStart: '#f5f5f7',
      appleGradientEnd: '#e5e9f2',
    },

    // Text colors
    text: {
      primary: {
        light: '#171717',
        dark: '#ededed',
      },
      secondary: {
        light: '#6b7280',
        dark: '#9ca3af',
      },
      tertiary: {
        light: '#9ca3af',
        dark: '#6b7280',
      },
      accent: {
        light: '#0071e3',
        dark: '#60a5fa',
      },
      black: {
        light: '#000000',
        dark: '#ffffff',
      },
      white: {
        light: '#ffffff',
        dark: '#000000',
      },
    },

    // Background colors
    background: {
      primary: {
        light: '#ffffff',
        dark: '#0a0a0a',
      },
      secondary: {
        light: '#f5f5f7',
        dark: '#1d1d1f',
      },
    },

    // Gradient colors
    gradients: {
      name: {
        mohammed: {
          light: ['#2563eb', '#7c3aed', '#ec4899'],
          dark: ['#60a5fa', '#a78bfa', '#f472b6'],
        },
        faheem: {
          light: ['#7c3aed', '#ec4899', '#2563eb'],
          dark: ['#a78bfa', '#f472b6', '#60a5fa'],
        },
      },
      orbs: {
        orb1: {
          light: ['#bfdbfe', '#e9d5ff', '#fce7f3'],
          dark: ['#60a5fa', '#a78bfa'],
        },
        orb2: {
          light: ['#fce7f3', '#bfdbfe', '#e9d5ff'],
          dark: ['#f472b6', '#60a5fa'],
        },
      },
      apple: {
        light: ['#f5f5f7', '#e5e9f2'],
        dark: ['#f5f5f7', '#e5e9f2'],
      },
    },

    // Component-specific colors
    buttons: {
      primary: {
        background: {
          light: 'rgba(255,255,255,0.1)',
          dark: 'rgba(255,255,255,0.1)',
        },
        border: {
          light: 'rgba(255,255,255,0.2)',
          dark: 'rgba(255,255,255,0.2)',
        },
        hover: {
          light: 'rgba(255,255,255,0.2)',
          dark: 'rgba(255,255,255,0.2)',
        },
      },
      secondary: {
        background: {
          light: 'rgba(0,0,0,0.2)',
          dark: 'rgba(255,255,255,0.1)',
        },
        border: {
          light: 'rgba(0,0,0,0.4)',
          dark: 'rgba(255,255,255,0.2)',
        },
        hover: {
          light: 'rgba(0,0,0,0.3)',
          dark: 'rgba(255,255,255,0.2)',
        },
      },
    },

    cards: {
      background: {
        light: 'rgba(255,255,255,0.7)',
        dark: 'rgba(255,255,255,0.1)',
      },
      border: {
        light: 'rgba(255,255,255,0.4)',
        dark: 'rgba(255,255,255,0.2)',
      },
      hover: {
        background: {
          light: 'rgba(255,255,255,0.8)',
          dark: 'rgba(255,255,255,0.15)',
        },
        border: {
          light: '#0071e3',
          dark: '#0071e3',
        },
      },
    },

    forms: {
      background: {
        light: 'rgba(0,0,0,0.2)',
        dark: 'rgba(255,255,255,0.1)',
      },
      border: {
        light: 'rgba(0,0,0,0.2)',
        dark: 'rgba(255,255,255,0.2)',
      },
      focus: {
        border: {
          light: '#0071e3',
          dark: '#0071e3',
        },
      },
    },

    badges: {
      background: {
        light: '#f3f4f6',
        dark: '#1f2937',
      },
      text: {
        light: '#6b7280',
        dark: '#6b7280',
      },
    },

    navigation: {
      dots: {
        active: {
          light: '#0071e3',
          dark: '#0071e3',
        },
        inactive: {
          light: '#d1d5db',
          dark: '#4b5563',
        },
        hover: {
          light: '#9ca3af',
          dark: '#6b7280',
        },
      },
    },

    // Icon colors
    icons: {
      social: {
        light: '#000000',
        dark: '#ffffff',
      },
      hover: {
        light: '#0071e3',
        dark: '#60a5fa',
      },
    },

    // Gray scale for text and backgrounds
    gray: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
    },
  },
};
