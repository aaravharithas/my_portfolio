import React from "react";
import { motion } from "framer-motion";
import { getGlassStyle, getLiquidGlassGradient, getGlassShadow } from "../utils/themeUtils.js";
import { theme } from "../config/theme.js";

const PARTICLE_COUNT = 6;

const BUTTON_PARTICLE_COLORS_LIGHT = [
  "rgba(96,165,250,0.5)",
  "rgba(167,139,250,0.5)",
  "rgba(244,114,182,0.5)",
  "rgba(96,165,250,0.5)",
  "rgba(167,139,250,0.5)",
  "rgba(244,114,182,0.5)",
];

const BUTTON_PARTICLE_COLORS_DARK = [
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.4)",
];

export default function GlassButton({ href, children, themeMode, reduceMotion = false }) {
  const particleColors =
    themeMode === "light" ? BUTTON_PARTICLE_COLORS_LIGHT : BUTTON_PARTICLE_COLORS_DARK;

  return (
    <motion.a
      href={href}
      whileHover={{
        scale: 1.05,
        boxShadow: getGlassShadow("buttonHover", themeMode),
      }}
      whileTap={{
        scale: 0.96,
        boxShadow: getGlassShadow("button", themeMode),
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className="group relative inline-block px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 font-semibold text-sm sm:text-base md:text-lg rounded-2xl sm:rounded-3xl overflow-hidden"
      style={{
        ...getGlassStyle({
          background: "button",
          border: "base",
          blur: "lg",
          shadow: "button",
          theme: themeMode,
        }),
      }}
    >
      {/* Liquid effect background - theme-aware */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"
        style={{
          background: getLiquidGlassGradient("gradient1", themeMode),
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                background: [
                  getLiquidGlassGradient("gradient1", themeMode),
                  getLiquidGlassGradient("gradient2", themeMode),
                  getLiquidGlassGradient("gradient3", themeMode),
                  getLiquidGlassGradient("gradient1", themeMode),
                ],
              }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles - theme-aware (skipped when reduceMotion) */}
      {!reduceMotion && (
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
          {[...Array(PARTICLE_COUNT)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 40}%`,
                backgroundColor: particleColors[i],
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: themeMode === "light" ? [0.5, 0.9, 0.5] : [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      <span className="relative z-10 gradient-text gradient-text-infinite">
        {children}
      </span>
    </motion.a>
  );
}
