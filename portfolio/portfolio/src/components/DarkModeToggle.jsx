import React from "react";
import { motion } from "framer-motion";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext.jsx";
import { glassmorphic } from "../config/glassmorphic.js";
import { getGlassBackground, getGlassBorder, getGlassShadow } from "../utils/themeUtils.js";
import { theme } from "../config/theme.js";

export default function DarkModeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme();

  // Same colored conic gradient ring used on Siri orb / loading screen
  const conicRingGradient = "conic-gradient(from 0deg, #60A5FA, #A78BFA, #F472B6, #34D399, #FBBF24, #60A5FA)";

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className="ml-2 p-[3px] rounded-full"
        style={{ background: conicRingGradient }}
      >
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: getGlassBackground('button', 'light'),
            border: `1px solid ${getGlassBorder('button', 'light')}`,
            color: theme.colors.text.black.light,
          }}
          aria-label="Toggle dark mode"
          disabled
        >
          <HiMoon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const themeMode = isDark ? 'dark' : 'light';
  const iconColor = isDark ? '#ffffff' : '#171717';

  return (
    <motion.div
      className="ml-2 w-[42px] h-[42px] min-w-[42px] min-h-[42px] rounded-full flex-shrink-0 relative flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Colored changing ring - same conic gradient as orb / loading screen, with slow rotation */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: conicRingGradient }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      {/* Center mask so only the ring shows - opaque in both modes so gradient ring is visible, no gradient in center */}
      <div
        className="absolute inset-[3px] rounded-full pointer-events-none"
        style={{
          background: themeMode === 'light'
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(13,13,13,0.95)',
        }}
      />
      <motion.button
        onClick={toggleTheme}
        className="absolute inset-[3px] w-[36px] h-[36px] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: themeMode === 'light'
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(13,13,13,0.95)',
          backdropFilter: `blur(${glassmorphic.blur.sm})`,
          border: `1px solid ${getGlassBorder('elevated', themeMode)}`,
          boxShadow: getGlassShadow('button', themeMode),
        }}
        aria-label="Toggle dark mode"
      >
        <motion.span
          className="flex items-center justify-center"
          style={{
            color: iconColor,
            filter: !isDark ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : undefined,
          }}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isDark ? <HiSun className="w-5 h-5" aria-hidden /> : <HiMoon className="w-5 h-5" aria-hidden />}
        </motion.span>
      </motion.button>
    </motion.div>
  );
}