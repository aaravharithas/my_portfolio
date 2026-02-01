import React, { useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { theme } from "../config/theme.js";

const MIN_LOADER_DISPLAY_MS = 2000; // Minimum time loader is visible before button can show
const MAX_WAIT_BEFORE_BUTTON_MS = 5500; // Guarantee button shows after this even if progress stuck

export default function LoadingScreen({ onComplete, dataReady = false }) {
  // Safely get theme with fallback - use useContext directly with optional chaining
  const themeContext = useContext(ThemeContext);
  const themeMode = themeContext?.theme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loaderStartTime] = useState(() => Date.now());
  const [siriActive, setSiriActive] = useState(false);
  const siriAudioRef = useRef(null);
  const siriTimeoutRef = useRef(null);

  const phases = [
    "Starting up...",
    "Loading system components...",
    "Initializing portfolio...",
    "Ready to innovate!"
  ];

  useEffect(() => {
    // Cursor is handled by AppleCursor (ClientLayout) - one cursor for entire app including loading screen

    // Guarantee button shows after max wait (so it never stays hidden)
    const maxWaitTimer = setTimeout(() => {
      setLoadingProgress(100);
      setShowButton(true);
    }, MAX_WAIT_BEFORE_BUTTON_MS);

    // Simulate loading progress (data loads in background via PortfolioContext)
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = Math.random() * 2.5 + 1.5; // 1.5-4% increments for smoother steps
        const newProgress = Math.min(prev + increment, 100);
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, 180);

    return () => {
      clearTimeout(maxWaitTimer);
      clearInterval(progressInterval);
      if (siriTimeoutRef.current) clearTimeout(siriTimeoutRef.current);
    };
  }, []);

  // When API data is ready and min display time passed, show button (data loads in background)
  useEffect(() => {
    if (!dataReady) return;
    const elapsed = Date.now() - loaderStartTime;
    const remaining = Math.max(0, MIN_LOADER_DISPLAY_MS - elapsed);
    const t = setTimeout(() => {
      setLoadingProgress(100);
      setShowButton(true);
    }, remaining);
    return () => clearTimeout(t);
  }, [dataReady, loaderStartTime]);

  // Derive phase from progress (avoids stale closure in interval)
  const currentPhase = loadingProgress >= 90 ? 3 : loadingProgress >= 60 ? 2 : loadingProgress >= 25 ? 1 : 0;

  const handleAccessPortfolio = () => {
    setIsComplete(true);
    if (siriTimeoutRef.current) clearTimeout(siriTimeoutRef.current);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-0 z-[200] overflow-hidden"
        style={{
          background: theme.colors.background.primary[themeMode],
        }}
      >
        {/* Cursor: AppleCursor from ClientLayout is the single cursor for the whole app (loading + portfolio) */}

        {/* Center content: sphere + progress + button - centered horizontally and vertically */}
        <div className="absolute inset-0 flex items-center justify-center align-items-center">
        <motion.div
          className="flex flex-col items-center w-full max-w-sm px-4 sm:px-5"
          animate={
            loadingProgress >= 100 && showButton
              ? { y: -5 }
              : { y: 0 }
          }
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
        {/* Focal element - Siri-style orb (same as navbar) with click effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-5 sm:mb-6 md:mb-8 flex items-center justify-center"
        >
          <button
            className="flex items-center justify-center p-1 focus:outline-none cursor-pointer"
            onClick={async () => {
              if (siriTimeoutRef.current) {
                clearTimeout(siriTimeoutRef.current);
                siriTimeoutRef.current = null;
              }
              if (!siriActive) {
                setSiriActive(true);
                if (siriAudioRef.current) {
                  try {
                    await siriAudioRef.current.play();
                  } catch (e) {
                    /* Audio play failed, continue without sound */
                  }
                }
                siriTimeoutRef.current = setTimeout(() => {
                  siriTimeoutRef.current = null;
                  setSiriActive(false);
                }, 1600);
              } else {
                setSiriActive(false);
              }
            }}
            aria-label="Siri effect"
          >
            <motion.div
              initial={false}
              animate={siriActive ? {
                scale: [1, 1.3, 1.1, 1.2, 1],
                rotate: [0, 180, 360],
              } : {
                scale: [1, 1.08, 1.04, 1.06, 1],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: siriActive ? 1.5 : 4,
                repeat: siriActive ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: siriActive
                  ? 'conic-gradient(from 0deg, #60A5FA, #A78BFA, #F472B6, #34D399, #FBBF24, #60A5FA)'
                  : 'linear-gradient(135deg, rgba(96,165,250,0.35), rgba(167,139,250,0.3), rgba(244,114,182,0.2))',
                boxShadow: siriActive
                  ? '0 0 50px 25px rgba(96,165,250,0.4), 0 0 100px 50px rgba(167,139,250,0.25)'
                  : 'none',
              }}
            >
              {/* Central pulsing core */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                style={{
                  background: siriActive
                    ? 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                }}
                animate={siriActive ? {
                  scale: [1, 1.3, 0.95, 1.15, 1],
                  opacity: [0.8, 1, 0.9, 0.95, 0.8],
                } : {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  opacity: [0.7, 1, 0.8, 0.9, 0.7],
                }}
                transition={{
                  duration: siriActive ? 1.5 : 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeInOut",
                }}
              />

              {/* Outer ripple rings */}
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
                  style={{
                    width: `${(i + 2) * 12}px`,
                    height: `${(i + 2) * 12}px`,
                  }}
                  animate={siriActive ? {
                    scale: [1, 1.8, 1.3],
                    opacity: [0.8, 0.15, 0.5],
                  } : {
                    scale: [1, 1.5, 1.2],
                    opacity: [0.25, 0.08, 0.2],
                  }}
                  transition={{
                    duration: siriActive ? 1.2 : 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Rotating gradient overlay */}
              <motion.div
                className="absolute inset-0 rounded-full"
              style={{
                background: siriActive
                  ? 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)'
                  : 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: siriActive ? 1.5 : 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </button>
          {typeof window !== 'undefined' && (
            <audio ref={siriAudioRef} src="/siri-activate.mp3" preload="auto" />
          )}
        </motion.div>

        {/* Bootup Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center text-center w-full"
        >
          {/* Progress Bar */}
          <div 
            className="w-full max-w-sm mx-auto h-0.5 sm:h-1 rounded-full overflow-hidden mb-4 sm:mb-6"
            style={{
              background: themeMode === 'light' 
                ? 'rgba(0, 0, 0, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-infinite min-w-[2%]"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              style={{
                boxShadow: themeMode === 'light'
                  ? "0 0 10px rgba(37, 99, 235, 0.4)"
                  : "0 0 10px rgba(96, 165, 250, 0.4)"
              }}
            />
          </div>
          
          {/* Loading Text */}
          <motion.p
            key={currentPhase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-sm sm:text-base md:text-lg mb-2 font-extrabold gradient-text gradient-text-infinite"
            style={{
              fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            }}
          >
            {phases[currentPhase]}
          </motion.p>

          {/* Progress Percentage */}
          <motion.p
            className="text-sm sm:text-base md:text-lg font-bold gradient-text gradient-text-infinite"
            style={{
              fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            }}
          >
            {Math.round(loadingProgress)}%
          </motion.p>
        </motion.div>

        {/* Button - appears below progress, centered with sphere and progress */}
        {loadingProgress >= 100 && showButton && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mt-4 sm:mt-5 md:mt-6 flex justify-center w-full"
            >
              <motion.button
                onClick={handleAccessPortfolio}
                className="group relative px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-lg sm:rounded-xl font-bold overflow-hidden transition-all duration-300 text-xs sm:text-sm"
                style={{
                  background: themeMode === 'light'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: "blur(20px)",
                  border: themeMode === 'light'
                    ? '1px solid rgba(0, 0, 0, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: themeMode === 'light'
                    ? '0 8px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    : '0 8px 25px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  minHeight: "38px",
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: themeMode === 'light'
                    ? "0 12px 35px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                    : "0 12px 35px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
                  style={{
                    background: themeMode === 'light'
                      ? 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.2), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)'
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center font-bold">
                  <span className="gradient-text gradient-text-infinite font-extrabold">Enter Portfolio</span>
                  <motion.span
                    className="ml-2 gradient-text gradient-text-infinite font-extrabold"
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
        </div>

        {/* Completion overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 z-10"
              style={{
                background: theme.colors.background.primary[themeMode],
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}