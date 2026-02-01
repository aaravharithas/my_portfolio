import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateCSSVariables, getCurrentTheme } from '../utils/themeUtils.js';

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    
    // Apply theme to DOM
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      updateCSSVariables('dark');
    } else {
      document.documentElement.classList.remove('dark');
      updateCSSVariables('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      updateCSSVariables('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      updateCSSVariables('light');
    }
  };

  const value = {
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme,
    mounted,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
