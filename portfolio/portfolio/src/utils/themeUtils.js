/**
 * Theme Utility Functions
 * Helper functions for working with theme values
 */

import { theme } from '../config/theme.js';
import { glassmorphic } from '../config/glassmorphic.js';
import { getDeviceType, getDeviceAwareBlur } from './responsiveUtils.js';

/**
 * Get current theme mode (light or dark)
 * @returns {string} 'light' or 'dark'
 */
export const getCurrentTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

/**
 * Get theme-aware color value
 * @param {Object} colorObj - Color object with light and dark properties
 * @param {string} theme - Theme mode ('light' or 'dark'), defaults to current theme
 * @returns {string} Color value
 */
export const getThemeColor = (colorObj, themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  if (typeof colorObj === 'string') return colorObj;
  return colorObj[currentTheme] || colorObj.light || colorObj;
};

/**
 * Get glassmorphic background color
 * @param {string} variant - Background variant (base, elevated, card, etc.)
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 * @returns {string} Background color with opacity
 */
export const getGlassBackground = (variant = 'base', themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  return glassmorphic.background[currentTheme]?.[variant] || glassmorphic.background.light.base;
};

/**
 * Get glassmorphic border color
 * @param {string} variant - Border variant (base, elevated, card, etc.)
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 * @returns {string} Border color with opacity
 */
export const getGlassBorder = (variant = 'base', themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  return glassmorphic.borders[currentTheme]?.[variant] || glassmorphic.borders.light.base;
};

/**
 * Get glassmorphic style object for inline styles
 * @param {Object} options - Style options
 * @param {string} options.background - Background variant
 * @param {string} options.border - Border variant
 * @param {string} options.blur - Blur variant (xs, sm, md, lg, xl)
 * @param {string} options.shadow - Shadow variant
 * @param {string} options.theme - Theme mode
 * @returns {Object} Style object
 */
/**
 * Get theme-specific shadow
 * @param {string} variant - Shadow variant (glass, button, card, navbar, etc.)
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 * @returns {string} Shadow value
 */
export const getGlassShadow = (variant = 'glass', themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  // Check if theme-specific shadows exist
  if (glassmorphic.shadows[currentTheme]?.[variant]) {
    return glassmorphic.shadows[currentTheme][variant];
  }
  // Fallback to legacy shadows
  return glassmorphic.shadows[variant] || glassmorphic.shadows.glass;
};

/**
 * Get theme-specific liquid glass gradient
 * @param {string} variant - Gradient variant (gradient1, gradient2, gradient3)
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 * @returns {string} Gradient string
 */
export const getLiquidGlassGradient = (variant = 'gradient1', themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  if (currentTheme === 'light' && glassmorphic.liquidGlass.gradientsLight?.[variant]) {
    return glassmorphic.liquidGlass.gradientsLight[variant];
  }
  return glassmorphic.liquidGlass.gradients[variant] || glassmorphic.liquidGlass.gradients.gradient1;
};

/**
 * Get device-aware blur value
 * @param {string} blurSize - Blur size (xs, sm, md, lg, xl)
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop'), optional
 * @returns {string} Blur value in pixels
 */
export const getDeviceAwareBlurValue = (blurSize = 'md', deviceType = null) => {
  const device = deviceType || getDeviceType();
  // Use device-aware blur if available, otherwise fall back to base blur
  if (glassmorphic.blurDevice?.[device]?.[blurSize]) {
    return glassmorphic.blurDevice[device][blurSize];
  }
  return glassmorphic.blur[blurSize] || glassmorphic.blur.md;
};

export const getGlassStyle = ({
  background = 'base',
  border = 'base',
  blur = 'md',
  shadow = 'glass',
  theme: themeMode = null,
  deviceType = null,
} = {}) => {
  const currentTheme = themeMode || getCurrentTheme();
  const blurValue = getDeviceAwareBlurValue(blur, deviceType);
  return {
    background: getGlassBackground(background, currentTheme),
    border: `1px solid ${getGlassBorder(border, currentTheme)}`,
    backdropFilter: `blur(${blurValue})`,
    WebkitBackdropFilter: `blur(${blurValue})`,
    boxShadow: getGlassShadow(shadow, currentTheme),
  };
};

/**
 * Get gradient string from array
 * @param {Array} colors - Array of color values
 * @param {number} angle - Gradient angle in degrees
 * @returns {string} CSS gradient string
 */
export const getGradient = (colors, angle = 135) => {
  if (!Array.isArray(colors) || colors.length === 0) return 'transparent';
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
};

/**
 * Get name gradient colors
 * @param {string} name - 'mohammed' or 'faheem'
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 * @returns {Array} Array of color values
 */
export const getNameGradient = (name, themeMode = null) => {
  const currentTheme = themeMode || getCurrentTheme();
  const gradient = theme.colors.gradients.name[name];
  if (!gradient) return theme.colors.gradients.name.mohammed[currentTheme];
  return gradient[currentTheme] || gradient.light;
};

/**
 * Get liquid glass gradient colors
 * @param {boolean} light - Use light variant
 * @returns {Array} Array of color values
 */
export const getLiquidGlassColors = (light = false) => {
  return light ? glassmorphic.liquidGlass.colorsLight : glassmorphic.liquidGlass.colors;
};

/**
 * Update CSS variables based on theme
 * @param {string} themeMode - Theme mode ('light' or 'dark')
 */
export const updateCSSVariables = (themeMode) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const isDark = themeMode === 'dark';
  
  // Update background and foreground
  root.style.setProperty('--background', isDark ? theme.colors.background.primary.dark : theme.colors.background.primary.light);
  root.style.setProperty('--foreground', isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light);
  
  // Update other CSS variables as needed
  root.style.setProperty('--color-background', isDark ? theme.colors.background.primary.dark : theme.colors.background.primary.light);
  root.style.setProperty('--color-foreground', isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light);
};
