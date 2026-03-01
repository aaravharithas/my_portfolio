import React from "react";
import { motion } from "framer-motion";
import { getGlassStyle, getGlassShadow } from "../utils/themeUtils.js";

export default function GlassButton({ href, children, themeMode }) {
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
      {/* Liquid effect background — CSS-driven (GPU compositor, no JS cost) */}
      <div
        aria-hidden
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl ${themeMode === "light" ? "liquid-glass-anim-light" : "liquid-glass-anim"}`}
      />

      <span className="relative z-10 gradient-text gradient-text-infinite">
        {children}
      </span>
    </motion.a>
  );
}
