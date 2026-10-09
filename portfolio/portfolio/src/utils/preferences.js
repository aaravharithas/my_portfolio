import { isValidPreference } from '../config/appearance.js';

export function readPreferences(storage, prefersDark = false) {
  const defaults = { designTheme: 'clay', colorMode: prefersDark ? 'dark' : 'light' };
  try {
    const saved = JSON.parse(storage?.getItem('portfolio-appearance') || '{}');
    defaults.colorMode = isValidPreference('colorMode', storage?.getItem('theme'))
      ? storage.getItem('theme') : defaults.colorMode;
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
      [key, isValidPreference(key, saved?.[key]) ? saved[key] : value]));
  } catch {
    return defaults;
  }
}

export function loadPreferences() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  try {
    return readPreferences(window.localStorage, prefersDark);
  } catch {
    return readPreferences(null, prefersDark);
  }
}

export function applyPreferences(preferences, systemReducedMotion) {
  const root = document.documentElement;
  root.dataset.design = preferences.designTheme;
  root.dataset.mode = preferences.colorMode;
  root.dataset.motion = systemReducedMotion ? 'reduced' : 'full';
  root.classList.toggle('dark', preferences.colorMode === 'dark');
  root.style.colorScheme = preferences.colorMode;
}

export function savePreferences(preferences) {
  try {
    window.localStorage.setItem('portfolio-appearance', JSON.stringify(preferences));
  } catch {
    // Appearance remains usable when browser storage is unavailable.
  }
}
