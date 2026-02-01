import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { theme } from "../config/theme.js";
import GlassButton from "./GlassButton.jsx";
import SplitText from "./react-bits/SplitText.jsx";

// Constants for maintainability and viewport consistency
const GREETING_INTERVAL_MS = 2000;
const GREETING_MIN_WIDTH_PX = 150;
const DEFAULT_DESCRIPTION =
  "Crafting elegant digital experiences with code, design, and a touch of magic. I transform complex challenges into beautiful, functional solutions that drive results.";

const greetings = [
  "Hello",
  "Hola",
  "Bonjour",
  "Hallo",
  "Ciao",
  "こんにちは",
  "안녕하세요",
  "Привет",
  "مرحبا",
  "नमस्ते",
  "你好",
  "Olá",
  "ഹലോ", // Malayalam
  "வணக்கம்", // Tamil
  "నమస్కారం", // Telugu
];

export default function HeroSection() {
  const { theme: themeMode } = useTheme();
  const { portfolioData } = usePortfolio();
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length);
    }, GREETING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const firstName = portfolioData?.firstName ?? portfolioData?.name?.split(" ")[0] ?? "";
  const lastName = portfolioData?.lastName ?? portfolioData?.name?.split(" ").slice(1).join(" ") ?? "";
  const title = portfolioData?.title ?? "";
  const description =
    portfolioData?.tagline ??
    portfolioData?.description ??
    portfolioData?.bio ??
    (portfolioData?.aboutMe?.trim() || undefined) ??
    DEFAULT_DESCRIPTION;

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="w-full flex flex-col justify-center items-start text-left relative px-4 max-w-7xl mx-auto pt-20 sm:pt-24 md:pt-24 lg:pt-28 min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-6rem)] lg:min-h-[calc(100dvh-7rem)]"
    >
      <motion.div
        className="z-10 flex flex-1 min-h-0 w-full flex-col justify-center items-start overflow-visible"
        initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      >
      <div className="z-10 flex flex-col items-start w-full min-h-0 max-w-full">
        {/* Animated Hello in multiple languages */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-6 md:mb-8 h-12 flex items-center"
          style={{
            minWidth: `${GREETING_MIN_WIDTH_PX}px`,
            display: "inline-flex",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentGreeting}
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl font-medium dark:text-white whitespace-nowrap"
              style={{ color: themeMode === "light" ? "#000000" : undefined }}
            >
              {greetings[currentGreeting]}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        {/* Main heading - Your Name with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-none tracking-tight">
            <motion.span
              className="block gradient-text gradient-text-infinite"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {firstName}
            </motion.span>
            <motion.span
              className="block gradient-text gradient-text-infinite"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {lastName}
            </motion.span>
          </h1>
        </motion.div>

        {/* Role/Title - React Bits style split text */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-8 md:mb-12"
        >
          <SplitText
            tag="h2"
            text={title}
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold dark:text-white"
            style={{ color: themeMode === "light" ? "#000000" : undefined }}
            splitType="chars"
            delay={80}
            duration={0.7}
            from={{ opacity: 0, y: 36, scale: 0.85 }}
            to={{ opacity: 1, y: 0, scale: 1 }}
            reduceMotion={reduceMotion}
            textAlign="left"
          />
        </motion.div>

        {/* Description - from API (tagline/description/bio) or fallback */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mb-12 max-w-2xl"
        >
          <p
            className="text-lg md:text-xl leading-relaxed font-bold"
            style={{
              color:
                themeMode === "light" ? "#000000" : theme.colors.text.secondary[themeMode],
            }}
          >
            {description}
          </p>
        </motion.div>

        {/* CTA Buttons - shared GlassButton, no negative margin */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-4 relative z-20"
        >
          <GlassButton href="#projects" themeMode={themeMode} reduceMotion={reduceMotion}>
            View My Work
          </GlassButton>
          <GlassButton href="#contact" themeMode={themeMode} reduceMotion={reduceMotion}>
            Get In Touch
          </GlassButton>
        </motion.div>
      </div>
      </motion.div>
    </section>
  );
}
