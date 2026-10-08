import { useEffect, useLayoutEffect, useState } from 'react';
import { isValidPreference } from '../config/appearance.js';
import { ThemeContext } from './themeState.js';
import { applyPreferences, loadPreferences, savePreferences } from '../utils/preferences.js';

export function ThemeProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event) => setSystemReducedMotion(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    applyPreferences(preferences, systemReducedMotion);
    savePreferences(preferences);
  }, [preferences, systemReducedMotion]);

  const value = {
    ...preferences,
    systemReducedMotion,
    reducedMotion: systemReducedMotion || preferences.effects === 'reduced',
    setPreference: (key, value) => {
      if (isValidPreference(key, value)) setPreferences((p) => ({ ...p, [key]: value }));
    },
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
